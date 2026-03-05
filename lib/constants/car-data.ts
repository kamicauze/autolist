// ──────────────────────────────────────────────────────────────────────────────
// Full Car Makes, Models & Trims  (SEED SOURCE)
// Source: FULL CAR MAKES, MODELS & TRIMS.docx
//
// NOTE: Canonical data now lives in Supabase (car_makes, car_models, car_trims,
// car_variants tables). This file is the seed source used by scripts/seed-car-data.ts.
// Runtime code should use lib/data/car-data.ts fetchers instead of importing from here.
// ──────────────────────────────────────────────────────────────────────────────

export interface CarMakeData {
  name: string;
  trims: string[];
  models: CarModelData[];
}

export interface CarModelData {
  name: string;
  /** Engine / variant sub-models (e.g. BMW 3 Series → 316i, 318i …) */
  variants?: string[];
}

// ── Alfa Romeo ───────────────────────────────────────────────────────────────
const alfaRomeo: CarMakeData = {
  name: "Alfa Romeo",
  trims: ["Sprint", "Ti", "Veloce", "Competizione", "Estrema", "Quadrifoglio"],
  models: [
    { name: "Stelvio" },
    { name: "Tonale" },
    { name: "Giulia" },
    { name: "Giulietta" },
  ],
};

// ── Aston Martin ─────────────────────────────────────────────────────────────
const astonMartin: CarMakeData = {
  name: "Aston Martin",
  trims: ["SE", "LE", "Sport", "Ultimate"],
  models: [
    { name: "DBX" },
    { name: "DB11" },
    { name: "DB12" },
    { name: "Vantage" },
    { name: "Vanquish" },
    { name: "Valour" },
    { name: "Valkyrie" },
    { name: "Rapide" },
    { name: "DBS" },
  ],
};

// ── Audi ─────────────────────────────────────────────────────────────────────
const audi: CarMakeData = {
  name: "Audi",
  trims: [
    "Comfort", "Premium", "Premium Plus", "Prestige", "Sport",
    "S-Line", "S", "RS", "Black Edition", "TFSI", "TDI",
  ],
  models: [
    { name: "A1" },
    { name: "A3" },
    { name: "A4" },
    { name: "A4 Allroad Quattro" },
    { name: "A5" },
    { name: "A5 Sportback" },
    { name: "A6" },
    { name: "A6 Allroad" },
    { name: "A6 E-Tron" },
    { name: "A7" },
    { name: "A8" },
    { name: "E-Tron GT" },
    { name: "RS3" },
    { name: "RS5" },
    { name: "RS5 Sportback" },
    { name: "RS6" },
    { name: "RS6 Avant" },
    { name: "RS7" },
    { name: "S3" },
    { name: "S4" },
    { name: "S5" },
    { name: "S5 Sportback" },
    { name: "S6" },
    { name: "S7" },
    { name: "S8" },
    { name: "Q3" },
    { name: "Q4 E-Tron" },
    { name: "Q5" },
    { name: "Q6 E-Tron" },
    { name: "Q7" },
    { name: "Q8" },
    { name: "Q8 E-Tron" },
    { name: "RS Q3" },
    { name: "RS Q8" },
    { name: "SQ5" },
    { name: "SQ6 E-Tron" },
    { name: "SQ7" },
    { name: "SQ8" },
    { name: "SQ8 E-Tron" },
  ],
};

// ── Bentley ──────────────────────────────────────────────────────────────────
const bentley: CarMakeData = {
  name: "Bentley",
  trims: ["Base", "Speed", "Azure", "Mulliner", "S"],
  models: [
    { name: "Continental" },
    { name: "Bentayga" },
    { name: "Flying Spur" },
  ],
};

// ── BMW ──────────────────────────────────────────────────────────────────────
const bmw: CarMakeData = {
  name: "BMW",
  trims: [
    "Competition", "Executive", "GT", "Luxury", "SE", "Sport",
    "XLine", "M-Sport", "M-Performance", "M", "Xdrive",
  ],
  models: [
    { name: "1 Series", variants: ["116i", "116d", "118D", "118i", "120i", "120d", "130i", "M135i", "M140i"] },
    { name: "2 Series", variants: ["216d", "218d", "218i", "220d", "220i", "225d", "225xe", "228i", "230i", "230xe", "M235i", "M240i"] },
    { name: "3 Series", variants: ["316i", "318i", "318d", "320d", "320i", "323i", "325i", "325d", "328i", "330i", "330d", "330e", "335d", "335i", "340i", "M3", "M3 Competition", "M3 CS"] },
    { name: "4 Series", variants: ["418d", "418i", "420d", "420i", "425d", "428i", "430d", "430i", "435i", "440i", "M4", "M4 Competition", "M4 CS", "M4 CSL", "M4 GTS", "M440i"] },
    { name: "5 Series", variants: ["518d", "518i", "520d", "520i", "523i", "525d", "525i", "528i", "530d", "530e", "530i", "535d", "535i", "540d", "540i", "545e", "550e", "550i", "i5 eDrive40", "i5 M60", "M5", "M5 Competition", "M5 CS"] },
    { name: "6 Series", variants: ["620d", "630d", "630i", "635d", "640d", "640i", "645Ci", "650i", "M6"] },
    { name: "7 Series", variants: ["725d", "728i", "730d", "730i", "735i", "740d", "740e", "740i", "745d", "745e", "745i", "750d", "750e", "750i", "760i", "i7 eDrive50", "i7 M70", "M760e", "M760i"] },
    { name: "8 Series", variants: ["840d", "840i", "850i", "M8", "M8 Competition", "M850i"] },
    { name: "X1", variants: ["sDrive18i", "sDrive20i", "xDrive23i", "xDrive28i", "M35i", "sDrive18d", "xDrive20d", "xDrive25e", "iX1 eDrive20", "iX1 xDrive30"] },
    { name: "X2", variants: ["sDrive18i", "sDrive20i", "xDrive28i", "M35i", "sDrive18d", "xDrive20d", "xDrive25d", "iX2 eDrive20", "iX2 xDrive30"] },
    { name: "X3", variants: ["sDrive20i", "xDrive20i", "xDrive30i", "M40i", "M50", "X3 M Competition", "xDrive20d", "xDrive30d", "M40d", "xDrive30e", "iX3"] },
    { name: "X4", variants: ["xDrive20i", "xDrive28i", "xDrive30i", "M40i", "X4 M Competition", "xDrive20d", "xDrive30d", "M40d"] },
    { name: "X5", variants: ["xDrive35i", "xDrive40i", "xDrive50i", "M50i", "M60i", "X5 M Competition", "xDrive25d", "xDrive30d", "xDrive40d", "M50d", "xDrive45e", "xDrive50e"] },
    { name: "X6", variants: ["xDrive35i", "xDrive40i", "M50i", "M60i", "X6 M Competition", "xDrive30d", "xDrive40d", "M50d"] },
    { name: "X7", variants: ["xDrive40i", "M50i", "M60i", "Alpina XB7", "xDrive40d", "M50d"] },
    { name: "XM", variants: ["XM 50e", "XM", "XM Label"] },
    { name: "I3" },
    { name: "I8" },
  ],
};

