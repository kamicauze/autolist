import type { ListingCategory } from "@/lib/constants/marketplace";

/**
 * Stakeholder vehicle taxonomy (Plant, Farm, Bike, Truck).
 *
 * Labels are kept exactly as they appear in the stakeholder document
 * (including original spellings) so stakeholders recognise their own taxonomy.
 * Listings tag themselves via metadata.taxonomyCategory / metadata.subcategory.
 */

export type TaxonomyNode = {
  category: string;
  subcategories: readonly string[];
};

export const PLANT_MAKES: readonly string[] = [
  "ACM", "AG", "Aisle-Master", "Ammann", "ARJES", "Atlas", "Atlas Copco", "Attachment",
  "Augertorque", "Ausa", "Avant", "Aveling Barford", "AW", "Bateson", "BAV", "BCS", "Belle",
  "Benford", "Black and White", "Bobcat", "Bomag Boss", "Brian James", "BT", "Buffalo", "Case",
  "Caterpillar", "Cherry", "Chieftain", "Claas", "Clark", "Clarke", "Combilift",
  "Conehead Chipper", "Conquip", "Containex", "Cookson And Zinn Cormidi", "Crytec Power Cushman",
  "Daewoo", "Dawson Keith Debon", "Dennison", "Develon", "Dieci", "Doosan", "Doppstadt",
  "Dynapac", "Easy Lift", "Ems Ltd", "Enduramaxx", "Fc Walker", "Fiat-hitachi", "Finlay",
  "Fiori", "Forst", "Fowler", "Garic", "Genie", "Giant Cycles", "Gileskips", "Goodwill",
  "Goodwin Barsby", "Gp", "Grasshopper", "Grove", "Hako", "Hamm", "Heli", "Hiab", "Hidromek",
  "Hitachi", "Hoist", "Husqvarna", "Hydrema", "Hydromix", "Hyster", "Hyundai", "Ifor Williams",
  "Impact", "Indeco", "Indespension", "Iveco", "J Mac", "JCB", "John Deere", "Johnston", "Jpm",
  "Jungheinrich", "Kaeser", "Kalmar", "Kato", "Kinshofer", "Kleemann", "Kmb", "Kobelco",
  "Komatsu", "Kommtek", "Kramer", "Kubota", "Lancer Boss", "Laski", "Ledburytokheim", "Leguan",
  "Liebherr", "Lifton", "Linde", "Liugong", "Loadmac", "Luigong", "Lynton", "Manitou",
  "Massey Ferguson", "Mecalac", "Meccalte", "Mercedes-Benz", "Merlo", "Messersi", "Metso",
  "Miscellaneous", "Mitsubishi", "Moffett", "Morooka", "Movex", "Moxy", "Nc", "Nc Engineering",
  "Neuson", "New Holland", "Niftylift", "Nissan", "Nugent", "Palfinger", "Pasquali", "Poggi",
  "Pramac", "Prodem", "Quicke", "Ransomes", "Raymo", "Rcm", "Reanault", "Red Rhino", "Redbrook",
  "Rhino", "R J Industrie", "Rokbak", "Rotobec", "Sami", "Samuk", "Sany", "Secatol",
  "Security Cabin", "Sem", "Sennebogen", "Shantui", "Skyjack", "Slanetrac", "Smc", "Smv",
  "Snorkel", "Socage", "Staines", "Stephill", "Stiga", "Stihl", "Still", "Storage",
  "Strickland", "Strimech", "Sunward", "Swl", "Takeuchi", "Tennant", "Terex", "Thorworld",
  "Thurston Group", "Thwaites", "Tower Light", "Towmate Trailer", "Toyota", "Track Marshall",
  "Transcube", "Turbosol", "Venieri", "Vermeer", "Volvo", "Wacker Neuson", "Wbp Riddle Bucket",
  "Wbp Ripper Tooth", "Weidemann", "Western", "Wilcox", "Winget", "Woodford Trailers", "Xcmg",
  "Yale", "Yanmar",
];

