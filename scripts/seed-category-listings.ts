/**
 * Seed realistic Kenya-market motorbike, farm, and plant machinery listings so
 * those category tabs have content. Reuses the seller/dealer and image r2_keys
 * of the existing motorbike (BMW Motorrad R1300 GS Adventure) and farm
 * (Yanmar SA426) listings.
 *
 * Idempotent: skips any listing whose make+model already exists.
 *
 * Usage: npx tsx scripts/seed-category-listings.ts [--dry-run]
 */
import fs from "fs";
import path from "path";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadEnv();

import { createAdminClient } from "../lib/supabase/admin";

const dryRun = process.argv.includes("--dry-run");

// Existing anchor listings whose seller/dealer and images we reuse.
const BIKE_ANCHOR_LISTING_ID = "bb00e3d3-b785-44b0-8d80-5ca92fb37673"; // BMW Motorrad R1300 GS Adventure
const FARM_ANCHOR_LISTING_ID = "41e3ff00-4960-48c1-a1f7-49630f3e4359"; // Yanmar SA426

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type SeedListing = {
  category: "motorbike" | "farm_agricultural" | "plant_construction";
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  body_type: string;
  transmission: string;
  fuel_type: string;
  color: string;
  condition: "new" | "locally_used" | "foreign_used";
  seats: number;
  doors: number;
  drive_type: string;
  description: string;
  features: string[];
  is_featured?: boolean;
  locationArea: string;
  details: Record<string, Json>;
  metadataExtras: Record<string, Json>;
};