// ── BYD ──────────────────────────────────────────────────────────────────────
const byd: CarMakeData = {
  name: "BYD",
  trims: ["Active", "Boost", "Dynamic", "Comfort", "Design", "Premium", "Superior", "Ultra"],
  models: [
    { name: "Atto" },
    { name: "Dolphin" },
    { name: "Seal" },
    { name: "Seagull" },
    { name: "Sealion" },
    { name: "Song" },
    { name: "Shark" },
    { name: "Tang" },
  ],
};

// ── Cadillac ─────────────────────────────────────────────────────────────────
const cadillac: CarMakeData = {
  name: "Cadillac",
  trims: ["Luxury", "Premium Luxury", "Sport", "Platinum", "V Series"],
  models: [{ name: "Escalade" }],
};

// ── Changan ──────────────────────────────────────────────────────────────────
const changan: CarMakeData = {
  name: "Changan",
  trims: ["Comfort", "Lite", "Premium", "Luxe", "Future Sense"],
  models: [{ name: "Deepal S07" }],
};

// ── Chery ────────────────────────────────────────────────────────────────────
const chery: CarMakeData = {
  name: "Chery",
  trims: ["Aspire", "Distinction", "Summit", "Executive", "Premium"],
  models: [
    { name: "Tiggo 7" },
    { name: "Tiggo 8" },
    { name: "Tiggo 9" },
  ],
};

// ── Chevrolet ────────────────────────────────────────────────────────────────
const chevrolet: CarMakeData = {
  name: "Chevrolet",
  trims: ["WT", "Custom", "LS", "RS", "LT", "Premier", "High Country", "Trailboss", "LTZ"],
  models: [
    { name: "Corvette" },
    { name: "Camaro" },
    { name: "Captiva" },
    { name: "Corsa" },
    { name: "Blazer" },
    { name: "Cruze" },
    { name: "Impala" },
    { name: "Optra" },
    { name: "Sonic" },
    { name: "Silverado" },
    { name: "Tahoe" },
    { name: "Trailblazer" },
    { name: "Vectra" },
    { name: "Vivaro" },
  ],
};

// ── Chrysler ─────────────────────────────────────────────────────────────────
const chrysler: CarMakeData = {
  name: "Chrysler",
  trims: ["C", "LX", "S", "Touring", "Select", "Limited", "Pinnacle"],
  models: [{ name: "300" }],
};

// ── Citroen ──────────────────────────────────────────────────────────────────
const citroen: CarMakeData = {
  name: "Citroen",
  trims: ["You", "Plus", "Max", "Sense", "Sense Plus", "Shine", "Shine Plus"],
  models: [
    { name: "C3" },
    { name: "C3 Aircross" },
    { name: "C4" },
    { name: "C4 Aircross" },
    { name: "C4 Picasso" },
    { name: "C4 Space Tourer" },
    { name: "C4 Cactus" },
    { name: "C4 X" },
    { name: "C5" },
    { name: "C5 X" },
    { name: "C5 Aircross" },
    { name: "Berlingo" },
    { name: "DS" },
    { name: "DS3" },
    { name: "DS4" },
    { name: "DS5" },
  ],
};

// ── Cupra ────────────────────────────────────────────────────────────────────
const cupra: CarMakeData = {
  name: "Cupra",
  trims: ["V1", "V2", "VZ1", "VZ2", "VZ3", "VZN"],
  models: [
    { name: "Ateca" },
    { name: "Born" },
    { name: "Formentor" },
    { name: "Leon" },
    { name: "Tavascan" },
    { name: "Terramar" },
  ],
};

// ── Dacia ────────────────────────────────────────────────────────────────────
const dacia: CarMakeData = {
  name: "Dacia",
  trims: ["Essential", "Expression", "Journey", "Extreme"],
  models: [
    { name: "Duster" },
    { name: "Bigster" },
    { name: "Jogger" },
    { name: "Sandero" },
  ],
};

// ── Daihatsu ─────────────────────────────────────────────────────────────────
const daihatsu: CarMakeData = {
  name: "Daihatsu",
  trims: [
    "Activa", "L", "X", "G", "G Turbo", "Z", "Custom", "Custom RS",
    "Limited", "Style", "Sport",
  ],
  models: [
    { name: "Altis" },
    { name: "Boon" },
    { name: "Be:Go" },
    { name: "Cast" },
    { name: "Charade" },
    { name: "Copen" },
    { name: "Mira E:S" },
    { name: "Move" },
    { name: "Move Canbus" },
    { name: "Taft" },
    { name: "Tanto" },
    { name: "Hi Jet" },
    { name: "Gran Max" },
    { name: "Thor" },
    { name: "Rocky" },
    { name: "Terios" },
  ],
};

// ── Datsun ───────────────────────────────────────────────────────────────────
const datsun: CarMakeData = {
  name: "Datsun",
  trims: ["Go", "Go+", "Red-GO", "D", "A", "T"],
  models: [
    { name: "Go" },
    { name: "Go Plus" },
    { name: "Cross" },
    { name: "On Do" },
    { name: "Mi Do" },
  ],
};

// ── Denza ────────────────────────────────────────────────────────────────────
const denza: CarMakeData = {
  name: "Denza",
  trims: [
    "Luxury", "Entry", "Deluxe", "Advanced", "Flagship", "Performance",
    "Performance AWD", "Premium", "Prestige", "Max", "Pro", "Ultra",
    "BEV", "PHEV", "Limited First Edition",
  ],
  models: [
    { name: "B5" },
    { name: "B8" },
    { name: "D9" },
    { name: "N7" },
    { name: "N8" },
    { name: "N9" },
    { name: "Z9" },
    { name: "Z9 GT" },
  ],
};

// ── Dodge ────────────────────────────────────────────────────────────────────
const dodge: CarMakeData = {
  name: "Dodge",
  trims: ["Base", "SXT", "GT", "GT Plus", "R/T", "Scat Pack", "SRT Hellcat", "Redeye"],
  models: [
    { name: "Charger" },
    { name: "Challenger" },
    { name: "Journey" },
  ],
};