export const FARM_MAKES: readonly string[] = [
  "AG", "Aw Trailers", "Bailey", "Bailey Trailers", "Bateson", "Beaconsfield", "Bunning",
  "Cheval Liberte", "Chieftain", "Chillington", "CLH", "Cochet", "Debon", "DW Tomlin",
  "Easterby", "Fleming", "Fraser", "Gull", "Herbst", "Ifor Williams", "Indespension", "JNC",
  "John Deere", "Johnson", "JPM", "Kenda Terra-Trac", "Kubota", "Larrington", "Logic",
  "Marshall", "Marston", "Martin Markham", "Massey Ferguson", "Merrick Loggin Trailers",
  "NC Engineering", "Nugent", "Outland", "Oxdale", "Richard Western Rolland", "Siloking",
  "Stewart", "Strautmann", "Tek-Co", "Warwick", "Weeks", "Wessex", "Western", "Winton", "ZDT",
  "Zurn",
];

export const BIKE_MAKES: readonly string[] = [
  "AJS", "Aprilia", "BRP", "BSW", "Bajaj", "Benda", "Benelli", "Bertimati", "Beta", "Bimota",
  "Blaze", "BMW Motorrad", "Boss Hoss", "Bridgestone", "Britt", "Brixton", "Buell", "Buggy",
  "CFMOTO", "CF Light", "Coswheel", "Cleveland", "Daelim", "Daihatsu", "Ducati",
  "Electric scooter", "Everest Exing", "Ex", "FB Mondial", "Future", "Fantic", "Fellow",
  "Fuji Heavy Industries", "Glafit", "GPX", "Gas Gas", "Gilera", "Gotcia", "Hyosung", "Haojue",
  "Harley-Davidson", "Hero MotoCorp", "Honda", "Husqvarna", "Idea", "Italjet", "Italmoto",
  "Kawasaki", "Kibo", "Kimiko", "Kobe", "Kove Mot", "KTM", "Lambretta", "Leonart", "Lifan",
  "Loncin (VOGE)", "Megelli", "MV Agusta", "MZ", "Malaguti", "Mangosteen", "Marnie", "Mat",
  "Maverick", "Meguro", "Mobaeru", "Moriwaki", "Moto Guzzi", "Moto Morini", "Münch",
  "New Mitsubishi Heavy Industries", "Nicotto", "Norton", "PGO", "Phoenix", "PXID", "Pajamas",
  "Panasonic", "Peugeot", "Piaggio", "Proto", "Pure", "QJMotor", "Rich Bit", "Rikuo", "Roam",
  "Rodeo", "Royal Alloy", "Royal Enfield", "Snake Motors", "SYM", "Saron", "Scorpa",
  "Senior mobility scooter", "Sherco", "Skomadi", "SkyTeam", "Snowbike", "Snowblower",
  "Snowmobile", "Solex", "Spiro", "Stallion", "Sun Emperor", "Suzuki", "Swallow", "SWM", "TVS",
  "TGB", "TM Racing", "TRRS", "Thunder Motorcycles", "Tohatsu", "Tomos", "Trike", "Triumph",
  "UM Motorcycles", "Ural", "Vectrix", "Vendor", "Vespa", "Victory", "Vincent", "VOGE",
  "YADEA", "Yamaguchi", "Yamaha", "Yoshimura", "Zongshen", "Zontes",
];

export const TRUCK_MAKES: readonly string[] = [
  "Bedford", "DAF", "Dongfeng", "FAW", "Foton", "Fuso", "Hino", "Howo", "Isuzu", "Iveco",
  "MAN", "Mitsubishi Fuso", "Mercedes Benz", "Nissan Diesel", "Renault", "Scania", "Shacman",
  "UD Trucks", "Volvo", "Yutong",
];

