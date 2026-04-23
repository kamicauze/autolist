
import { insertListingInternal } from "@/lib/actions/listings";
import { mergeSeedListingLocationMetadata } from "@/lib/constants/seed-locations";
import { type ListingFormData } from "@/lib/validations/listing";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Raw Data from listings.json
const RAW_DATA = [
    {
        "make": "Toyota", "model": "Probox", "year": 2018, "price": "1.29M", "description": "1300cc Petrol, Auto", "features": ["Mileage 104k"], "condition": "locally_used"
    },
    {
        "make": "Toyota", "model": "Premio", "year": 2015, "price": "1.85M", "description": "2000cc Petrol", "features": ["Mileage 54k"], "condition": "locally_used"
    },
    {
        "make": "Volkswagen", "model": "Jetta", "year": 2009, "price": "820K", "description": "1400cc Petrol", "features": ["Mileage 152k"], "condition": "foreign_used"
    }
];

function parsePrice(priceStr: string): number {
    const clean = priceStr.toUpperCase().replace(/,/g, '');
    if (clean.includes('M')) return parseFloat(clean.replace('M', '')) * 1_000_000;
    if (clean.includes('K')) return parseFloat(clean.replace('K', '')) * 1_000;
    return parseFloat(clean);
}

function parseMileage(features: string[]): number {
    const mileageStr = features.find(f => f.toLowerCase().includes('mileage'));
    if (!mileageStr) return 0;
    const match = mileageStr.match(/(\d+)/);
    return match ? parseInt(match[0]) * 1000 : 0;
}

export async function GET() {
    // 1. Single Client for Auth & Insert
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const email = "seed@autolist.com";
    const password = "password123";

    // 2. Authenticate
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    let user = signInData.user;

    if (error || !user) {
        // Try signup
        const res = await supabase.auth.signUp({ email, password });
        user = res.data.user;
    }

    if (!user) return NextResponse.json({ error: "Auth failed" }, { status: 500 });

    // IMPORTANT: Check if we have session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "No session active" }, { status: 500 });

    const results = [];

    for (const [index, item] of RAW_DATA.entries()) {
        const payload: ListingFormData = {
            make: item.make,
            model: item.model,
            year: item.year,
            price: parsePrice(item.price),
            currency: "KES",
            mileage: parseMileage(item.features),
            description: item.description,
            features: item.features,
            condition: item.condition as ListingFormData["condition"],
            body_type: "Sedan",
            transmission: "Automatic",
            fuel_type: "Petrol",
            color: "White"
        };

        // Reuse the SAME supabase client which has the session
        const res = await insertListingInternal(supabase, user.id, payload);
        if (res.success && res.data) {
            const metadata = mergeSeedListingLocationMetadata(
                res.data.metadata && typeof res.data.metadata === "object"
                    ? (res.data.metadata as Record<string, unknown>)
                    : null,
                `${item.make}:${item.model}:${item.year}:${index}`
            );

            const { error: metadataError } = await supabase
                .from("listings")
                .update({
                    metadata,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", res.data.id);

            if (metadataError) {
                results.push({ make: item.make, success: false, error: metadataError.message });
                continue;
            }
        }

        results.push({ make: item.make, success: res.success, error: res.error });
    }

    return NextResponse.json({ summary: "Seeding Complete", user: user.email, results });
}