// ── Ferrari ──────────────────────────────────────────────────────────────────
const ferrari: CarMakeData = {
  name: "Ferrari",
  trims: ["Base", "GTB", "GTS", "Spider", "Stradale", "Speciale", "Pista", "TDF", "Modificata"],
  models: [
    { name: "458" },
    { name: "FF" },
    { name: "F12 Berlinetta" },
    { name: "488" },
    { name: "812 Superfast" },
    { name: "GTC4Lusso" },
    { name: "F8" },
    { name: "Portofino" },
    { name: "Roma" },
    { name: "SF90" },
    { name: "296 GTB/GTS" },
    { name: "12 Cilindri" },
    { name: "F80" },
    { name: "Purosangue" },
  ],
};

// ── Fiat ─────────────────────────────────────────────────────────────────────
const fiat: CarMakeData = {
  name: "Fiat",
  trims: [
    "Pop", "Pop Star", "Trekking", "Sport", "Connect", "Dolcevita",
    "La Prima", "Classica", "Lusso", "Turismo", "Competizione", "595", "695",
  ],
  models: [
    { name: "Abarth" },
    { name: "500" },
    { name: "500X" },
    { name: "500e" },
    { name: "600e" },
    { name: "Panda" },
    { name: "Tipo" },
    { name: "Doblo" },
    { name: "Ducato" },
  ],
};

// ── Ford ─────────────────────────────────────────────────────────────────────
const ford: CarMakeData = {
  name: "Ford",
  trims: [
    "Active", "XL", "XLT", "Raptor", "Limited", "Tremor", "Wildtrak",
    "Platinum", "Lariat", "ST", "ST Line", "GT", "Ecoboost", "Ecoboost Premium",
  ],
  models: [
    { name: "Bronco" },
    { name: "Capri" },
    { name: "Cortina" },
    { name: "Escort" },
    { name: "Escape" },
    { name: "Fiesta" },
    { name: "Focus" },
    { name: "F150" },
    { name: "F150 Raptor" },
    { name: "Ranger" },
    { name: "Ranger Raptor" },
    { name: "Mustang" },
    { name: "Kuga" },
    { name: "Everest" },
    { name: "Mondeo" },
    { name: "Puma" },
    { name: "Figo" },
    { name: "C-Max" },
    { name: "S-Max" },
  ],
};

// ── Geely ────────────────────────────────────────────────────────────────────
const geely: CarMakeData = {
  name: "Geely",
  trims: ["SE", "Pro", "Max", "GK", "GF"],
  models: [
    { name: "Coolray" },
    { name: "E5" },
    { name: "EX5" },
  ],
};

// ── GWM ──────────────────────────────────────────────────────────────────────
const gwm: CarMakeData = {
  name: "GWM",
  trims: ["Premium", "Luxury", "Super Luxury", "Ultra Luxury", "Vant", "Pure", "Pure+", "Pro+", "GT"],
  models: [
    { name: "ORA" },
    { name: "Funky Cat" },
    { name: "Tank 300" },
    { name: "Tank 500" },
    { name: "Haval Jolion" },
    { name: "Haval H6" },
    { name: "Haval H6 GT" },
  ],
};

// ── Honda ────────────────────────────────────────────────────────────────────
const honda: CarMakeData = {
  name: "Honda",
  trims: ["Base", "Elite", "LX", "EX", "EX-L", "Sport", "Sport-L", "Sport Touring", "Type R"],
  models: [
    { name: "Airwave" },
    { name: "Crossroad" },
    { name: "Brio" },
    { name: "Fit/Jazz" },
    { name: "Fit Shuttle" },
    { name: "City" },
    { name: "Civic" },
    { name: "Civic Type R" },
    { name: "Freed" },
    { name: "Grace" },
    { name: "Jade" },
    { name: "Legend" },
    { name: "Life" },
    { name: "Insight" },
    { name: "Mobilio" },
    { name: "Prelude" },
    { name: "NSX" },
    { name: "S660" },
    { name: "Stream" },
    { name: "Odyssey" },
    { name: "Stepwagon" },
    { name: "BR-V" },
    { name: "CR-V" },
    { name: "Elevate" },
    { name: "WR-V" },
    { name: "HR-V" },
    { name: "Vezel" },
    { name: "N-Box" },
    { name: "N-One" },
    { name: "N-Van" },
    { name: "N-Wgn" },
    { name: "Accord" },
  ],
};

// ── Hyundai ──────────────────────────────────────────────────────────────────
const hyundai: CarMakeData = {
  name: "Hyundai",
  trims: [
    "SE", "SE-L", "N-Line", "N", "Limited", "Calligraphy", "XRT",
    "Standard Range", "Long Range",
  ],
  models: [
    { name: "Accent" },
    { name: "Genesis" },
    { name: "i10" },
    { name: "i20" },
    { name: "i30" },
    { name: "i40" },
    { name: "Inster" },
    { name: "IONIQ" },
    { name: "IONIQ 5" },
    { name: "IONIQ 6" },
    { name: "IONIQ 9" },
    { name: "IX35" },
    { name: "Kona" },
    { name: "Santa Fe" },
    { name: "Sonata" },
    { name: "Tucson" },
    { name: "Veloster" },
  ],
};

// ── Isuzu ────────────────────────────────────────────────────────────────────
const isuzu: CarMakeData = {
  name: "Isuzu",
  trims: ["Active", "Elegant", "Ultimate", "Utility", "L", "LS", "LSE", "V Cross", "RS", "X-Rider"],
  models: [
    { name: "D-Max" },
    { name: "MU-X" },
    { name: "Bighorn" },
    { name: "Como" },
    { name: "Elf" },
    { name: "Forward" },
    { name: "Giga" },
    { name: "Trooper" },
    { name: "FVZ" },
    { name: "FSR" },
    { name: "FRR" },
  ],
};

// ── JAC ──────────────────────────────────────────────────────────────────────
const jac: CarMakeData = {
  name: "JAC",
  trims: ["Base", "Oasis", "Osprey", "Luxury", "Haven", "Prestige"],
  models: [
    { name: "T6" },
    { name: "T8" },
    { name: "T9" },
    { name: "X200" },
  ],
};

// ── Jaecoo ───────────────────────────────────────────────────────────────────
const jaecoo: CarMakeData = {
  name: "Jaecoo",
  trims: ["Deluxe", "Luxury", "Performance", "Vortex", "Glacier", "Inferno"],
  models: [
    { name: "J5" },
    { name: "J7" },
  ],
};

// ── Jaguar ───────────────────────────────────────────────────────────────────
const jaguar: CarMakeData = {
  name: "Jaguar",
  trims: ["S", "SE", "HSE", "First Edition", "R-Dynamic", "R-Dynamic SE", "R-Dynamic HSE", "SVR"],
  models: [
    { name: "XE" },
    { name: "XF" },
    { name: "XK" },
    { name: "XJ" },
    { name: "E-Pace" },
    { name: "I-Pace" },
    { name: "F-Pace" },
    { name: "F-Type" },
    { name: "S-Type" },
  ],
};

