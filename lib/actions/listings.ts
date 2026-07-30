'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { listingSchema, type ListingFormData } from "@/lib/validations/listing";
import { type SupabaseClient } from "@supabase/supabase-js";

export type CreateListingInput = {
    category: ListingFormData["category"];
    make: string;
    model: string;
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
    metadata?: ListingFormData["metadata"];
};

export async function createListing(input: ListingFormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    return await insertListingInternal(supabase, user.id, input);
}

// Internal function to allow seeding/admin usage
export async function insertListingInternal(
    supabase: SupabaseClient,
    userId: string,
    input: ListingFormData
) {
    // 1. Validation
    const result = listingSchema.safeParse(input);
    if (!result.success) {
        return { error: result.error.flatten() };
    }
    const data = result.data;

    // 2. Duplicate Detection (MVP)
    // Check if the user already has a listing for this exact vehicle (Make + Model + Year + Price within 1%)
    // This prevents accidental double-clicks or spam.
    const { data: potentialDuplicates } = await supabase
        .from('listings')
        .select('id, price')
        .eq('seller_id', userId)
        .eq('category', data.category)
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

    // 3. Insert Listing
    const { data: listing, error } = await supabase
        .from('listings')
        .insert({
            seller_id: userId,
            status: initialStatus,
            ...data,
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

    const { error } = await supabase
        .from('listings')
        .update({
            ...input,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/listings/${id}`);
    return { success: true };
}

export async function deleteListing(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/listings');
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

// ─── Status Transitions ──────────────────────────────────────────────────────

/**
 * Owner submits their draft listing for review.
 * Transitions status: draft → pending.
 */
export async function submitListingForReview(listingId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('listings')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', listingId)
        .eq('seller_id', user.id)
        .eq('status', 'draft')
        .select('id')
        .single();

    if (error || !data) {
        console.error("Submit for Review Error:", error);
        return { error: error?.message || "Listing not found or not in draft status." };
    }

    revalidatePath('/dashboard/listings');
    return { success: true };
}

/**
 * Admin approves a pending listing → active.
 */
export async function approveListing(listingId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Forbidden: Admin only." };

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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Forbidden: Admin only." };

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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized", data: [] };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: "Forbidden", data: [] };

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
