
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function createListing(input: CreateListingInput) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    // 2. Insert Listing
    const { data, error } = await supabase
        .from('listings')
        .insert({
            seller_id: user.id,
            status: 'active', // TODO: Change to 'draft' or 'pending' later based on logic
            ...input,
            features: input.features // Cast to JSONB implicit
        })
        .select()
        .single();

    if (error) {
        console.error("Create Listing Error:", error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/listings');
    return { success: true, data };
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