// ── Jeep ─────────────────────────────────────────────────────────────────────
const jeep: CarMakeData = {
  name: "Jeep",
  trims: [
    "Base", "Sport", "Laredo", "Latitude", "Altitude", "Limited",
    "Overland", "Summit", "Sahara", "Rubicon", "Trailhawk",
  ],
  models: [
    { name: "Avenger" },
    { name: "Compass" },
    { name: "Cherokee" },
    { name: "Grand Cherokee" },
    { name: "Renegade" },
    { name: "Gladiator" },
    { name: "Patriot" },
    { name: "Wrangler" },
  ],
};

// ── Jetour ───────────────────────────────────────────────────────────────────
const jetour: CarMakeData = {
  name: "Jetour",
  trims: [
    "Base", "Edge", "Aspire", "Explorer", "Odyssey", "Elite",
    "Luxury", "Premium", "Exclusive", "Flagship", "Momentum", "Deluxe",
  ],
  models: [
    { name: "Dashing" },
    { name: "T1" },
    { name: "T2" },
    { name: "X70" },
  ],
};

// ── Kia ──────────────────────────────────────────────────────────────────────
const kia: CarMakeData = {
  name: "Kia",
  trims: [
    "LX", "S", "EX", "EX X-Line", "SX", "SX X-Line", "SX X-Pro",
    "SX Prestige", "GT-Line", "Light", "Wind", "Land", "KX",
  ],
  models: [
    { name: "Ceed" },
    { name: "Carnival" },
    { name: "Carens" },
    { name: "Cerato" },
    { name: "EV3" },
    { name: "EV4" },
    { name: "EV5" },
    { name: "EV6" },
    { name: "EV9" },
    { name: "Forte" },
    { name: "K4" },
    { name: "Picanto" },
    { name: "Proceed" },
    { name: "Niro" },
    { name: "Rio" },
    { name: "Seltos" },
    { name: "Stinger" },
    { name: "Sonet" },
    { name: "Soul" },
    { name: "Sorento" },
    { name: "Sportage" },
    { name: "Stonic" },
    { name: "Telluride" },
    { name: "Tasman" },
  ],
};

// ── Lamborghini ──────────────────────────────────────────────────────────────
const lamborghini: CarMakeData = {
  name: "Lamborghini",
  trims: ["S", "SE", "Ultime", "SV", "SVJ", "EVO", "STO", "Tecnica"],
  models: [
    { name: "Huracan" },
    { name: "Aventador" },
    { name: "Urus" },
    { name: "Temerario" },
    { name: "Revuelto" },
  ],
};

// ── Land Rover ───────────────────────────────────────────────────────────────
const landRover: CarMakeData = {
  name: "Land Rover",
  trims: [
    "S", "SE", "HSE", "Dynamic SE", "Dynamic HSE", "Autobiography",
    "R Dynamic", "R Dynamic SE", "R Dynamic HSE", "XS", "GS", "SV",
    "OCTA", "X", "X-Dynamic SE", "X-Dynamic HSE", "First Edition",
    "Launch Edition", "HSE Luxury",
  ],
  models: [
    { name: "Defender 90" },
    { name: "Defender 110" },
    { name: "Defender 130" },
    { name: "Range Rover Evoque" },
    { name: "Range Rover Sport" },
    { name: "Range Rover" },
    { name: "Range Rover Velar" },
    { name: "Discovery" },
    { name: "Discovery Sport" },
  ],
};

// ── Lexus ────────────────────────────────────────────────────────────────────
const lexus: CarMakeData = {
  name: "Lexus",
  trims: ["Base", "Premium", "Luxury", "Ultra Luxury", "F SPORT"],
  models: [
    { name: "CT" },
    { name: "ES" },
    { name: "GS" },
    { name: "GX" },
    { name: "IS" },
    { name: "LC" },
    { name: "LS" },
    { name: "LX" },
    { name: "NX" },
    { name: "RC" },
    { name: "RX" },
    { name: "UX" },
  ],
};

// ── Maserati ─────────────────────────────────────────────────────────────────
const maserati: CarMakeData = {
  name: "Maserati",
  trims: ["GT", "Modena", "Trofeo"],
  models: [
    { name: "Levante" },
    { name: "Gran Turismo" },
    { name: "Grecale" },
    { name: "Gran Cabrio" },
    { name: "Quattroporte" },
  ],
};

// ── Mazda ────────────────────────────────────────────────────────────────────
const mazda: CarMakeData = {
  name: "Mazda",
  trims: [
    "C", "S", "S-Touring", "S-L Package", "XD", "XD-L Package",
    "Proactive", "S Proactive", "XD Proactive", "Luxury", "Urban Dresser",
    "Premium", "Select", "Turbo", "Exclusive Mode", "Premium Plus",
    "Black Tone Edition", "L-Package", "Premium Sports", "Sport", "Prestige",
  ],
  models: [
    { name: "Atenza Sedan" },
    { name: "Atenza Wagon" },
    { name: "Axela Sedan" },
    { name: "Axela Sport" },
    { name: "Biante" },
    { name: "Bongo" },
    { name: "Carol" },
    { name: "CX-3" },
    { name: "CX-5" },
    { name: "CX-60" },
    { name: "CX-7" },
    { name: "CX-70" },
    { name: "CX-80" },
    { name: "CX-90" },
    { name: "CX-8" },
    { name: "CX-9" },
    { name: "Demio" },
    { name: "Mazda 2" },
    { name: "Mazda 3 Sedan" },
    { name: "Mazda 3 Fastback" },
    { name: "Mazda 5" },
    { name: "Mazda 6 Sedan" },
    { name: "Mazda 6 Wagon" },
    { name: "323" },
    { name: "BT-50" },
    { name: "MX-30" },
    { name: "MX-5" },
    { name: "Tribute" },
    { name: "RX-7" },
    { name: "RX-8" },
    { name: "Flair" },
    { name: "Familia" },
    { name: "Scrum" },
    { name: "Premacy" },
    { name: "Roadster" },
    { name: "Titan" },
    { name: "Verisa" },
  ],
};

// ── McLaren ──────────────────────────────────────────────────────────────────
const mclaren: CarMakeData = {
  name: "McLaren",
  trims: ["Base", "Performance", "TechLux", "Vision", "Luxury", "GT"],
  models: [
    { name: "570" },
    { name: "600" },
    { name: "620" },
    { name: "720" },
    { name: "750" },
    { name: "765" },
    { name: "GT" },
    { name: "Artura" },
  ],
};

