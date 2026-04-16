'use server'

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAction } from "@/lib/admin/guard";
import { revalidatePath } from "next/cache";
import { uploadListingImageAssets } from "@/lib/server/listing-image-pipeline";
import { buildListingDetailMetadata, getListingMetadataDetails } from "@/lib/utils/listing-details";

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
};

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const IMAGE_ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForFile(file: File) {
    if (file.name.includes(".")) {
        return file.name.slice(file.name.lastIndexOf("."));
    }
    const subtype = file.type.split("/")[1];
    return subtype ? `.${subtype}` : "";
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

export async function createListing(input: ListingFormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

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
    const { trim, variant, details, seats, doors, drive_type, ...listingValues } = data;
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
    const vehicleReferenceMetadata = {
        ...(trim ? { trim } : {}),
        ...(variant ? { variant } : {}),
        ...(Object.keys(normalizedDetails).length > 0 ? { details: normalizedDetails } : {}),
    };

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

    const { data: existingListing, error: existingError } = await supabase
        .from('listings')
        .select('id, metadata')
        .eq('id', id)
        .eq('seller_id', user.id)
        .single();

    if (existingError || !existingListing) {
        return { error: existingError?.message || "Listing not found." };
    }

    const {
        trim,
        variant,
        details,
        seats,
        doors,
        drive_type,
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

    const { error } = await supabase
        .from('listings')
        .update({
            ...listingValues,
            metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/vehicle/${id}`);
    revalidatePath('/dashboard/listings');
    revalidatePath('/search');
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
    imageHash: string | null
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('listing_images')
        .insert({
            listing_id: listingId,
            r2_key: r2Key,
            alt_text: altText,
            image_order: imageOrder,
            image_hash: imageHash,
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

    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id")
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .single();

    if (listingError || !listing) {
        return { error: listingError?.message || "Listing not found or not editable." };
    }

    const coverImage = formData.get("coverImage");
    const galleryImages = formData
        .getAll("galleryImages")
        .filter((value): value is File => value instanceof File && value.size > 0);

    if (!(coverImage instanceof File) || coverImage.size === 0) {
        return { error: "A cover image is required." };
    }

    if (galleryImages.length < 2) {
        return { error: "At least two gallery images are required." };
    }

    const filesToUpload = [coverImage, ...galleryImages];

    const { error: deleteError } = await supabase
        .from("listing_images")
        .delete()
        .eq("listing_id", listingId);

    if (deleteError) {
        return { error: deleteError.message };
    }

    let uploadedCount = 0;

    for (const [index, file] of filesToUpload.entries()) {
        try {
            const { key, hash } = await uploadListingFile(listingId, file);
            const duplicateCheck = await supabase
                .from('listing_images')
                .select('id, listings!inner(seller_id)')
                .eq('image_hash', hash)
                .eq('listings.seller_id', user.id)
                .limit(1)
                .maybeSingle();

            if (duplicateCheck.error) {
                return { error: duplicateCheck.error.message };
            }

            if (duplicateCheck.data) {
                return { error: `Duplicate image detected for "${file.name}".` };
            }

            const altText = formData.get("altTextBase");
            const imageResult = await saveListingImage(
                listingId,
                key,
                typeof altText === "string" && altText.trim()
                    ? `${altText} - Photo ${index + 1}`
                    : null,
                index,
                hash,
            );

            if (imageResult.error) {
                return imageResult;
            }

            uploadedCount += 1;
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : `Unable to upload "${file.name}".`,
            };
        }
    }

    return { success: true, uploadedCount };
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

    const { supabase } = adminContext;

    const { error } = await supabase
        .from('listings')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', listingId)
        .eq('status', 'pending');

    if (error) {
        console.error("Approve Listing Error:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/listings');
    revalidatePath('/dashboard/listings');
    revalidatePath('/search');
    return { success: true };
}

/**
 * Admin rejects a pending listing.
 * Optional reason stored in metadata JSONB.
 */
export async function rejectListing(listingId: string, reason?: string) {
    const adminContext = await requireAdminAction();
    if ('error' in adminContext) return adminContext;

    const { supabase } = adminContext;

    const updateData: Record<string, unknown> = {
        status: 'rejected',
        updated_at: new Date().toISOString(),
    };
    if (reason) {
        updateData.metadata = { rejection_reason: reason };
    }

    const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', listingId)
        .eq('status', 'pending');

    if (error) {
        console.error("Reject Listing Error:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/listings');
    revalidatePath('/dashboard/listings');
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

    const { supabase } = adminContext;

    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            images:listing_images(id, r2_key, alt_text, image_order),
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
            images:listing_images(id, r2_key, alt_text, image_order),
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