export const PLANT_TAXONOMY: readonly TaxonomyNode[] = [
  {
    category: "Aerial Platforms",
    subcategories: ["Articulated Platforms", "Attachments", "Scissors", "Telescopic Platforms"],
  },
  { category: "Attachments", subcategories: [] },
  {
    category: "Buildings and Storage",
    subcategories: ["Buildings", "Containers", "Tanks", "Water and Fuel Bowers", "Welfare Units"],
  },
  {
    category: "Compaction Machines",
    subcategories: [
      "Combination", "Double Drum", "Plate Compactor", "Single Drum Padfoot",
      "Single Drum Smooth", "Trench",
    ],
  },
  { category: "Compressors", subcategories: ["Static", "Trailer"] },
  { category: "Concrete", subcategories: ["Batching & Silos", "Mixer", "Pumps"] },
  {
    category: "Cranes",
    subcategories: ["All Terrain Cranes", "Attachments", "Truck Mounted Cranes"],
  },
  { category: "Dozers", subcategories: ["Tracked Dozers", "Wheeled Dozers"] },
  {
    category: "Dumpers",
    subcategories: [
      "Articulated Dump Trucks", "Dump Trucks", "Mini Dumpers", "Skip Dumpers", "Track Dumpers",
    ],
  },
  {
    category: "Excavators",
    subcategories: [
      "Attachments", "Micro Excavators", "Midi Excavators", "Mini Excavators",
      "Track Excavators", "Wheeled Excavators",
    ],
  },
  {
    category: "Forklifts",
    subcategories: [
      "All Terrain Forklifts", "Attachments", "Container Handlers", "Counter Balanced Forklifts",
      "Narrow Aisle Trucks", "Pedestrian Stackers", "Reach Trucks", "Side Loaders",
    ],
  },
  { category: "Generators", subcategories: ["Static", "Trailer"] },
  {
    category: "Loaders",
    subcategories: [
      "Attachments", "Backhoe Loaders", "Front Shovels", "Multi Terrain Loaders",
      "Skid Steer Loaders", "Track Loaders", "Wheeled Loaders",
    ],
  },
  { category: "Mining and Quarry Equipment", subcategories: [] },
  { category: "Road and Paving Machine", subcategories: [] },
  { category: "Road Construction Equipment", subcategories: [] },
  { category: "Scrappers", subcategories: [] },
  { category: "Telehandlers", subcategories: [] },
  {
    category: "Tools And Equipment",
    subcategories: [
      "Attachments", "Lifting Equipment", "Lighting Equipment", "Pneumatic Tools", "Power Tools",
      "Pumps And Hydraulic Equipment", "Safety Equipment", "Welding And Pipework Tools",
    ],
  },
  {
    category: "Trailers",
    subcategories: [
      "All Terrain", "Attachments", "Box", "Car Transporter", "Draw Bar Trailers", "Farm Trailer",
      "Flatbed", "General Purpose", "Horse And Livestock", "Low Loader", "Tipping",
    ],
  },
  { category: "Waste and Recycling", subcategories: ["Skips", "Sweepers", "Wood Chippers"] },
];

export const FARM_TAXONOMY: readonly TaxonomyNode[] = [
  { category: "4WD Vehicles", subcategories: ["ATVs"] },
  { category: "Attachments", subcategories: [] },
  {
    category: "Forage and Hay",
    subcategories: [
      "Bale Wrappers", "Forage and Hay Attachments", "Forage and Hay Other", "Forage Harvesters",
      "Hay Bobs", "Mower-Conditioners", "Mowers", "Rakes", "Round Balers", "Square Balers",
      "Stacking and Loading Equipment", "Toppers", "Windrowers",
    ],
  },
  {
    category: "Forestry and Hedging",
    subcategories: [
      "Firewood Processors", "Forestry and Hedging Attachments", "Forestry and Hedging Other",
      "Forestry Mowers", "Hedge Mowers", "Loaders", "Log Splitters", "Stump Grinders",
      "Tree Harvesters", "Wood Chippers",
    ],
  },
  { category: "Ground Care Equipment", subcategories: ["Ride on mowers"] },
  {
    category: "Harvesters",
    subcategories: ["Combine Harvesters", "Follage Harvesters", "Harvester Attachments"],
  },
  {
    category: "Livestock Equipment",
    subcategories: [
      "Bale Shredders and Spreaders", "Livestock Equipment Attachments",
      "Livestock Truck Drawbar Trailers",
    ],
  },
  {
    category: "Loaders and Excavators",
    subcategories: [
      "Attachments", "Plant Excavators", "Plant Loaders", "Telehandlers", "Tractor Based Loaders",
    ],
  },
  {
    category: "Sowing and Planting",
    subcategories: ["Combination Drills", "Planters", "Precision Seeders", "Seed Drills"],
  },
  {
    category: "Spreaders and Sprayers",
    subcategories: [
      "Fertiliser Spreaders", "Manure Spreaders", "Other Sprayers and Spreaders",
      "Self Propelled Sprayers", "Slurry Tankers", "Spreaders and Sprayers Attachments",
      "Tractor Mounted Sprayers", "Trailer Sprayers",
    ],
  },
  { category: "Storage and Buildings", subcategories: ["Tanks"] },
  {
    category: "Tillage",
    subcategories: [
      "Aerators", "Cultivators", "Harrows", "Ploughs", "Power Harrows", "Rollers",
      "Stone Removal And Crushers", "Subsoilers", "Tillage Attachments",
    ],
  },
  {
    category: "Tractors",
    subcategories: [
      "Any", "Compact Tractor", "Large Tractor", "Medium Tractor", "Other Tractors",
      "Small Tractor", "Tractor Attachments",
    ],
  },
  {
    category: "Trailers",
    subcategories: [
      "Any", "Atv Trailers", "Bale Trailers", "Car And Van Trailers", "Dropside Trailers",
      "Dumper Trailers", "Farm Trailer Attachments", "Flatbed Trailers",
      "Grain And Silage Trailers", "Livestock Trailers", "Low Loader", "Other Trailers",
    ],
  },
];