// ── Mercedes-Benz ────────────────────────────────────────────────────────────
const mercedesBenz: CarMakeData = {
  name: "Mercedes-Benz",
  trims: [
    "Ambiente", "Avantgarde", "Avantgarde S", "AMG Line", "AMG", "AMG S",
    "BiTurbo", "Classic", "Elegance", "Exclusive Line", "Limited", "Luxury",
    "Sports Edition", "Laureus Edition", "Sportline", "Blue Efficiency",
    "CGI", "Designo Edition", "Manufaktur Edition", "Night Edition",
    "Carbon Edition", "Edition 1", "Kompressor", "4Matic",
  ],
  models: [
    { name: "A Class", variants: ["A 140", "A 160", "A 170", "A 180", "A 200", "A 220 4MATIC", "A 250", "AMG A 35", "AMG A 45"] },
    { name: "B Class", variants: ["B 150", "B 160", "B 170", "B 180", "B 200", "B 220 4MATIC", "B 250"] },
    { name: "C Class", variants: ["C 160", "C 180", "C 200", "C 220", "C 230", "C 240", "C 250", "C 280", "C 300", "C 320", "C 350", "C 400", "AMG C 43", "AMG C 63"] },
    { name: "E Class", variants: ["E 200", "E 220", "E 230", "E 240", "E 250", "E 280", "E 300", "E 320", "E 350", "E 400", "E 500", "AMG E 53", "AMG E 63"] },
    { name: "G Class", variants: ["G 350 d", "G 400 d", "G 500", "G 550", "AMG G 63", "AMG G 65"] },
    { name: "S Class", variants: ["S 320", "S 350", "S 400", "S 450", "S 500", "S 580", "S 600", "S 680", "AMG S 63"] },
    { name: "X Class", variants: ["X250d", "X350d"] },
    { name: "V Class", variants: ["V220d", "V250d", "V300d"] },
    { name: "Viano" },
    { name: "Vito" },
    { name: "AMG GT", variants: ["GT43", "GT55", "GT63", "GT63S"] },
    { name: "CLK" },
    { name: "CLS", variants: ["CLS220d", "CLS250d", "CLS300", "CLS350", "CLS400", "CLS450", "CLS500", "CLS53", "CLS63"] },
    { name: "GLA", variants: ["GLA 180", "GLA 200", "GLA 250", "AMG GLA 35", "AMG GLA 45"] },
    { name: "GLB", variants: ["GLB 180", "GLB 200", "GLB 250", "AMG GLB 35"] },
    { name: "GLC", variants: ["GLC 200", "GLC 250", "GLC 300", "GLC 43", "GLC 63"] },
    { name: "GLE", variants: ["GLE 350", "GLE 400", "GLE 450", "GLE 580", "AMG GLE 53", "AMG GLE 63"] },
    { name: "GLS", variants: ["GLS 450", "GLS 500", "GLS 580", "Maybach GLS 600", "AMG GLS 63"] },
    { name: "SL", variants: ["AMG SL 43", "AMG SL 55", "AMG SL 63"] },
    { name: "SLC" },
    { name: "SLK" },
    { name: "R Class" },
    { name: "Maybach" },
    { name: "190E" },
  ],
};

// ── MG ───────────────────────────────────────────────────────────────────────
const mg: CarMakeData = {
  name: "MG",
  trims: ["SE", "Trophy", "Explore", "Excite", "Exclusive"],
  models: [
    { name: "MG3" },
    { name: "MG4" },
    { name: "MG5" },
    { name: "MG7" },
    { name: "MG Cyberster" },
    { name: "MG ZS" },
    { name: "IM5" },
    { name: "IM6" },
  ],
};

// ── Mitsubishi ───────────────────────────────────────────────────────────────
const mitsubishi: CarMakeData = {
  name: "Mitsubishi",
  trims: [
    "ES", "LE", "SE", "Ralliart", "Trail Edition", "SEL", "Black Edition",
    "G", "G Limited", "M", "G Plus Package", "GE", "VR", "VR-4", "Limited",
    "GSR", "MR", "RS", "Exceed", "Super Saloon",
  ],
  models: [
    { name: "Airtrek" },
    { name: "ASX" },
    { name: "Colt" },
    { name: "Colt Plus" },
    { name: "Chariot" },
    { name: "Diamante" },
    { name: "Delica" },
    { name: "Delica Mini" },
    { name: "Eclipse" },
    { name: "Eclipse Cross" },
    { name: "Galant" },
    { name: "Lancer" },
    { name: "Lancer Evolution" },
    { name: "L200/Triton" },
    { name: "L300" },
    { name: "Mirage" },
    { name: "Minicab" },
    { name: "Proudia" },
    { name: "Pajero" },
    { name: "Pajero IO" },
    { name: "Pajero Mini" },
    { name: "Outlander" },
    { name: "RVR" },
  ],
};

// ── Nissan ───────────────────────────────────────────────────────────────────
const nissan: CarMakeData = {
  name: "Nissan",
  trims: [
    "Autech", "Axis", "Base", "DIG-S", "E-Power", "E-4ORCE", "Nismo",
    "Highway Star", "Medalist", "Performance", "Rider", "RS", "S", "SE",
    "ST", "Touring", "X", "XV",
  ],
  models: [
    { name: "Ariya" },
    { name: "Sentra" },
    { name: "March" },
    { name: "Advan" },
    { name: "Atlas" },
    { name: "Bluebird" },
    { name: "NV200" },
    { name: "Note" },
    { name: "Caravan/NV350" },
    { name: "Civilian" },
    { name: "Clipper" },
    { name: "Kicks" },
    { name: "Avenir" },
    { name: "Primera" },
    { name: "Hardbody" },
    { name: "Serena" },
    { name: "Figaro" },
    { name: "Sunny" },
    { name: "Altima" },
    { name: "Quest" },
    { name: "Terrano II" },
    { name: "Skyline" },
    { name: "Skyline Crossover" },
    { name: "Wingroad" },
    { name: "Stagea" },
    { name: "Navara/NP300" },
    { name: "Elgrand" },
    { name: "GT-R" },
    { name: "Cube" },
    { name: "Sylphy" },
    { name: "Xterra" },
    { name: "X-Trail" },
    { name: "Murano" },
    { name: "Teana" },
    { name: "350Z/Fairlady" },
    { name: "Dayz" },
    { name: "Fuga" },
    { name: "Tiida" },
    { name: "Sakura" },
    { name: "Versa" },
    { name: "Qashqai" },
    { name: "Rogue" },
    { name: "Roox" },
    { name: "Leaf" },
    { name: "Juke" },
    { name: "Nissan Z" },
    { name: "Vanette" },
  ],
};

