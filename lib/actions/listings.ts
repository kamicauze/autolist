'use server'

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAction } from "@/lib/admin/guard";
import { getSellerPackageAccessForUser } from "@/lib/data/membership";
import { revalidatePath } from "next/cache";
import { uploadListingImageAssets } from "@/lib/server/listing-image-pipeline";
import { buildListingTitle, emitNotificationEvent } from "@/lib/server/notifications";
import { buildListingDetailMetadata, getListingMetadataDetails } from "@/lib/utils/listing-details";
import { getStorageObjectUrl } from "@/lib/utils/listings";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

import { LISTING_STATUS_META, type ListingStatus } from "@/lib/constants/marketplace";
import { listingSchema, type ListingFormData } from "@/lib/validations/listing";
import { type SupabaseClient } from "@supabase/supabase-js";

export type CreateListingInput = {
    make: string;
    model: string;
    trim?: string;
    variant?: string;
    year: number;
    price: number;
    currency?: string;
    mileage?: number;
    description: string;
    features: string[]; // JSONB in DB
    condition: 'new' | 'locally_used' | 'foreign_used';
    body_type?: string;
    transmission?: string;
    fuel_type?: string;
    color?: string;
    seats?: number;
    doors?: number;
    drive_type?: string;
    details?: Record<string, string>;
    category?: "car" | "van" | "motorbike" | "truck" | "plant_construction" | "farm_agricultural";
    country?: string;
    cityTown?: string;
    locationArea?: string;
    availability?: "available" | "reserved" | "sold";
    negotiable?: boolean;
    tradeInAccepted?: boolean;
    documentNames?: string[];
    videoUrl?: string;
    sellerType?: "dealer" | "individual";
    useDealerAutoFill?: boolean;
    contactName?: string;
    phoneNumber?: string;
    whatsappEnabled?: boolean;
    whatsappNumber?: string;
    allowPhoneCalls?: boolean;
    hidePhoneNumber?: boolean;
};

type UploadedListingDocument = {
    name: string;
    url: string;
    key: string;
    contentType: string;
    size: number;
};

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024;
const IMAGE_ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_ACCEPTED_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
]);
const VIDEO_ACCEPTED_TYPES = new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v",
]);
const STRING_METADATA_FIELDS = [
    "category",
    "country",
    "cityTown",
    "locationArea",
    "availability",
    "videoUrl",
    "sellerType",
    "contactName",
    "phoneNumber",
    "whatsappNumber",
] as const;
const BOOLEAN_METADATA_FIELDS = [
    "negotiable",
    "tradeInAccepted",
    "useDealerAutoFill",
    "whatsappEnabled",
    "allowPhoneCalls",
    "hidePhoneNumber",
] as const;

type AdminCapableRole = "admin" | "super_admin";
type EditableListingRecord = {
    id: string;
    seller_id: string;
    dealer_id: string | null;
    status: ListingStatus;
    make: string;
    model: string;
    year: number;
    metadata: Record<string, unknown> | null;
};

function toMetadataObject(metadata: unknown) {
    return metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? { ...(metadata as Record<string, unknown>) }
        : {};
}

async function getProfileRole(
    supabase: SupabaseClient,
    userId: string,
): Promise<AdminCapableRole | "buyer" | "seller" | "dealer" | "sales_agent" | "support" | null> {
    const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle<{ role: AdminCapableRole | "buyer" | "seller" | "dealer" | "sales_agent" | "support" | null }>();

    return data?.role ?? null;
}

async function getEditableListingAccess(
    supabase: SupabaseClient,
    userId: string,
    listingId: string,
) {
    const { data: listing, error } = await supabase
        .from("listings")
        .select("id, seller_id, dealer_id, status, make, model, year, metadata")
        .eq("id", listingId)
        .maybeSingle<EditableListingRecord>();

    if (error || !listing) {
        return { error: error?.message || "Listing not found." } as const;
    }

    if (listing.seller_id === userId) {
        return { listing, canAdminister: false } as const;
    }

    const role = await getProfileRole(supabase, userId);
    if (role === "admin" || role === "super_admin") {
        return { listing, canAdminister: true } as const;
    }

    return { error: "Listing not found or not editable." } as const;
}