/** Truck top-level categories (filtered on metadata.taxonomyCategory). */
export const TRUCK_CATEGORIES: readonly string[] = [
  "Rigid Trucks",
  "Tractor Units",
  "Trailers",
];

export const BIKE_BODY_TYPES: readonly string[] = [
  "Adventure", "Bobber", "Cafe Racer", "Chopper", "Classic", "Commuter", "Cruiser",
  "Dual-Sport", "Electric/E-bike", "Hybrid", "Moped", "Mountain", "Motocrosser", "Naked",
  "Off-Road", "Quad", "Roadster/Retro", "Scooter", "Sport Bike", "Sport Tourer", "Standard",
  "Super Moto", "Super Sport", "Three Wheeler/Trike", "Touring", "Trail Bike",
];

export const TRUCK_BODY_TYPES: readonly string[] = [
  "Beavertail", "Box", "Chassis Cab", "Coach", "Concrete Mixer", "Crane Mounted",
  "Curtain Side", "Dropside", "Flatbed", "Gritter Truck", "Hook Loader", "Municipal",
  "Pantechnician", "Road Sweeper", "Skip Loader", "Tanker", "Temperature Controlled", "Tipper",
  "Tipper Grab", "Tractor Unit", "Vehicle Transporter",
];

export const TRUCK_AXLE_CONFIGS: readonly string[] = [
  "4x2", "4x4", "6x2", "6x4", "6x6", "8x2", "8x4", "8x6", "8x8",
];

export const TRUCK_CAB_TYPES: readonly string[] = [
  "Crew Cab", "Day Cab", "Double Cab", "High Sleeper Cab", "Low Access Cab", "Short Cab",
  "Sleeper Cab", "Transporter Cab",
];

export const TRUCK_GEARBOX_OPTIONS: readonly string[] = ["Automatic", "Manual", "Semi-automatic"];

export const TRUCK_FUEL_TYPES: readonly string[] = [
  "Petrol", "Diesel", "Electric", "Hybrid", "CNG",
];

export const BIKE_FUEL_TYPES: readonly string[] = ["Petrol", "Electric"];

/** Hours-used range steps (plant & farm). */
export const HOURS_USED_STEPS: readonly number[] = [
  0, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
];

/** Engine size (CC) From–To steps from the stakeholder doc (bike). */
export const BIKE_ENGINE_CC_STEPS: readonly number[] = [
  50, 125, 200, 400, 600, 700, 800, 900, 1000, 1100, 1200,
];

export const TAXONOMY_BY_CATEGORY: Partial<Record<ListingCategory, readonly TaxonomyNode[]>> = {
  plant_construction: PLANT_TAXONOMY,
  farm_agricultural: FARM_TAXONOMY,
  truck: TRUCK_CATEGORIES.map((category) => ({ category, subcategories: [] })),
};

export const MAKES_BY_CATEGORY: Partial<Record<ListingCategory, readonly string[]>> = {
  motorbike: BIKE_MAKES,
  truck: TRUCK_MAKES,
  plant_construction: PLANT_MAKES,
  farm_agricultural: FARM_MAKES,
};

export function getTaxonomyForCategory(
  category: string | null | undefined
): readonly TaxonomyNode[] {
  if (!category) return [];
  return TAXONOMY_BY_CATEGORY[category as ListingCategory] ?? [];
}

export function getSubcategoriesForTaxonomyCategory(
  category: string | null | undefined,
  taxonomyCategory: string | null | undefined
): readonly string[] {
  if (!taxonomyCategory) return [];
  const node = getTaxonomyForCategory(category).find(
    (entry) => entry.category === taxonomyCategory
  );
  return node?.subcategories ?? [];
}