// ── Omoda ────────────────────────────────────────────────────────────────────
const omoda: CarMakeData = {
  name: "Omoda",
  trims: ["Comfort", "Knight", "BX", "EX", "Noble"],
  models: [
    { name: "5/C5" },
    { name: "E5" },
    { name: "7" },
    { name: "9" },
    { name: "S5/05" },
    { name: "3" },
  ],
};

// ── Opel ─────────────────────────────────────────────────────────────────────
const opel: CarMakeData = {
  name: "Opel",
  trims: ["GS", "GSI", "GSE", "Active", "Business", "Elite", "Nav"],
  models: [
    { name: "Corsa" },
    { name: "Insignia" },
    { name: "Astra" },
    { name: "Grandland" },
    { name: "Mokka" },
    { name: "Combo" },
    { name: "Zafira" },
  ],
};

// ── Peugeot ──────────────────────────────────────────────────────────────────
const peugeot: CarMakeData = {
  name: "Peugeot",
  trims: [
    "Active", "Active Premium", "Allure", "Allure Premium", "Asphalt",
    "Blue HDI", "Business", "GT", "GT Exclusive", "GT Line", "Puretech",
    "Sport", "Style",
  ],
  models: [
    { name: "106" },
    { name: "205" },
    { name: "206" },
    { name: "207" },
    { name: "208" },
    { name: "301" },
    { name: "306" },
    { name: "308" },
    { name: "309" },
    { name: "405" },
    { name: "406" },
    { name: "407" },
    { name: "408" },
    { name: "508" },
    { name: "605" },
    { name: "806" },
    { name: "2008" },
    { name: "3008" },
    { name: "4008" },
    { name: "5008" },
    { name: "Boxer" },
    { name: "Expert" },
    { name: "Partner" },
    { name: "RCZ" },
    { name: "Rifter" },
    { name: "Traveller" },
    { name: "Landtrek" },
  ],
};

// ── Porsche ──────────────────────────────────────────────────────────────────
const porsche: CarMakeData = {
  name: "Porsche",
  trims: [
    "E-Hybrid", "GT", "GT4", "GT4 RS", "GTS", "S", "S E-Hybrid",
    "Platinum Edition", "RS", "Turbo", "Turbo S", "Turbo S E-Hybrid",
    "Turbo E-Hybrid", "Sport Chrono Package", "Black Edition", "Performance",
  ],
  models: [
    { name: "911", variants: ["Carrera", "Carrera 4", "Carrera 4S", "Carrera GTS", "Targa 4", "Targa 4S", "Turbo", "Turbo S", "GT2 RS", "GT3", "GT3 RS", "Dakar", "S/T", "Sport Classic", "T-Hybrid"] },
    { name: "924" },
    { name: "928" },
    { name: "944" },
    { name: "968" },
    { name: "718 Spyder" },
    { name: "Boxster" },
    { name: "Cayenne" },
    { name: "Cayman" },
    { name: "Macan" },
    { name: "Panamera" },
    { name: "Taycan" },
  ],
};

// ── Renault ──────────────────────────────────────────────────────────────────
const renault: CarMakeData = {
  name: "Renault",
  trims: [
    "Base Grade", "Basic", "E-Tech", "Evolution", "Intens", "Techno",
    "Esprit Alpine", "GT", "GT Line", "Premium", "Limited", "RS",
    "RS Ultime", "Trophy", "Sport", "Zen",
  ],
  models: [
    { name: "Alpine" },
    { name: "Arkana" },
    { name: "Captur" },
    { name: "Clio" },
    { name: "Kangoo" },
    { name: "Koleos" },
    { name: "Lutecia" },
    { name: "Megane" },
    { name: "Scenic" },
    { name: "Twingo" },
  ],
};

// ── Rolls Royce ──────────────────────────────────────────────────────────────
const rollsRoyce: CarMakeData = {
  name: "Rolls Royce",
  trims: [],
  models: [
    { name: "Cullinan" },
    { name: "Phantom" },
    { name: "Ghost" },
    { name: "Wraith" },
    { name: "Spectre" },
  ],
};

// ── SEAT ─────────────────────────────────────────────────────────────────────
const seat: CarMakeData = {
  name: "SEAT",
  trims: ["SE", "SE Technology", "FR", "FR Sport", "XPERIENCE", "XPERIENCE LUX"],
  models: [
    { name: "Ateca" },
    { name: "Ibiza" },
    { name: "Leon" },
    { name: "Leon Cupra" },
  ],
};

// ── Smart ────────────────────────────────────────────────────────────────────
const smart: CarMakeData = {
  name: "Smart",
  trims: ["Brabus", "Pure", "Passion", "Prime", "Premium", "Pro", "Pro+"],
  models: [
    { name: "ForFour" },
    { name: "ForTwo" },
    { name: "#1" },
    { name: "#3" },
    { name: "#5" },
  ],
};

// ── Subaru ───────────────────────────────────────────────────────────────────
const subaru: CarMakeData = {
  name: "Subaru",
  trims: [
    "Advance", "Base", "B Sport", "Eyesight", "GT", "Premium", "Sport",
    "Limited", "Touring", "Wilderness", "I-L", "I-S", "XT", "SI", "X",
    "XS", "Cross Sports", "S-Limited", "STI", "X-Break",
  ],
  models: [
    { name: "Impreza" },
    { name: "Outback" },
    { name: "Forester" },
    { name: "Levorg" },
    { name: "Legacy" },
    { name: "Levorg Layback" },
    { name: "Sambar" },
    { name: "Solterra" },
    { name: "XV" },
    { name: "Exiga" },
    { name: "Stella" },
    { name: "Rex Crossover" },
    { name: "Leone" },
    { name: "BRZ" },
    { name: "WRX" },
    { name: "WRX STI" },
    { name: "Trezia" },
    { name: "Tribeca" },
    { name: "Chiffon" },
    { name: "Pleo Plus" },
  ],
};

// ── Suzuki ───────────────────────────────────────────────────────────────────
const suzuki: CarMakeData = {
  name: "Suzuki",
  trims: [
    "A", "Base Grade", "Classic", "Custom", "F", "FC", "G", "G Limited",
    "Hybrid", "Hybrid G/X", "Hybrid Turbo", "J Style", "JC", "JM", "Join",
    "L", "Land Venture", "LX", "LXI", "Nomade", "PA", "S", "SE", "STD",
    "SZ", "Turbo", "V6", "VXI", "X", "X-Adventure", "XG", "XL", "XS", "ZXI",
  ],
  models: [
    { name: "Alto" },
    { name: "Baleno" },
    { name: "Carry" },
    { name: "Every" },
    { name: "Every Wagon" },
    { name: "Fronx" },
    { name: "Hustler" },
    { name: "Ignis" },
    { name: "Jimny" },
    { name: "Jimny Nomade" },
    { name: "Jimny Sierra" },
    { name: "Kei" },
    { name: "Kizashi" },
    { name: "Palette" },
    { name: "Palette SW" },
    { name: "Solio" },
    { name: "Solio Bandit" },
    { name: "Spacia" },
    { name: "Spacia Base" },
    { name: "Spacia Custom" },
    { name: "Spacia Custom Z" },
    { name: "Spacia Gear" },
    { name: "Swift" },
    { name: "Swift Sport" },
    { name: "SX4" },
    { name: "SX4 Cross" },
    { name: "Wagon R" },
    { name: "Wagon R Custom" },
    { name: "Wagon R Stingray" },
    { name: "Escudo" },
    { name: "Vitara" },
  ],
};