const MOTORBIKES: SeedListing[] = [
  {
    category: "motorbike",
    make: "Honda",
    model: "CB500X",
    year: 2022,
    price: 890000,
    mileage: 11500,
    body_type: "adventure",
    transmission: "manual",
    fuel_type: "petrol",
    color: "Red",
    condition: "foreign_used",
    seats: 2,
    doors: 0,
    drive_type: "rwd",
    is_featured: true,
    locationArea: "Hurlingham",
    description:
      "Honda CB500X adventure tourer, 471cc parallel twin, 6-speed manual. Fresh import with service history, new tyres and top box. Ideal for Nairobi commuting and weekend upcountry rides.",
    features: ["ABS", "LED Headlights", "Top Box", "Adjustable Windscreen"],
    details: { engineCapacity: "471", bikeType: "adventure" },
    metadataExtras: { subcategory: "Adventure", engineCapacity: 471, enginePowerBhp: 47 },
  },
  {
    category: "motorbike",
    make: "Yamaha",
    model: "MT-07",
    year: 2021,
    price: 950000,
    mileage: 9800,
    body_type: "naked",
    transmission: "manual",
    fuel_type: "petrol",
    color: "Grey",
    condition: "foreign_used",
    seats: 2,
    doors: 0,
    drive_type: "rwd",
    locationArea: "Hurlingham",
    description:
      "Yamaha MT-07 hyper naked, 689cc CP2 twin, 6-speed manual. Clean foreign used unit with fender eliminator and frame sliders. Punchy torque, light clutch, easy to live with daily.",
    features: ["ABS", "LCD Dash", "Frame Sliders"],
    details: { engineCapacity: "689", bikeType: "naked" },
    metadataExtras: { subcategory: "Naked", engineCapacity: 689, enginePowerBhp: 73 },
  },
  {
    category: "motorbike",
    make: "Bajaj",
    model: "Boxer 150",
    year: 2023,
    price: 185000,
    mileage: 6200,
    body_type: "commuter",
    transmission: "manual",
    fuel_type: "petrol",
    color: "Black",
    condition: "locally_used",
    seats: 2,
    doors: 0,
    drive_type: "rwd",
    locationArea: "Hurlingham",
    description:
      "Bajaj Boxer 150 commuter, 144cc single, 5-speed manual. One owner, well maintained boda-ready workhorse with carrier rack. Very economical on fuel and cheap on spares countrywide.",
    features: ["Carrier Rack", "Kick and Electric Start", "Tubeless Tyres"],
    details: { engineCapacity: "144", bikeType: "commuter" },
    metadataExtras: { subcategory: "Commuter", engineCapacity: 144, enginePowerBhp: 12 },
  },
  {
    category: "motorbike",
    make: "Vespa",
    model: "Primavera 150",
    year: 2022,
    price: 620000,
    mileage: 4100,
    body_type: "scooter",
    transmission: "automatic",
    fuel_type: "petrol",
    color: "Mint Green",
    condition: "foreign_used",
    seats: 2,
    doors: 0,
    drive_type: "rwd",
    locationArea: "Hurlingham",
    description:
      "Vespa Primavera 150 scooter, 155cc i-get engine with automatic CVT transmission. Immaculate low-mileage import with under-seat storage and USB charging. Stylish, nimble town runner.",
    features: ["Automatic CVT", "USB Charging", "Under-seat Storage", "ABS"],
    details: { engineCapacity: "155", bikeType: "scooter" },
    metadataExtras: { subcategory: "Scooter", engineCapacity: 155, enginePowerBhp: 13 },
  },
  {
    category: "motorbike",
    make: "Kawasaki",
    model: "Ninja 400",
    year: 2020,
    price: 780000,
    mileage: 14300,
    body_type: "sport bike",
    transmission: "manual",
    fuel_type: "petrol",
    color: "Green",
    condition: "foreign_used",
    seats: 2,
    doors: 0,
    drive_type: "rwd",
    locationArea: "Hurlingham",
    description:
      "Kawasaki Ninja 400 sport bike, 399cc parallel twin, 6-speed manual. Foreign used with recent full service, new chain and sprocket kit. Great first big bike with friendly ergonomics.",
    features: ["ABS", "Slipper Clutch", "New Chain Kit"],
    details: { engineCapacity: "399", bikeType: "sport bike" },
    metadataExtras: { subcategory: "Sport Bike", engineCapacity: 399, enginePowerBhp: 45 },
  },
  {
    category: "motorbike",
    make: "Royal Enfield",
    model: "Himalayan 411",
    year: 2021,
    price: 690000,
    mileage: 12800,
    body_type: "dual-sport",
    transmission: "manual",
    fuel_type: "petrol",
    color: "Granite Black",
    condition: "foreign_used",
    seats: 2,
    doors: 0,
    drive_type: "rwd",
    locationArea: "Hurlingham",
    description:
      "Royal Enfield Himalayan 411 dual-sport, 411cc single, 5-speed manual. Fitted with panniers, engine guards and spoked wheels. Proven Kenyan safari companion, tackles rough roads with ease.",
    features: ["Panniers", "Engine Guards", "Luggage Rack", "ABS"],
    details: { engineCapacity: "411", bikeType: "dual-sport" },
    metadataExtras: { subcategory: "Dual-Sport", engineCapacity: 411, enginePowerBhp: 24 },
  },
];

