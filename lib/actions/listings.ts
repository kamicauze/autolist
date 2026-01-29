'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { listingSchema, type ListingFormData } from "@/lib/validations/listing";
import { type SupabaseClient } from "@supabase/supabase-js";

export type CreateListingInput = {
    make: string;
    model: string;
    year: number;
    price: number;
    currency?: string;
    mileage: number;
    description: string;
    features: string[]; // JSONB in DB
    condition: 'new' | 'used' | 'foreign_used';
    body_type?: string;
    transmission?: string;
    fuel_type?: string;
    color?: string;
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

    // 2. Determine Initial Status
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