// ── Tesla ────────────────────────────────────────────────────────────────────
const tesla: CarMakeData = {
  name: "Tesla",
  trims: ["Standard RWD", "Premium RWD", "Long Range RWD", "Premium Long Range AWD", "Long Range AWD", "Performance", "Plaid"],
  models: [
    { name: "Model S" },
    { name: "Model 3" },
    { name: "Model X" },
    { name: "Model Y" },
    { name: "Cybertruck" },
  ],
};

// ── Toyota ───────────────────────────────────────────────────────────────────
const toyota: CarMakeData = {
  name: "Toyota",
  trims: [],
  models: [
    { name: "86", variants: ["G", "GT", "GR SPORT", "GT LIMITED"] },
    { name: "Allion" },
    { name: "Alphard", variants: ["240S", "240X", "3.5 Executive Lounge", "350G", "350S", "G", "X", "Z"] },
    { name: "Alphard Hybrid" },
    { name: "Aqua", variants: ["G", "L", "S", "U", "X", "Z"] },
    { name: "Auris" },
    { name: "Avensis" },
    { name: "Aygo" },
    { name: "bB" },
    { name: "BZ4X", variants: ["G", "Z"] },
    { name: "C-HR", variants: ["G", "G-T", "S", "S-T", "GR SPORT"] },
    { name: "Camry", variants: ["Hybrid", "Hybrid G", "X", "XE", "XS", "ZV", "ZX"] },
    { name: "Carina" },
    { name: "Celica" },
    { name: "Century" },
    { name: "Coaster" },
    { name: "Corolla", variants: ["G", "G-X", "Hybrid G", "Hybrid X", "Hybrid S", "Hybrid WxB", "S", "WxB", "X"] },
    { name: "Corolla Axio", variants: ["1.3X", "1.5G", "1.5X", "EX", "G", "Hybrid", "Hybrid G WxB", "Luxel", "X"] },
    { name: "Corolla Cross", variants: ["G", "GR SPORT", "Hybrid G", "Hybrid S", "Hybrid Z", "S", "Z"] },
    { name: "Corolla Fielder", variants: ["1.5G", "1.5X", "1.8S", "EX", "Hybrid", "Hybrid G WxB", "S", "X", "Z"] },
    { name: "Corolla Rumion" },
    { name: "Corolla Sport" },
    { name: "Corolla Touring" },
    { name: "Crown", variants: ["Athlete", "Royal Saloon", "RS"] },
    { name: "Crown Crossover", variants: ["G", "G Advanced", "RS", "RS Advanced", "X", "Z"] },
    { name: "Crown Estate" },
    { name: "Crown Sport" },
    { name: "Dyna Truck" },
    { name: "Esquire" },
    { name: "Estima" },
    { name: "FJ Cruiser" },
    { name: "GR86", variants: ["RC", "RZ", "SZ"] },
    { name: "GR Corolla", variants: ["RZ", "RZ Morizo Edition"] },
    { name: "GR Yaris", variants: ["RC", "RS", "RZ", "High Performance"] },
    { name: "GRMN Yaris" },
    { name: "Granace" },
    { name: "Harrier", variants: ["Elegance", "Premium", "Progress", "S", "Z", "Z Leather Package"] },
    { name: "Harrier Hybrid" },
    { name: "Harrier PHEV" },
    { name: "Hiace Commuter" },
    { name: "Hiace Van", variants: ["DX", "GL", "Super Long DX", "Super Long GL"] },
    { name: "Hilux", variants: ["Basegrade", "GR SPORT", "Invincible", "Invincible X", "Revo Rocco", "SR", "SR5", "X", "Z"] },
    { name: "Hilux Surf" },
    { name: "Isis" },
    { name: "Ist" },
    { name: "Kluger" },
    { name: "Land Cruiser", variants: ["AX", "AX-G", "GX", "GR SPORT", "Sahara", "VX", "ZX"] },
    { name: "Land Cruiser 100" },
    { name: "Land Cruiser 250", variants: ["GX", "TX", "VX", "ZX"] },
    { name: "Land Cruiser 70" },
    { name: "Land Cruiser 76" },
    { name: "Land Cruiser 79" },
    { name: "Land Cruiser 80" },
    { name: "Land Cruiser Prado", variants: ["GX", "TX", "TX-L", "TZ", "TZ-G", "VX", "VX-L", "Kakadu", "ZX"] },
    { name: "Liteace" },
    { name: "Mark II" },
    { name: "Mark X", variants: ["250G", "250S", "350G", "350S", "Premium", "Vertiga"] },
    { name: "Mirai" },
    { name: "Noah", variants: ["G", "Hybrid G", "Hybrid SI", "Hybrid X", "SI", "X"] },
    { name: "Passo" },
    { name: "Pixis Epoch" },
    { name: "Pixis Joy" },
    { name: "Pixis Mega" },
    { name: "Pixis Space" },
    { name: "Porte" },
    { name: "Premio", variants: ["1.5F", "1.8X", "2.0G"] },
    { name: "Prius", variants: ["A Touring", "G", "L", "S", "U", "X", "Z"] },
    { name: "Prius Alpha" },
    { name: "Prius PHV" },
    { name: "Probox", variants: ["DX", "F", "G", "GL", "Hybrid F", "Hybrid GL"] },
    { name: "Ractis" },
    { name: "Raize", variants: ["G", "X", "X S", "Z"] },
    { name: "RAV4", variants: ["Adventure", "G", "G Z Package", "Hybrid Adventure", "Hybrid G", "Hybrid X", "Hybrid Z", "Sport", "X"] },
    { name: "Regius Ace" },
    { name: "Roomy", variants: ["G", "G S", "G-T", "X", "X S"] },
    { name: "Rush" },
    { name: "Sai" },
    { name: "Sienta", variants: ["Dice", "Funbase", "G", "Hybrid G", "Hybrid Funbase"] },
    { name: "Spade" },
    { name: "Starlet" },
    { name: "Succeed" },
    { name: "Supra", variants: ["G", "GT", "GT Twin Turbo", "GZ", "S", "SZ-R"] },
    { name: "Tank" },
    { name: "Townace Truck" },
    { name: "Townace Van" },
    { name: "Vanguard" },
    { name: "Vellfire", variants: ["2.4V", "2.4Z", "2.5V", "2.5Z", "3.5V", "3.5Z", "Executive Lounge", "Golden Eyes", "Z Premier"] },
    { name: "Vitz", variants: ["1.0F", "1.3F", "F L", "GR SPORT", "Hybrid F", "Hybrid Jewela", "Jewela", "RS", "U", "X"] },
    { name: "Voxy", variants: ["S-G", "S-Z", "S", "V", "X", "Z", "ZS", "Hybrid S-G", "Hybrid S-Z", "Hybrid X", "Hybrid V", "Hybrid ZS"] },
    { name: "Wish", variants: ["1.8S", "1.8X", "2.0G", "2.0Z"] },
    { name: "Yaris", variants: ["G", "X", "Z", "Hybrid G", "Hybrid U", "Hybrid X", "Hybrid Z"] },
    { name: "Yaris Cross", variants: ["G", "GR SPORT", "Hybrid G", "Hybrid GR SPORT", "Hybrid U", "Hybrid X", "Hybrid Z", "Hybrid Z Adventure"] },
  ],
};