function revalidateListingPaths(id: string) {
    revalidatePath("/admin/listings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath(`/dashboard/listings/${id}/edit`);
    revalidatePath("/search");
    revalidatePath(`/vehicle/${id}`);
}

function formatListingStatusLabel(status: ListingStatus) {
    return LISTING_STATUS_META[status]?.label || status;
}

async function emitListingStatusNotification(input: {
    actorId: string;
    listing: EditableListingRecord;
    status: ListingStatus;
    reason?: string | null;
}) {
    if (!input.listing.seller_id) {
        return;
    }

    const title = buildListingTitle(input.listing);
    const statusLabel = formatListingStatusLabel(input.status);
    const reasonText = input.reason?.trim();

    await emitNotificationEvent({
        eventType: "listing_status_changed",
        actorId: input.actorId,
        listingId: input.listing.id,
        payload: {
            status: input.status,
            reason: reasonText || null,
        },
        deliveries: [
            {
                recipientId: input.listing.seller_id,
                title: `${title} status updated`,
                body: reasonText
                    ? `Your listing is now ${statusLabel}. Reason: ${reasonText}`
                    : `Your listing is now ${statusLabel}.`,
                href: `/dashboard/listings/${input.listing.id}/edit`,
                metadata: {
                    status: input.status,
                    reason: reasonText || null,
                },
            },
        ],
    });
}

async function emitListingUpdatedNotification(input: {
    actorId: string;
    listing: EditableListingRecord;
    summary: string;
}) {
    if (!input.listing.seller_id || input.listing.seller_id === input.actorId) {
        return;
    }

    const title = buildListingTitle(input.listing);

    await emitNotificationEvent({
        eventType: "listing_updated",
        actorId: input.actorId,
        listingId: input.listing.id,
        payload: {
            summary: input.summary,
        },
        deliveries: [
            {
                recipientId: input.listing.seller_id,
                title: `${title} was updated by admin`,
                body: input.summary,
                href: `/dashboard/listings/${input.listing.id}/edit`,
                metadata: {
                    summary: input.summary,
                },
            },
        ],
    });
}

function buildModerationMetadata(
    metadata: Record<string, unknown> | null,
    input: {
        nextStatus: ListingStatus;
        actorId: string;
        reason?: string | null;
    },
) {
    const nextMetadata = toMetadataObject(metadata);
    const trimmedReason = input.reason?.trim() || null;

    nextMetadata.last_status_change = input.nextStatus;
    nextMetadata.last_status_changed_at = new Date().toISOString();
    nextMetadata.last_status_changed_by = input.actorId;

    if (trimmedReason) {
        nextMetadata.status_change_reason = trimmedReason;
    } else {
        delete nextMetadata.status_change_reason;
    }

    if (input.nextStatus === "rejected" && trimmedReason) {
        nextMetadata.rejection_reason = trimmedReason;
    }

    return nextMetadata;
}

function hammingDistance(left: string, right: string) {
    if (!left || !right || left.length !== right.length) {
        return Number.POSITIVE_INFINITY;
    }

    let distance = 0;
    for (let index = 0; index < left.length; index += 1) {
        const xor = Number.parseInt(left[index], 16) ^ Number.parseInt(right[index], 16);
        distance += xor.toString(2).replace(/0/g, "").length;
    }

    return distance;
}

function parsePerceptualHashes(value: string | null | undefined) {
    return (value || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
}

function extensionForFile(file: File) {
    if (file.name.includes(".")) {
        return file.name.slice(file.name.lastIndexOf("."));
    }
    const subtype = file.type.split("/")[1];
    return subtype ? `.${subtype}` : "";
}

function sanitizeFileName(fileName: string) {
    return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

async function uploadListingFile(
    listingId: string,
    file: File,
) {
    if (!IMAGE_ACCEPTED_TYPES.has(file.type)) {
        throw new Error(`"${file.name}" must be a JPG, PNG, or WebP image.`);
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error(`"${file.name}" exceeds the 10MB upload limit.`);
    }

    const extension = extensionForFile(file);
    const baseName = extension ? file.name.slice(0, -extension.length) : file.name;
    const bytes = Buffer.from(await file.arrayBuffer());
    return uploadListingImageAssets({
        listingId,
        fileName: `${baseName}${extension}`,
        bytes,
        contentType: file.type || "application/octet-stream",
    });
}

function applySupplementalListingMetadata(
    metadata: Record<string, unknown>,
    input: Partial<CreateListingInput>,
) {
    for (const field of STRING_METADATA_FIELDS) {
        const value = input[field];
        if (typeof value !== "string") {
            continue;
        }

        const normalized = value.trim();
        if (normalized) {
            metadata[field] = normalized;
        } else {
            delete metadata[field];
        }
    }

    for (const field of BOOLEAN_METADATA_FIELDS) {
        const value = input[field];
        if (typeof value === "boolean") {
            metadata[field] = value;
        }
    }

    if (input.documentNames !== undefined) {
        const documentNames = Array.isArray(input.documentNames)
            ? input.documentNames
                .map((name) => (typeof name === "string" ? name.trim() : ""))
                .filter(Boolean)
            : [];

        if (documentNames.length > 0) {
            metadata.documentNames = documentNames;
        } else {
            delete metadata.documentNames;
        }
    }

    return metadata;
}

export async function createListing(input: ListingFormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const packageAccessResult = await getSellerPackageAccessForUser(supabase, user.id);
    if (packageAccessResult.error) {
        return { error: packageAccessResult.error };
    }

    if (!packageAccessResult.access.hasActivePlan) {
        return {
            error: "Choose a seller package before creating a new listing.",
        };
    }

    if (!packageAccessResult.access.canCreateListing) {
        const currentPlanName = packageAccessResult.access.currentPlan?.name || "current";
        return {
            error: `Your ${currentPlanName} package has no listing slots left. Upgrade or switch package to add another listing.`,
        };
    }

    // Check if the user is a dealer and fetch their dealer record
    const { data: dealer } = await supabase
        .from('dealers')
        .select('id, status')
        .eq('profile_id', user.id)
        .maybeSingle();

    const dealerId = dealer?.id ?? null;
    const isVerifiedDealer = dealer?.status === 'APPROVED';

    const result = await insertListingInternal(supabase, user.id, input, dealerId);
    if ('error' in result) return result;
    return { ...result, isVerifiedDealer };
}

// Internal function to allow seeding/admin usage
export async function insertListingInternal(
    supabase: SupabaseClient,
    userId: string,
    input: ListingFormData,
    dealerId?: string | null,
) {
    // 1. Validation
    const result = listingSchema.safeParse(input);
    if (!result.success) {
        return { error: result.error.flatten() };
    }
    const data = result.data;
    const {
        trim,
        variant,
        details,
        seats,
        doors,
        drive_type,
        category,
        country,
        cityTown,
        locationArea,
        availability,
        negotiable,
        tradeInAccepted,
        documentNames,
        videoUrl,
        sellerType,
        useDealerAutoFill,
        contactName,
        phoneNumber,
        whatsappEnabled,
        whatsappNumber,
        allowPhoneCalls,
        hidePhoneNumber,
        ...listingValues
    } = data;
    const normalizedDetails = buildListingDetailMetadata({
        ...details,
        make: data.make,
        model: data.model,
        trim,
        variant,
        year: String(data.year),
        mileage: data.mileage != null ? String(data.mileage) : undefined,
        bodyType: data.body_type,
        transmission: data.transmission,
        fuelType: data.fuel_type,
        color: data.color,
        seats: seats != null ? String(seats) : undefined,
        doors: doors != null ? String(doors) : undefined,
        driveType: drive_type,
    });
    const vehicleReferenceMetadata = applySupplementalListingMetadata({
        ...(trim ? { trim } : {}),
        ...(variant ? { variant } : {}),
        ...(Object.keys(normalizedDetails).length > 0 ? { details: normalizedDetails } : {}),
    }, {
        category,
        country,
        cityTown,
        locationArea,
        availability,
        negotiable,
        tradeInAccepted,
        documentNames,
        videoUrl,
        sellerType,
        useDealerAutoFill,
        contactName,
        phoneNumber,
        whatsappEnabled,
        whatsappNumber,
        allowPhoneCalls,
        hidePhoneNumber,
    });

    // 2. Duplicate Detection (MVP)
    // Check if the user already has a listing for this exact vehicle (Make + Model + Year + Price within 1%)
    // This prevents accidental double-clicks or spam.
    const { data: potentialDuplicates } = await supabase
        .from('listings')
        .select('id, price')
        .eq('seller_id', userId)
        .eq('make', data.make)
        .eq('model', data.model)
        .eq('year', data.year)
        .neq('status', 'removed') // Ignore deleted listings
        .neq('status', 'sold');   // Ignore sold listings (they might be selling another one)

    if (potentialDuplicates && potentialDuplicates.length > 0) {
        // Check price similarity (within 1%)
        const isDuplicate = potentialDuplicates.some(existing => {
            const priceDiff = Math.abs(existing.price - data.price);
            const percentDiff = priceDiff / existing.price;
            return percentDiff < 0.01; // < 1% difference
        });

        if (isDuplicate) {
            return { error: "You already have a listing for this vehicle. Please update the existing listing or check your drafts." };
        }
    }

    // 3. Determine Initial Status
    // All listings start as 'draft' until images are uploaded and user publishes.
    const initialStatus = 'draft';

    // 4. Insert Listing
    const { data: listing, error } = await supabase
        .from('listings')
        .insert({
            seller_id: userId,
            dealer_id: dealerId ?? null,
            status: initialStatus,
            ...listingValues,
            seats: seats ?? null,
            doors: doors ?? null,
            drive_type: drive_type || null,
            metadata: Object.keys(vehicleReferenceMetadata).length > 0 ? vehicleReferenceMetadata : null,
            features: data.features // Zod array -> JSONB
        })
        .select()
        .single();

    if (error) {
        console.error("Create Listing Error:", error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/listings');
    return { success: true, data: listing };
}

export async function updateListing(id: string, input: Partial<CreateListingInput>) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const access = await getEditableListingAccess(supabase, user.id, id);
    if ("error" in access) {
        return { error: access.error };
    }
    const existingListing = access.listing;
    const writeSupabase = access.canAdminister ? createAdminClient() : supabase;

    const {
        trim,
        variant,
        details,
        seats,
        doors,
        drive_type,
        category,
        country,
        cityTown,
        locationArea,
        availability,
        negotiable,
        tradeInAccepted,
        documentNames,
        videoUrl,
        sellerType,
        useDealerAutoFill,
        contactName,
        phoneNumber,
        whatsappEnabled,
        whatsappNumber,
        allowPhoneCalls,
        hidePhoneNumber,
        ...listingValues
    } = input;

    const nextMetadata = {
        ...((existingListing.metadata && typeof existingListing.metadata === "object") ? existingListing.metadata : {}),
    } as Record<string, unknown>;
    const existingDetails = getListingMetadataDetails({ metadata: existingListing.metadata });

    if (trim === undefined) {
        // keep existing metadata
    } else if (trim) {
        nextMetadata.trim = trim;
    } else {
        delete nextMetadata.trim;
    }

    if (variant === undefined) {
        // keep existing metadata
    } else if (variant) {
        nextMetadata.variant = variant;
    } else {
        delete nextMetadata.variant;
    }

    if (details !== undefined || seats !== undefined || doors !== undefined || drive_type !== undefined) {
        const nextDetails = buildListingDetailMetadata({
            ...existingDetails,
            ...(details ?? {}),
            make: typeof input.make === "string" ? input.make : existingDetails.make,
            model: typeof input.model === "string" ? input.model : existingDetails.model,
            trim: trim === undefined ? existingDetails.trim : trim,
            variant: variant === undefined ? existingDetails.variant : variant,
            year:
                typeof input.year === "number"
                    ? String(input.year)
                    : existingDetails.year,
            mileage:
                typeof input.mileage === "number"
                    ? String(input.mileage)
                    : input.mileage === null
                        ? undefined
                        : existingDetails.mileage,
            bodyType:
                typeof input.body_type === "string"
                    ? input.body_type
                    : existingDetails.bodyType,
            transmission:
                typeof input.transmission === "string"
                    ? input.transmission
                    : existingDetails.transmission,
            fuelType:
                typeof input.fuel_type === "string"
                    ? input.fuel_type
                    : existingDetails.fuelType,
            color:
                typeof input.color === "string"
                    ? input.color
                    : existingDetails.color,
            seats:
                typeof seats === "number"
                    ? String(seats)
                    : existingDetails.seats,
            doors:
                typeof doors === "number"
                    ? String(doors)
                    : existingDetails.doors,
            driveType:
                typeof drive_type === "string"
                    ? drive_type
                    : existingDetails.driveType,
        });

        if (Object.keys(nextDetails).length > 0) {
            nextMetadata.details = nextDetails;
        } else {
            delete nextMetadata.details;
        }
    }

    applySupplementalListingMetadata(nextMetadata, {
        category,
        country,
        cityTown,
        locationArea,
        availability,
        negotiable,
        tradeInAccepted,
        documentNames,
        videoUrl,
        sellerType,
        useDealerAutoFill,
        contactName,
        phoneNumber,
        whatsappEnabled,
        whatsappNumber,
        allowPhoneCalls,
        hidePhoneNumber,
    });

    const { error } = await writeSupabase
        .from('listings')
        .update({
            ...listingValues,
            ...(seats !== undefined ? { seats: seats ?? null } : {}),
            ...(doors !== undefined ? { doors: doors ?? null } : {}),
            ...(drive_type !== undefined ? { drive_type: drive_type || null } : {}),
            metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidateListingPaths(id);
    if (access.canAdminister) {
        await emitListingUpdatedNotification({
            actorId: user.id,
            listing: existingListing,
            summary: "An admin updated the listing details on your behalf.",
        });
    }
    return { success: true };
}

export async function deleteListing(id: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/listings');
    revalidatePath('/search');
    revalidatePath(`/vehicle/${id}`);
    return { success: true };
}

export async function updateOwnerListingStatus(
    id: string,
    status: "draft" | "reserved" | "sold" | "expired"
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id")
        .eq("id", id)
        .eq("seller_id", user.id)
        .maybeSingle();

    if (listingError || !listing) {
        return { error: listingError?.message || "Listing not found." };
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
        .from("listings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("seller_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath("/search");
    revalidatePath(`/vehicle/${id}`);
    return { success: true };
}

export async function setListingFeatured(id: string, isFeatured: boolean) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return adminContext;

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("listings")
        .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/listings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath("/search");
    revalidatePath(`/vehicle/${id}`);
    return { success: true };
}

export async function setOwnerListingFeatured(id: string, isFeatured: boolean) {
    return setListingFeatured(id, isFeatured);
}

export async function updateAdminListingStatus(
    id: string,
    status: ListingStatus,
    options?: { reason?: string | null },
) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return adminContext;

    if (!(status in LISTING_STATUS_META)) {
        return { error: "Invalid listing status." };
    }

    const { user } = adminContext;
    const supabase = createAdminClient();
    const trimmedReason = String(options?.reason || "").trim();

    if ((status === "rejected" || status === "reserved") && !trimmedReason) {
        return { error: `A reason is required when marking a listing as ${status === "reserved" ? "on hold" : "rejected"}.` };
    }

    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id, seller_id, dealer_id, status, make, model, year, metadata")
        .eq("id", id)
        .maybeSingle<EditableListingRecord>();

    if (listingError || !listing) {
        return { error: listingError?.message || "Listing not found." };
    }

    const { error } = await supabase
        .from("listings")
        .update({
            status,
            metadata: buildModerationMetadata(listing.metadata, {
                nextStatus: status,
                actorId: user.id,
                reason: trimmedReason || null,
            }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidateListingPaths(id);
    await emitListingStatusNotification({
        actorId: user.id,
        listing,
        status,
        reason: trimmedReason || null,
    });
    return { success: true };
}

export async function deleteAdminListing(id: string) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return adminContext;

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/listings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath("/search");
    revalidatePath(`/vehicle/${id}`);
    return { success: true };
}

export async function duplicateOwnerListing(id: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select(`
            *,
            images:listing_images(r2_key, alt_text, image_order, image_hash, perceptual_hash, is_watermarked)
        `)
        .eq("id", id)
        .eq("seller_id", user.id)
        .maybeSingle();

    if (listingError || !listing) {
        return { error: listingError?.message || "Listing not found." };
    }

    const {
        id: _id,
        created_at: _createdAt,
        updated_at: _updatedAt,
        images,
        seller,
        dealer,
        status: _status,
        is_featured: _isFeatured,
        ...copyValues
    } = listing as Record<string, unknown> & {
        images?: Array<{
            r2_key: string;
            alt_text: string | null;
            image_order: number;
            image_hash?: string | null;
            perceptual_hash?: string | null;
            is_watermarked?: boolean | null;
        }>;
    };
    void _id;
    void _createdAt;
    void _updatedAt;
    void seller;
    void dealer;
    void _status;
    void _isFeatured;

    const { data: duplicate, error: duplicateError } = await supabase
        .from("listings")
        .insert({
            ...copyValues,
            seller_id: user.id,
            status: "draft",
            is_featured: false,
            updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (duplicateError || !duplicate) {
        return { error: duplicateError?.message || "Unable to duplicate listing." };
    }

    const imageRows = (images ?? []).map((image) => ({
        listing_id: duplicate.id,
        r2_key: image.r2_key,
        alt_text: image.alt_text,
        image_order: image.image_order,
        image_hash: image.image_hash ?? null,
        perceptual_hash: image.perceptual_hash ?? null,
        is_watermarked: image.is_watermarked ?? true,
    }));

    if (imageRows.length > 0) {
        const { error: imageError } = await supabase
            .from("listing_images")
            .insert(imageRows);

        if (imageError) {
            return { error: imageError.message };
        }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    return { success: true, id: duplicate.id as string };
}

// ─── Image Upload ────────────────────────────────────────────────────────────

/**
 * Save an image record after uploading to R2.
 * RLS ensures only the listing owner can insert images.
 */
export async function saveListingImage(
    listingId: string,
    r2Key: string,
    altText: string | null,
    imageOrder: number,
    imageHash: string | null,
    perceptualHash: string | null,
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const access = await getEditableListingAccess(supabase, user.id, listingId);
    if ("error" in access) {
        return { error: access.error };
    }

    const writeSupabase = access.canAdminister ? createAdminClient() : supabase;
    const { error } = await writeSupabase
        .from('listing_images')
        .insert({
            listing_id: listingId,
            r2_key: r2Key,
            alt_text: altText,
            image_order: imageOrder,
            image_hash: imageHash,
            perceptual_hash: perceptualHash,
            is_watermarked: true,
        });

    if (error) {
        console.error("Save Image Error:", error);
        return { error: error.message };
    }

    return { success: true };
}

export async function uploadListingImages(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const listingId = formData.get("listingId");
    if (typeof listingId !== "string" || !listingId.trim()) {
        return { error: "Listing id is required." };
    }

    const access = await getEditableListingAccess(supabase, user.id, listingId);
    if ("error" in access) {
        return { error: access.error };
    }
    const writeSupabase = access.canAdminister ? createAdminClient() : supabase;
    const listing = access.listing;

    const coverImage = formData.get("coverImage");
    const galleryImages = formData
        .getAll("galleryImages")
        .filter((value): value is File => value instanceof File && value.size > 0);

    const coverFile = coverImage instanceof File && coverImage.size > 0 ? coverImage : null;

    if (coverFile && galleryImages.length < 2) {
        return { error: "At least two gallery images are required." };
    }

    if (!coverFile && galleryImages.length < 3) {
        return { error: "At least three listing photos are required." };
    }

    const filesToUpload = coverFile ? [coverFile, ...galleryImages] : galleryImages;
    const preparedUploads: Array<{
        key: string;
        hash: string;
        perceptualHash: string;
        altText: string | null;
        imageOrder: number;
    }> = [];
    let uploadedCount = 0;

    for (const [index, file] of filesToUpload.entries()) {
        try {
            const { key, hash, perceptualHash } = await uploadListingFile(listingId, file);
            const duplicateCheck = await writeSupabase
                .from('listing_images')
                .select('id, image_hash, perceptual_hash, listings!inner(seller_id, id)')
                .eq('listings.seller_id', listing.seller_id)
                .neq('listing_id', listingId);

            if (duplicateCheck.error) {
                return { error: duplicateCheck.error.message };
            }

            const duplicateRows = (duplicateCheck.data ?? []) as Array<{
                id: string;
                image_hash: string | null;
                perceptual_hash: string | null;
            }>;
            const nextHashes = parsePerceptualHashes(perceptualHash);
            const hasPerceptualDuplicate = duplicateRows.some((row) =>
                parsePerceptualHashes(row.perceptual_hash).some((existingHash) =>
                    nextHashes.some((candidateHash) => hammingDistance(existingHash, candidateHash) <= 8)
                )
            );

            if (duplicateRows.some((row) => row.image_hash === hash) || hasPerceptualDuplicate) {
                return { error: `Duplicate image detected for "${file.name}".` };
            }

            const altText = formData.get("altTextBase");
            preparedUploads.push({
                key,
                hash,
                perceptualHash,
                altText:
                    typeof altText === "string" && altText.trim()
                        ? `${altText} - Photo ${index + 1}`
                        : null,
                imageOrder: index,
            });
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : `Unable to upload "${file.name}".`,
            };
        }
    }

    const { error: deleteError } = await writeSupabase
        .from("listing_images")
        .delete()
        .eq("listing_id", listingId);

    if (deleteError) {
        return { error: deleteError.message };
    }

    for (const upload of preparedUploads) {
        const imageResult = await saveListingImage(
            listingId,
            upload.key,
            upload.altText,
            upload.imageOrder,
            upload.hash,
            upload.perceptualHash,
        );

        if (imageResult.error) {
            return imageResult;
        }

        uploadedCount += 1;
    }

    if (access.canAdminister) {
        await emitListingUpdatedNotification({
            actorId: user.id,
            listing,
            summary: "An admin updated the listing photos on your behalf.",
        });
    }

    return { success: true, uploadedCount };
}

export async function reorderListingImages(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const listingId = formData.get("listingId");
    const rawOrderedImageKeys = formData.get("orderedImageKeys");

    if (typeof listingId !== "string" || !listingId.trim()) {
        return { error: "Listing id is required." };
    }

    if (typeof rawOrderedImageKeys !== "string" || !rawOrderedImageKeys.trim()) {
        return { error: "Image order is required." };
    }

    let orderedImageKeys: string[];
    try {
        const parsed = JSON.parse(rawOrderedImageKeys);
        if (!Array.isArray(parsed)) {
            return { error: "Image order is invalid." };
        }
        orderedImageKeys = parsed
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean);
    } catch {
        return { error: "Image order is invalid." };
    }

    if (orderedImageKeys.length === 0) {
        return { error: "At least one listing image is required." };
    }

    const access = await getEditableListingAccess(supabase, user.id, listingId);
    if ("error" in access) {
        return { error: access.error };
    }

    let error: { message: string } | null = null;

    if (!access.canAdminister) {
        const rpcResult = await supabase.rpc("reorder_listing_images", {
            target_listing_id: listingId,
            ordered_r2_keys: orderedImageKeys,
        });
        error = rpcResult.error;
    } else {
        const adminSupabase = createAdminClient();
        for (const [index, key] of orderedImageKeys.entries()) {
            const updateResult = await adminSupabase
                .from("listing_images")
                .update({ image_order: index })
                .eq("listing_id", listingId)
                .eq("r2_key", key);

            if (updateResult.error) {
                error = updateResult.error;
                break;
            }
        }
    }

    if (error) {
        const missingFunction =
            error.message.includes("Could not find the function") ||
            error.message.includes("reorder_listing_images");

        return {
            error: missingFunction
                ? "Apply the latest Supabase migration before changing the listing cover from existing media."
                : error.message,
        };
    }

    revalidateListingPaths(listingId);

    if (access.canAdminister) {
        await emitListingUpdatedNotification({
            actorId: user.id,
            listing: access.listing,
            summary: "An admin reordered the listing gallery on your behalf.",
        });
    }

    return { success: true };
}

export async function uploadListingVideo(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const listingId = formData.get("listingId");
    const videoFile = formData.get("videoFile");
    if (typeof listingId !== "string" || !listingId.trim()) {
        return { error: "Listing id is required." };
    }

    if (!(videoFile instanceof File) || videoFile.size === 0) {
        return { error: "A video file is required." };
    }

    const access = await getEditableListingAccess(supabase, user.id, listingId);
    if ("error" in access) {
        return { error: access.error };
    }
    const listing = access.listing;
    const writeSupabase = access.canAdminister ? createAdminClient() : supabase;

    if (!VIDEO_ACCEPTED_TYPES.has(videoFile.type)) {
        return { error: "Video must be an MP4, WEBM, or MOV file." };
    }

    if (videoFile.size > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
        return { error: "Video exceeds the 200MB upload limit." };
    }

    if (!process.env.R2_BUCKET_NAME) {
        return { error: "R2 bucket configuration is missing." };
    }

    const extension = extensionForFile(videoFile) || ".mp4";
    const baseName = extension ? videoFile.name.slice(0, -extension.length) : videoFile.name;
    const key = `listings/${listingId}/video/${Date.now()}-${nanoid(10)}-${sanitizeFileName(`${baseName}${extension}`)}`;
    const publicUrl = getStorageObjectUrl(key);

    if (!publicUrl.startsWith("http")) {
        return { error: "Public asset URL configuration is missing." };
    }

    try {
        await r2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                Body: Buffer.from(await videoFile.arrayBuffer()),
                ContentType: videoFile.type || "application/octet-stream",
            })
        );
    } catch (error) {
        console.error("Listing video upload error:", error);
        return { error: "Unable to upload the video file." };
    }

    const nextMetadata = {
        ...((listing.metadata && typeof listing.metadata === "object") ? listing.metadata : {}),
        videoUrl: publicUrl,
    } as Record<string, unknown>;

    const { error: updateError } = await writeSupabase
        .from("listings")
        .update({
            metadata: nextMetadata,
            updated_at: new Date().toISOString(),
        })
        .eq("id", listingId)

    if (updateError) {
        return { error: updateError.message };
    }

    revalidateListingPaths(listingId);
    if (access.canAdminister) {
        await emitListingUpdatedNotification({
            actorId: user.id,
            listing,
            summary: "An admin updated the listing video on your behalf.",
        });
    }
    return { success: true, videoUrl: publicUrl };
}

export async function uploadListingDocuments(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const listingId = formData.get("listingId");
    if (typeof listingId !== "string" || !listingId.trim()) {
        return { error: "Listing id is required." };
    }

    const documentFiles = formData
        .getAll("documentFiles")
        .filter((value): value is File => value instanceof File && value.size > 0);

    if (documentFiles.length === 0) {
        return { error: "At least one document file is required." };
    }

    const access = await getEditableListingAccess(supabase, user.id, listingId);
    if ("error" in access) {
        return { error: access.error };
    }
    const listing = access.listing;
    const writeSupabase = access.canAdminister ? createAdminClient() : supabase;

    if (!process.env.R2_BUCKET_NAME) {
        return { error: "R2 bucket configuration is missing." };
    }

    const uploadedDocuments: UploadedListingDocument[] = [];

    for (const documentFile of documentFiles) {
        if (!DOCUMENT_ACCEPTED_TYPES.has(documentFile.type)) {
            return { error: `"${documentFile.name}" must be a PDF, JPG, PNG, or WebP file.` };
        }

        if (documentFile.size > MAX_UPLOAD_SIZE_BYTES) {
            return { error: `"${documentFile.name}" exceeds the 10MB upload limit.` };
        }

        const extension = extensionForFile(documentFile);
        const baseName = extension
            ? documentFile.name.slice(0, -extension.length)
            : documentFile.name;
        const key = `listings/${listingId}/documents/${Date.now()}-${nanoid(10)}-${sanitizeFileName(`${baseName}${extension}`)}`;
        const publicUrl = getStorageObjectUrl(key);

        if (!publicUrl.startsWith("http")) {
            return { error: "Public asset URL configuration is missing." };
        }

        try {
            await r2.send(
                new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: key,
                    Body: Buffer.from(await documentFile.arrayBuffer()),
                    ContentType: documentFile.type || "application/octet-stream",
                })
            );
        } catch (error) {
            console.error("Listing document upload error:", error);
            return { error: `Unable to upload "${documentFile.name}".` };
        }

        uploadedDocuments.push({
            name: documentFile.name,
            url: publicUrl,
            key,
            contentType: documentFile.type || "application/octet-stream",
            size: documentFile.size,
        });
    }

    const existingMetadata = (
        listing.metadata && typeof listing.metadata === "object" ? listing.metadata : {}
    ) as Record<string, unknown>;
    const existingDocuments = Array.isArray(existingMetadata.documents)
        ? existingMetadata.documents.filter((document) => document && typeof document === "object")
        : [];
    const documents = [...existingDocuments, ...uploadedDocuments];
    const nextMetadata = {
        ...existingMetadata,
        documents,
        documentNames: documents
            .map((document) =>
                typeof (document as Record<string, unknown>).name === "string"
                    ? String((document as Record<string, unknown>).name).trim()
                    : ""
            )
            .filter(Boolean),
    };

    const { error: updateError } = await writeSupabase
        .from("listings")
        .update({
            metadata: nextMetadata,
            updated_at: new Date().toISOString(),
        })
        .eq("id", listingId)

    if (updateError) {
        return { error: updateError.message };
    }

    revalidateListingPaths(listingId);
    if (access.canAdminister) {
        await emitListingUpdatedNotification({
            actorId: user.id,
            listing,
            summary: "An admin updated the listing documents on your behalf.",
        });
    }
    return { success: true, documents: uploadedDocuments };
}

// ─── Status Transitions ──────────────────────────────────────────────────────

/**
 * Owner submits their draft listing for review.
 * Verified dealers (dealers.status = 'APPROVED') are auto-approved → active.
 * Everyone else goes to → pending for admin review.
 */
export async function submitListingForReview(listingId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    // Fetch the draft listing to check for a linked dealer
    const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('id, dealer_id')
        .eq('id', listingId)
        .eq('seller_id', user.id)
        .eq('status', 'draft')
        .single();

    if (fetchError || !listing) {
        console.error("Submit for Review Error:", fetchError);
        return { error: fetchError?.message || "Listing not found or not in draft status." };
    }

    const { count: imageCount, error: imageCountError } = await supabase
        .from('listing_images')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId);

    if (imageCountError) {
        return { error: imageCountError.message };
    }

    if ((imageCount ?? 0) < 3) {
        return { error: "Minimum 3 listing images are required before submission." };
    }

    const packageAccessResult = await getSellerPackageAccessForUser(supabase, user.id, {
        ignoreListingId: listingId,
    });
    if (packageAccessResult.error) {
        return { error: packageAccessResult.error };
    }

    if (!packageAccessResult.access.hasActivePlan) {
        return { error: "Choose a seller package before publishing this listing." };
    }

    if (!packageAccessResult.access.canCreateListing) {
        const currentPlanName = packageAccessResult.access.currentPlan?.name || "current";
        return {
            error: `Your ${currentPlanName} package has reached its listing limit. Upgrade or remove another listing before publishing this one.`,
        };
    }

    // Check if linked dealer is verified → auto-approve
    let autoApproved = false;
    if (listing.dealer_id) {
        const { data: dealer } = await supabase
            .from('dealers')
            .select('status')
            .eq('id', listing.dealer_id)
            .single();

        if (dealer?.status === 'APPROVED') {
            autoApproved = true;
        }
    }

    const newStatus = autoApproved ? 'active' : 'pending';

    const { error } = await supabase
        .from('listings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', listingId)
        .eq('status', 'draft');

    if (error) {
        console.error("Submit for Review Error:", error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/listings');
    if (autoApproved) {
        revalidatePath('/search');
    }
    return { success: true, autoApproved };
}

/**
 * Admin approves a pending listing → active.
 */
export async function approveListing(listingId: string) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return adminContext;

    const { user } = adminContext;
    const supabase = createAdminClient();
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, seller_id, dealer_id, status, make, model, year, metadata')
        .eq('id', listingId)
        .eq('status', 'pending')
        .maybeSingle<EditableListingRecord>();

    if (listingError || !listing) {
        return { error: listingError?.message || "Listing not found." };
    }

    const { error } = await supabase
        .from('listings')
        .update({
            status: 'active',
            metadata: buildModerationMetadata(listing.metadata, {
                nextStatus: 'active',
                actorId: user.id,
            }),
            updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)
        .eq('status', 'pending');

    if (error) {
        console.error("Approve Listing Error:", error);
        return { error: error.message };
    }

    revalidateListingPaths(listingId);
    await emitListingStatusNotification({
        actorId: user.id,
        listing,
        status: 'active',
    });
    return { success: true };
}

/**
 * Admin rejects a pending listing.
 * Optional reason stored in metadata JSONB.
 */
export async function rejectListing(listingId: string, reason?: string) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return adminContext;

    const { user } = adminContext;
    const supabase = createAdminClient();
    const trimmedReason = reason?.trim();
    if (!trimmedReason) {
        return { error: "A rejection reason is required." };
    }

    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, seller_id, dealer_id, status, make, model, year, metadata')
        .eq('id', listingId)
        .eq('status', 'pending')
        .maybeSingle<EditableListingRecord>();

    if (listingError || !listing) {
        return { error: listingError?.message || "Listing not found." };
    }

    const { error } = await supabase
        .from('listings')
        .update({
            status: 'rejected',
            metadata: buildModerationMetadata(listing.metadata, {
                nextStatus: 'rejected',
                actorId: user.id,
                reason: trimmedReason,
            }),
            updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)
        .eq('status', 'pending');

    if (error) {
        console.error("Reject Listing Error:", error);
        return { error: error.message };
    }

    revalidateListingPaths(listingId);
    await emitListingStatusNotification({
        actorId: user.id,
        listing,
        status: 'rejected',
        reason: trimmedReason,
    });
    return { success: true };
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

/**
 * Admin: fetch all pending listings with images and seller info.
 */
export async function getPendingListings() {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) {
        return { error: adminContext.error, data: [] };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            images:listing_images(id, r2_key, alt_text, image_order, image_hash, perceptual_hash),
            seller:profiles!seller_id(id, full_name, avatar_url, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Get Pending Listings Error:", error);
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

/**
 * Seller: fetch all their own listings with images.
 */
export async function getMyListings() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized", data: [] };

    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            images:listing_images(id, r2_key, alt_text, image_order)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Get My Listings Error:", error);
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

export async function getMyListingById(id: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            images:listing_images(id, r2_key, alt_text, image_order, image_hash, perceptual_hash),
            seller:profiles!seller_id(id, full_name, avatar_url, email),
            dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
        `)
        .eq('id', id)
        .eq('seller_id', user.id)
        .single();

    if (error) {
        return { error: error.message };
    }

    return { data };
}

export async function getAdminListingById(id: string) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return { error: adminContext.error };

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            images:listing_images(id, r2_key, alt_text, image_order, image_hash, perceptual_hash),
            seller:profiles!seller_id(id, full_name, avatar_url, email),
            dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
        `)
        .eq('id', id)
        .single();

    if (error) {
        return { error: error.message };
    }

    return { data };
}