const FARM: SeedListing[] = [
  {
    category: "farm_agricultural",
    make: "Massey Ferguson",
    model: "MF 385",
    year: 2019,
    price: 3850000,
    mileage: null,
    body_type: "tractor",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Red",
    condition: "locally_used",
    seats: 1,
    doors: 2,
    drive_type: "4wd",
    locationArea: "Nakuru",
    description:
      "Massey Ferguson MF 385 4WD tractor, 85hp Perkins diesel engine, 8-speed manual gearbox. 2,100 working hours, well serviced with new rear tyres. Sold with disc plough. Ready for wheat and maize work.",
    features: ["Power Steering", "Disc Plough Included", "New Rear Tyres", "Canopy"],
    details: { equipmentType: "tractor", powerOutput: "85", operatingHours: "2100", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Tractors", subcategory: "Medium Tractor", hours_used: 2100, enginePowerBhp: 85 },
  },
  {
    category: "farm_agricultural",
    make: "John Deere",
    model: "5075E",
    year: 2021,
    price: 5600000,
    mileage: null,
    body_type: "tractor",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Green",
    condition: "locally_used",
    seats: 1,
    doors: 2,
    drive_type: "4wd",
    locationArea: "Eldoret",
    description:
      "John Deere 5075E utility tractor, 75hp 3-cylinder diesel, 9F/3R SyncShuttle manual transmission. Only 900 hours, dealer maintained from new. 4WD with 540 PTO, perfect for mixed farm operations.",
    features: ["4WD", "540 RPM PTO", "SyncShuttle", "Dealer Maintained"],
    details: { equipmentType: "tractor", powerOutput: "75", operatingHours: "900", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Tractors", subcategory: "Medium Tractor", hours_used: 900, enginePowerBhp: 75 },
  },
  {
    category: "farm_agricultural",
    make: "Kubota",
    model: "L4508",
    year: 2022,
    price: 2950000,
    mileage: null,
    body_type: "tractor",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Orange",
    condition: "foreign_used",
    seats: 1,
    doors: 0,
    drive_type: "4wd",
    locationArea: "Thika",
    description:
      "Kubota L4508 compact tractor, 45hp diesel, 8F/4R manual gearbox with shuttle shift. 450 hours only, fresh import in excellent condition. Ideal for horticulture, greenhouses and smallholdings.",
    features: ["4WD", "Shuttle Shift", "Rear PTO", "Low Hours"],
    details: { equipmentType: "tractor", powerOutput: "45", operatingHours: "450", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Tractors", subcategory: "Compact Tractor", hours_used: 450, enginePowerBhp: 45 },
  },
  {
    category: "farm_agricultural",
    make: "New Holland",
    model: "TD5.90",
    year: 2018,
    price: 4200000,
    mileage: null,
    body_type: "tractor",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Blue",
    condition: "locally_used",
    seats: 1,
    doors: 2,
    drive_type: "4wd",
    locationArea: "Kitale",
    description:
      "New Holland TD5.90 tractor, 90hp diesel, 12F/12R manual transmission with cab. 3,200 hours, engine recently overhauled with receipts. Strong workhorse for large-scale tillage and haulage.",
    features: ["Cab with AC", "12x12 Gearbox", "Recent Engine Overhaul"],
    details: { equipmentType: "tractor", powerOutput: "90", operatingHours: "3200", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Tractors", subcategory: "Medium Tractor", hours_used: 3200, enginePowerBhp: 90 },
  },
  {
    category: "farm_agricultural",
    make: "Fleming",
    model: "TR8 Bale Trailer",
    year: 2021,
    price: 850000,
    mileage: null,
    body_type: "trailer",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Grey",
    condition: "locally_used",
    seats: 1,
    doors: 0,
    drive_type: "2wd",
    locationArea: "Naivasha",
    description:
      "Fleming TR8 8-tonne bale trailer, twin axle with LED lights and hydraulic brakes. Galvanised chassis, barely used two seasons. Tows behind any 50hp+ tractor for hay, silage and general farm haulage.",
    features: ["Twin Axle", "Hydraulic Brakes", "LED Lights", "Galvanised Chassis"],
    details: { equipmentType: "trailer", operatingHours: "200", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Trailers", subcategory: "Bale Trailers", hours_used: 200 },
  },
  {
    category: "farm_agricultural",
    make: "Massey Ferguson",
    model: "MF 240",
    year: 2015,
    price: 1650000,
    mileage: null,
    body_type: "tractor",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Red",
    condition: "locally_used",
    seats: 1,
    doors: 0,
    drive_type: "2wd",
    locationArea: "Meru",
    description:
      "Massey Ferguson MF 240 tractor, 50hp Perkins diesel, 8-speed manual. 5,400 hours, mechanically sound with straight bodywork. Dependable entry-level tractor for small and medium farms.",
    features: ["Perkins Engine", "Power Steering", "Drawbar"],
    details: { equipmentType: "tractor", powerOutput: "50", operatingHours: "5400", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Tractors", subcategory: "Small Tractor", hours_used: 5400, enginePowerBhp: 50 },
  },
];

const PLANT: SeedListing[] = [
  {
    category: "plant_construction",
    make: "JCB",
    model: "3CX Backhoe Loader",
    year: 2017,
    price: 7800000,
    mileage: null,
    body_type: "backhoe loader",
    transmission: "manual",
    fuel_type: "diesel",
    color: "Yellow",
    condition: "foreign_used",
    seats: 1,
    doors: 2,
    drive_type: "4wd",
    locationArea: "Industrial Area",
    description:
      "JCB 3CX backhoe loader, 92hp diesel, 4WD with 4-in-1 front bucket and extendable dipper. 6,200 hours, UK import with clean hour meter and full service records. Site-ready for excavation and loading.",
    features: ["4-in-1 Bucket", "Extendable Dipper", "4WD", "Full Service Records"],
    details: { equipmentType: "backhoe loader", powerOutput: "92", operatingHours: "6200", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Loaders", subcategory: "Backhoe Loaders", hours_used: 6200, enginePowerBhp: 92 },
  },
  {
    category: "plant_construction",
    make: "Caterpillar",
    model: "320D Excavator",
    year: 2016,
    price: 12500000,
    mileage: null,
    body_type: "excavator",
    transmission: "automatic",
    fuel_type: "diesel",
    color: "Yellow",
    condition: "foreign_used",
    seats: 1,
    doors: 1,
    drive_type: "4wd",
    locationArea: "Industrial Area",
    description:
      "Caterpillar 320D tracked excavator, 148hp C6.4 diesel, hydrostatic drive. 8,400 hours, undercarriage at 70 percent, new bucket teeth. Strong pump, no leaks. Ready for roadworks and quarry duty.",
    features: ["70% Undercarriage", "New Bucket Teeth", "Cab with AC"],
    details: { equipmentType: "excavator", powerOutput: "148", operatingHours: "8400", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Excavators", subcategory: "Track Excavators", hours_used: 8400, enginePowerBhp: 148 },
  },
  {
    category: "plant_construction",
    make: "Komatsu",
    model: "PC200-8 Excavator",
    year: 2018,
    price: 11800000,
    mileage: null,
    body_type: "excavator",
    transmission: "automatic",
    fuel_type: "diesel",
    color: "Yellow",
    condition: "foreign_used",
    seats: 1,
    doors: 1,
    drive_type: "4wd",
    locationArea: "Mombasa Road",
    description:
      "Komatsu PC200-8 tracked excavator, 155hp diesel with hydrostatic drive. 7,100 hours, Japan import with original paint and tight slew. Piped for breaker. Excellent all-round 20-tonne machine.",
    features: ["Breaker Piping", "Original Paint", "Japan Import"],
    details: { equipmentType: "excavator", powerOutput: "155", operatingHours: "7100", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Excavators", subcategory: "Track Excavators", hours_used: 7100, enginePowerBhp: 155 },
  },
  {
    category: "plant_construction",
    make: "Bomag",
    model: "BW 211 D-40 Roller",
    year: 2019,
    price: 5400000,
    mileage: null,
    body_type: "roller",
    transmission: "automatic",
    fuel_type: "diesel",
    color: "Yellow",
    condition: "foreign_used",
    seats: 1,
    doors: 0,
    drive_type: "2wd",
    locationArea: "Athi River",
    description:
      "Bomag BW 211 D-40 single drum smooth roller, 11 tonnes, Deutz diesel with hydrostatic drive. 3,100 hours, vibration works on both amplitudes, good drum with ROPS canopy. Ideal for road compaction.",
    features: ["ROPS Canopy", "Dual Amplitude Vibration", "Hydrostatic Drive"],
    details: { equipmentType: "roller", powerOutput: "82", operatingHours: "3100", operationalStatus: "working" },
    metadataExtras: { taxonomyCategory: "Compaction Machines", subcategory: "Single Drum Smooth", hours_used: 3100, enginePowerBhp: 82 },
  },
];

type Anchor = {
  seller_id: string;
  dealer_id: string | null;
  metadata: Record<string, Json>;
  imageKeys: string[];
};

async function loadAnchor(supabase: ReturnType<typeof createAdminClient>, listingId: string): Promise<Anchor> {
  const { data: listing, error } = await supabase
    .from("listings")
    .select("seller_id, dealer_id, metadata")
    .eq("id", listingId)
    .single();
  if (error || !listing) throw new Error(`Anchor listing ${listingId} not found: ${error?.message}`);

  const { data: images, error: imagesError } = await supabase
    .from("listing_images")
    .select("r2_key, image_order")
    .eq("listing_id", listingId)
    .order("image_order");
  if (imagesError) throw imagesError;

  return {
    seller_id: listing.seller_id,
    dealer_id: listing.dealer_id,
    metadata: (listing.metadata ?? {}) as Record<string, Json>,
    imageKeys: (images ?? []).map((image) => image.r2_key),
  };
}

async function main() {
  const supabase = createAdminClient();

  const bikeAnchor = await loadAnchor(supabase, BIKE_ANCHOR_LISTING_ID);
  const farmAnchor = await loadAnchor(supabase, FARM_ANCHOR_LISTING_ID);

  const seeds = [...MOTORBIKES, ...FARM, ...PLANT];
  const created: string[] = [];
  const skipped: string[] = [];

  for (let index = 0; index < seeds.length; index += 1) {
    const seed = seeds[index];
    const anchor = seed.category === "motorbike" ? bikeAnchor : farmAnchor;
    const title = `${seed.make} ${seed.model}`;

    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("make", seed.make)
      .eq("model", seed.model)
      .limit(1);
    if (existing && existing.length > 0) {
      skipped.push(title);
      continue;
    }

    const anchorMeta = anchor.metadata;
    const metadata: Record<string, Json> = {
      country: "Kenya",
      category: seed.category,
      cityTown: "Nairobi",
      locationArea: seed.locationArea,
      negotiable: true,
      sellerType: anchorMeta.sellerType ?? "dealer",
      contactName: anchorMeta.contactName ?? "Sales Team",
      phoneNumber: anchorMeta.phoneNumber ?? "0700000000",
      whatsappNumber: anchorMeta.whatsappNumber ?? anchorMeta.phoneNumber ?? "0700000000",
      availability: "available",
      allowPhoneCalls: true,
      hidePhoneNumber: false,
      tradeInAccepted: false,
      whatsappEnabled: true,
      useDealerAutoFill: true,
      details: {
        make: seed.make,
        model: seed.model,
        year: String(seed.year),
        color: seed.color,
        ...(seed.mileage !== null ? { mileage: String(seed.mileage) } : {}),
        ...seed.details,
      },
      ...seed.metadataExtras,
    };

    if (dryRun) {
      console.log(`[dry-run] would create ${seed.category}: ${title}`);
      created.push(title);
      continue;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("listings")
      .insert({
        seller_id: anchor.seller_id,
        dealer_id: anchor.dealer_id,
        status: "active",
        category: seed.category,
        make: seed.make,
        model: seed.model,
        year: seed.year,
        price: seed.price,
        currency: "KES",
        mileage: seed.mileage,
        body_type: seed.body_type,
        transmission: seed.transmission,
        fuel_type: seed.fuel_type,
        color: seed.color,
        condition: seed.condition,
        seats: seed.seats,
        doors: seed.doors,
        drive_type: seed.drive_type,
        description: seed.description,
        features: seed.features,
        metadata,
        is_featured: seed.is_featured ?? false,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      console.error(`FAILED to insert ${title}: ${insertError?.message}`);
      continue;
    }

    // Reuse anchor image keys, rotating the starting image so cards differ.
    const keys = anchor.imageKeys;
    const imageCount = Math.min(3, keys.length);
    const imageRows = Array.from({ length: imageCount }, (_, order) => ({
      listing_id: inserted.id,
      r2_key: keys[(index * 3 + order) % keys.length],
      alt_text: `${title} - Photo ${order + 1}`,
      image_order: order,
      is_watermarked: true,
    }));
    const { error: imagesError } = await supabase.from("listing_images").insert(imageRows);
    if (imagesError) {
      console.error(`  images FAILED for ${title}: ${imagesError.message}`);
    }

    created.push(title);
    console.log(`created ${seed.category}: ${title} (${inserted.id}) with ${imageRows.length} images`);
  }

  console.log(`\nCreated ${created.length}, skipped ${skipped.length} (already present).`);
  if (skipped.length > 0) console.log(`Skipped: ${skipped.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