// ── Vauxhall ─────────────────────────────────────────────────────────────────
const vauxhall: CarMakeData = {
  name: "Vauxhall",
  trims: ["SE", "SRI", "Elite", "Ultimate", "SE Premium", "SRI Premium", "Elite Premium", "Design", "GS", "GSe", "Griffin"],
  models: [
    { name: "Astra" },
    { name: "Astra Electric" },
    { name: "Corsa" },
    { name: "Combo" },
    { name: "Crossland" },
    { name: "Crossland X" },
    { name: "Grandland" },
    { name: "Grandland X" },
    { name: "Grandland Electric" },
    { name: "Insignia" },
    { name: "Mokka" },
    { name: "Mokka X" },
    { name: "Mokka Electric" },
    { name: "Vivaro" },
  ],
};

// ── Volkswagen ───────────────────────────────────────────────────────────────
const volkswagen: CarMakeData = {
  name: "Volkswagen",
  trims: [
    "S", "Trendline", "Life", "SE", "Comfort", "Style", "Match", "SEL",
    "Highline", "R-line", "R", "GTI", "GTD", "GTE", "GT", "GT Plus",
    "SE with Tech", "Black Edition",
  ],
  models: [
    { name: "Amarok" },
    { name: "Arteon" },
    { name: "Beetle" },
    { name: "Caddy" },
    { name: "Caravelle" },
    { name: "CC" },
    { name: "City" },
    { name: "Crafter" },
    { name: "Golf" },
    { name: "Jetta" },
    { name: "Kombi" },
    { name: "Passat" },
    { name: "Polo" },
    { name: "Polo Vivo" },
    { name: "Scirocco" },
    { name: "Sharan" },
    { name: "T-Cross" },
    { name: "T-Roc" },
    { name: "Taigo" },
    { name: "Tayron" },
    { name: "Tiguan" },
    { name: "Tiguan Allspace" },
    { name: "Touareg" },
    { name: "Touran" },
    { name: "Transporter" },
    { name: "UP" },
  ],
};

// ── Volvo ────────────────────────────────────────────────────────────────────
const volvo: CarMakeData = {
  name: "Volvo",
  trims: [
    "Core", "Plus", "Plus Pro", "Ultra", "Black Edition", "Momentum",
    "Inscription", "R-Design", "Cross Country", "Polestar Engineered",
    "T3", "T4", "T5", "T6", "T8 Recharge", "B4", "B5", "B6", "SE",
    "Ocean Race", "D4", "D5", "Recharge Ultimate",
  ],
  models: [
    { name: "850" },
    { name: "960" },
    { name: "C30" },
    { name: "C40" },
    { name: "C70" },
    { name: "EC40" },
    { name: "ES90" },
    { name: "EX30" },
    { name: "EX30 Cross Country" },
    { name: "EX40" },
    { name: "EX60" },
    { name: "EX90" },
    { name: "S40" },
    { name: "S60" },
    { name: "S80" },
    { name: "S90" },
    { name: "V40" },
    { name: "V40 Cross Country" },
    { name: "V50" },
    { name: "V60" },
    { name: "V60 Cross Country" },
    { name: "V70" },
    { name: "V90" },
    { name: "V90 Cross Country" },
    { name: "XC40" },
    { name: "XC60" },
    { name: "XC70" },
    { name: "XC90" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// Aggregated export
// ══════════════════════════════════════════════════════════════════════════════

export const CAR_MAKES_DATA: CarMakeData[] = [
  alfaRomeo,
  astonMartin,
  audi,
  bentley,
  bmw,
  byd,
  cadillac,
  changan,
  chery,
  chevrolet,
  chrysler,
  citroen,
  cupra,
  dacia,
  daihatsu,
  datsun,
  denza,
  dodge,
  ferrari,
  fiat,
  ford,
  geely,
  gwm,
  honda,
  hyundai,
  isuzu,
  jac,
  jaecoo,
  jaguar,
  jeep,
  jetour,
  kia,
  lamborghini,
  landRover,
  lexus,
  maserati,
  mazda,
  mclaren,
  mercedesBenz,
  mg,
  mitsubishi,
  nissan,
  omoda,
  opel,
  peugeot,
  porsche,
  renault,
  rollsRoyce,
  seat,
  smart,
  subaru,
  suzuki,
  tesla,
  toyota,
  vauxhall,
  volkswagen,
  volvo,
].sort((a, b) => a.name.localeCompare(b.name));

// ── Convenience helpers ──────────────────────────────────────────────────────

/** Sorted list of all make names */
export const ALL_MAKES = CAR_MAKES_DATA.map((m) => m.name);

/** Look up a make by name (case-insensitive) */
export function getMakeData(name: string): CarMakeData | undefined {
  return CAR_MAKES_DATA.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );
}

/** Get model names for a given make */
export function getModelsForMake(makeName: string): string[] {
  const make = getMakeData(makeName);
  return make ? make.models.map((m) => m.name) : [];
}

/** Get trims for a given make */
export function getTrimsForMake(makeName: string): string[] {
  const make = getMakeData(makeName);
  return make ? make.trims : [];
}

/** Get variants for a specific model within a make */
export function getVariantsForModel(
  makeName: string,
  modelName: string
): string[] {
  const make = getMakeData(makeName);
  if (!make) return [];
  const model = make.models.find(
    (m) => m.name.toLowerCase() === modelName.toLowerCase()
  );
  return model?.variants ?? [];
}
