export const USER_ROLE_OPTIONS = [
  {
    value: "buyer",
    label: "Buyer",
    description: "Discover vehicles, save favorites, and contact verified sellers.",
  },
  {
    value: "seller",
    label: "Seller",
    description: "List your vehicle directly and manage offers from buyers.",
  },
  {
    value: "dealer",
    label: "Dealer",
    description: "Run inventory at scale with verification and team workflows.",
  },
] as const;

export type UserRole = (typeof USER_ROLE_OPTIONS)[number]["value"];

export const ONBOARDING_STEPS = [
  {
    id: "account",
    title: "Account Setup",
    description: "Create your profile and secure login credentials.",
  },
  {
    id: "role",
    title: "Role Selection",
    description: "Choose your account role to unlock relevant tools.",
  },
  {
    id: "verification",
    title: "Verification",
    description: "Provide identity and business details for trust signals.",
  },
  {
    id: "confirmation",
    title: "Confirmation",
    description: "Review and complete onboarding.",
  },
] as const;

export const LISTING_WIZARD_STEPS = [
  {
    id: "category",
    title: "Category Selection",
    description: "Choose one category before entering details.",
  },
  {
    id: "details",
    title: "Vehicle / Equipment Details",
    description: "Dynamic fields based on selected category.",
  },
  {
    id: "basics",
    title: "Listing Basics",
    description: "Core listing information shared across all categories.",
  },
  {
    id: "features",
    title: "Features & Specifications",
    description: "Select predefined feature IDs only.",
  },
  {
    id: "media",
    title: "Media Uploads",
    description: "Photo selection, gallery management, documents, and optional video.",
  },
  {
    id: "seller",
    title: "Seller Information",
    description: "Set contact and visibility preferences.",
  },
  {
    id: "intelligence",
    title: "Price Intelligence",
    description: "Market indicator display only for MVP.",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Preview and submit for admin moderation.",
  },
] as const;

export const LISTING_CATEGORY_OPTIONS = [
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "motorbike", label: "Motorbike" },
  { value: "truck", label: "Truck" },
  { value: "plant_construction", label: "Plant & Construction" },
  { value: "farm_agricultural", label: "Farm & Agricultural" },
] as const;

export type ListingCategory = (typeof LISTING_CATEGORY_OPTIONS)[number]["value"];

export const LISTING_CONDITION_OPTIONS = [
  { value: "new", label: "Brand new" },
  { value: "locally_used", label: "Locally used" },
  { value: "foreign_used", label: "Foreign used" },
] as const;

export const LISTING_AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "reserved", label: "Reserved" },
] as const;

export const KENYA_CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Kitale",
  "Malindi",
  "Garissa",
  "Kakamega",
  "Nyeri",
  "Kisii",
  "Machakos",
  "Meru",
  "Kericho",
  "Nanyuki",
  "Naivasha",
  "Voi",
  "Embu",
  "Kiambu",
] as const;

export type ListingFeatureGroupKey = string;

export type ListingFeatureOption = {
  id: string;
  label: string;
  aliases?: readonly string[];
};

export type ListingFeatureDefinition = ListingFeatureOption & {
  group: ListingFeatureGroupKey;
};

export type ListingFeatureGroups = Record<ListingFeatureGroupKey, ListingFeatureOption[]>;

export type ListingFeatureGroupDefinition = {
  order: readonly ListingFeatureGroupKey[];
  labels: Record<ListingFeatureGroupKey, string>;
};

const CAR_VAN_TRUCK_GROUP_DEF: ListingFeatureGroupDefinition = {
  order: [
    "safety",
    "technology_driver_assist",
    "infotainment",
    "audio_visual",
    "interior",
    "exterior",
    "comfort_convenience",
    "performance_mechanical",
  ],
  labels: {
    safety: "Safety",
    technology_driver_assist: "Technology & Driver Assist",
    infotainment: "Infotainment",
    audio_visual: "Audio & Visual",
    interior: "Interior",
    exterior: "Exterior",
    comfort_convenience: "Comfort & Convenience",
    performance_mechanical: "Performance & Mechanical",
  },
};

const MOTORBIKE_GROUP_DEF: ListingFeatureGroupDefinition = {
  order: ["safety", "performance", "comfort", "electronics", "accessories"],
  labels: {
    safety: "Safety",
    performance: "Performance",
    comfort: "Comfort",
    electronics: "Electronics",
    accessories: "Accessories",
  },
};

const FARM_GROUP_DEF: ListingFeatureGroupDefinition = {
  order: ["power_drive", "hydraulics", "cabin_comfort", "attachments", "efficiency"],
  labels: {
    power_drive: "Power & Drive",
    hydraulics: "Hydraulics",
    cabin_comfort: "Cabin & Comfort",
    attachments: "Attachments",
    efficiency: "Efficiency",
  },
};

const PLANT_GROUP_DEF: ListingFeatureGroupDefinition = {
  order: ["hydraulics", "cabin_safety", "control_systems", "monitoring_telematics"],
  labels: {
    hydraulics: "Hydraulics",
    cabin_safety: "Cabin & Safety",
    control_systems: "Control Systems",
    monitoring_telematics: "Monitoring & Telematics",
  },
};

export const LISTING_FEATURE_GROUPS_BY_CATEGORY: Record<
  ListingCategory,
  ListingFeatureGroupDefinition
> = {
  car: CAR_VAN_TRUCK_GROUP_DEF,
  van: CAR_VAN_TRUCK_GROUP_DEF,
  truck: CAR_VAN_TRUCK_GROUP_DEF,
  motorbike: MOTORBIKE_GROUP_DEF,
  farm_agricultural: FARM_GROUP_DEF,
  plant_construction: PLANT_GROUP_DEF,
};

const GLOBAL_CAR_FEATURE_LABELS = [
  "ABS (Anti-lock Braking System)",
  "Active Aerodynamics",
  "Active Bonnet (Pedestrian Safety)",
  "Active Cruise Control",
  "Active Differential",
  "Active Exhaust System",
  "Active Head Restraints",
  "Active Lane Assist",
  "Active Noise Cancellation",
  "Adaptive Air Suspension",
  "Adaptive Cruise Control (ACC)",
  "Adaptive Dampers",
  "Adaptive Headlights",
  "Adjustable Steering Column",
  "Advanced Driver Assistance Systems (ADAS)",
  "Air Conditioning (Manual)",
  "Air Conditioning (Automatic)",
  "Air Ioniser / Air Purifier",
  "Air Quality Sensor",
  "Air Suspension",
  "Airbags (Driver, Passenger, Side, Curtain, Knee)",
  "Alarm System",
  "Ambient Interior Lighting",
  "Android Auto",
  "Anti-Theft Immobiliser",
  "Anti-Slip Regulation (ASR)",
  "Apple CarPlay",
  "Auto Hold (Brake Hold)",
  "Auto Start-Stop",
  "Auto-Dimming Rear View Mirror",
  "Automatic Emergency Braking (AEB)",
  "Automatic Headlights",
  "Automatic High Beam Assist",
  "Automatic Parking",
  "Automatic Tailgate",
  "Autonomous Driving (Level 1-4)",
  "Auxiliary Input (AUX)",
  "Blind Spot Monitoring (BSM)",
  "Bluetooth Connectivity",
  "Body Control Module",
  "Brake Assist",
  "Brake Energy Regeneration",
  "Brake Hold",
  "Brake Override System",
  "Brake-by-Wire",
  "Built-in Dashcam",
  "Built-in Navigation",
  "Bi-Xenon Headlights",
  "Cabin Air Filter",
  "Camera System (Front / Rear)",
  "Camera System (360 deg / Surround View)",
  "Carbon Ceramic Brakes",
  "Central Locking",
  "Child Lock",
  "Child Seat Anchors (ISOFIX / LATCH)",
  "Climate Control (Dual / Tri / Multi-Zone)",
  "Collision Avoidance System",
  "Collision Warning (Forward / Rear)",
  "Connected Car Services",
  "Cornering Lights",
  "Cooled / Ventilated Seats",
  "Cross Traffic Alert (Front / Rear)",
  "Cruise Control (Standard)",
  "Cup Holders",
  "Cylinder Deactivation",
  "Daytime Running Lights (DRL)",
  "Digital Dashboard / Virtual Cockpit",
  "Digital Instrument Cluster",
  "Digital Key (Phone-as-Key)",
  "Digital Radio (DAB / HD Radio)",
  "Differential Lock",
  "Drive Mode Selector",
  "Driver Attention Monitoring",
  "Driver Fatigue Detection",
  "Dynamic Stability Control (DSC)",
  "Electronic Brakeforce Distribution (EBD)",
  "Electric Handbrake",
  "Electric Power Steering (EPS)",
  "Electric Seat Adjustment",
  "Electric Windows",
  "Electrically Folding Mirrors",
  "Electronic Stability Control (ESC)",
  "Emergency Call System (eCall / SOS)",
  "Engine Immobiliser",
  "Engine Start Button",
  "EV Mode (Hybrid Vehicles)",
  "Exhaust Brake",
  "Fog Lights (Front / Rear)",
  "Fold-Flat Rear Seats",
  "Follow-Me-Home Headlights",
  "Four-Wheel Drive (4WD)",
  "Four-Wheel Steering",
  "Fragrance System",
  "Front Collision Warning",
  "Front Parking Sensors",
  "Gesture Control",
  "GPS Navigation",
  "Gear Shift Paddles",
  "Glass Roof",
  "Ground Clearance Adjustment",
  "Heads-Up Display (HUD)",
  "Hands-Free Tailgate",
  "Headlight Levelling",
  "Heated Seats",
  "Heated Steering Wheel",
  "Heated Windshield",
  "Hill Descent Control",
  "Hill Start Assist",
  "Hybrid Drive System",
  "Immobiliser",
  "In-Car Wi-Fi Hotspot",
  "Infotainment Touchscreen",
  "Intelligent Speed Assist",
  "Interior Mood Lighting",
  "Integrated Apps",
  "Integrated Child Seats",
  "Jack Storage Compartment",
  "Jump-Start Assist",
  "Keyless Entry",
  "Keyless Start",
  "Kick-Sensor Tailgate",
  "Knee Airbags",
  "Lane Centering Assist",
  "Lane Departure Warning (LDW)",
  "Lane Keep Assist (LKA)",
  "Laser Headlights",
  "Leather Seats",
  "LED Headlights",
  "LED Tail Lights",
  "Limited Slip Differential",
  "Load-Sensing Suspension",
  "Massage Seats",
  "Memory Seats",
  "Mirror Heating",
  "Multi-Link Suspension",
  "Multi-Function Steering Wheel",
  "Mobile App Vehicle Control",
  "Night Vision Assist",
  "Noise-Reducing Glass",
  "Off-Road Driving Modes",
  "On-Board Computer",
  "Over-the-Air Updates (OTA)",
  "Oxygen Sensor Monitoring",
  "Paddle Shifters",
  "Panoramic Sunroof",
  "Park Assist",
  "Parking Sensors (Front / Rear)",
  "Pedestrian Detection",
  "Performance Brakes",
  "Power Adjustable Seats",
  "Power Folding Mirrors",
  "Power Tailgate",
  "Predictive Cruise Control",
  "Premium Sound System",
  "Privacy Glass",
  "Push-Button Start",
  "Quick Charge Port (EV)",
  "All-Wheel Drive Systems (Generic)",
  "Rain-Sensing Wipers",
  "Rear Entertainment Screens",
  "Rear Parking Camera",
  "Rear Seat Armrest",
  "Rear Window Defogger",
  "Regenerative Braking",
  "Remote Engine Start",
  "Remote Vehicle Tracking",
  "Road Sign Recognition",
  "Roll Stability Control",
  "Run-Flat Tyres",
  "Satellite Navigation",
  "Self-Driving Assist",
  "Self-Parking",
  "Seat Belt Pretensioners",
  "Seat Heating",
  "Seat Ventilation",
  "Side Steps",
  "Smart Key",
  "Smart Suspension",
  "Smartphone Integration",
  "Snow Mode",
  "Solar Roof",
  "Speed Limiter",
  "Stability Control",
  "Steering Assist",
  "Stop-and-Go Traffic Assist",
  "Surround Sound System",
  "Surround View Cameras",
  "Sunroof",
  "Tachometer",
  "Terrain Response System",
  "Theft Alarm",
  "Torque Vectoring",
  "Touchscreen Display",
  "Towing Package",
  "Traction Control",
  "Traffic Jam Assist",
  "Traffic Sign Recognition",
  "Trailer Stability Assist",
  "Tyre Pressure Monitoring System (TPMS)",
  "USB Ports (USB-A / USB-C)",
  "Underbody Protection",
  "Upholstery (Cloth / Leather / Alcantara)",
  "Valet Mode",
  "Variable Valve Timing",
  "Vehicle Health Monitoring",
  "Vehicle Locator",
  "Voice Control",
  "Ventilated Seats",
  "Wireless Apple CarPlay",
  "Wireless Android Auto",
  "Wireless Charging",
  "Windscreen Heads-Up Display",
  "Wiper De-Icer",
  "Xenon Headlights",
  "Yaw Control System",
  "Zone Climate Control",
] as const;

const GLOBAL_VAN_FEATURE_LABELS = [
  "ABS (Anti-lock Braking System)",
  "Adaptive Cruise Control",
  "Adjustable Steering Column",
  "Advanced Driver Assistance Systems (ADAS)",
  "Air Conditioning (Manual / Automatic)",
  "Airbags (Front, Side, Curtain)",
  "Alarm System",
  "Alloy Wheels",
  "Android Auto",
  "Anti-Theft Immobiliser",
  "Apple CarPlay",
  "Auto Hold (Brake Hold)",
  "Auto Start-Stop",
  "Automatic Emergency Braking (AEB)",
  "Automatic Headlights",
  "Automatic Sliding Doors",
  "Auxiliary Power Outlet (12V / 230V)",
  "Blind Spot Monitoring",
  "Bluetooth Connectivity",
  "Bulkhead / Cargo Partition",
  "Brake Assist",
  "Brake Energy Regeneration (Hybrid / EV)",
  "Cabin Air Filter",
  "Camera System (Rear / 360 deg)",
  "Central Locking",
  "Climate Control (Dual / Multi-Zone)",
  "Collision Avoidance System",
  "Collision Warning (Forward / Rear)",
  "Cruise Control",
  "Cup Holders",
  "Curtain Airbags (Passenger Vans)",
  "Daytime Running Lights (DRL)",
  "Digital Instrument Cluster",
  "Digital Tachograph (Commercial Vans)",
  "Drive Modes (Eco / Normal / Tow)",
  "Driver Fatigue Monitoring",
  "Dual Sliding Doors",
  "Electric Handbrake",
  "Electric Power Steering (EPS)",
  "Electric Sliding Doors",
  "Electric Tailgate",
  "Electronic Stability Control (ESC)",
  "Emergency Call System (eCall / SOS)",
  "Engine Immobiliser",
  "Engine Start Button",
  "Extended Fuel Tank",
  "Fold-Flat Seats",
  "Front Parking Sensors",
  "Front-Wheel Drive (FWD)",
  "Four-Wheel Drive (AWD / 4WD)",
  "Full Steel Bulkhead",
  "GPS Navigation",
  "Gross Vehicle Mass (GVM) Rating",
  "Ground Clearance Adjustment",
  "Hands-Free Tailgate",
  "Heated Seats",
  "Heated Steering Wheel",
  "Hill Start Assist",
  "High Roof Configuration",
  "High Payload Package",
  "Immobiliser",
  "In-Car Wi-Fi Hotspot",
  "Infotainment Touchscreen",
  "Integrated Roof Rails",
  "Interior LED Lighting",
  "Jack Storage Compartment",
  "Keyless Entry",
  "Keyless Start",
  "Lane Departure Warning",
  "Lane Keep Assist",
  "Load Floor Protection",
  "Load Securing Rails",
  "Long Wheelbase (LWB)",
  "Low Roof Configuration",
  "Mobile App Vehicle Control",
  "Modular Seating System",
  "Multi-Function Steering Wheel",
  "Multi-Zone Climate Control",
  "Navigation System",
  "Noise-Reducing Cabin Insulation",
  "On-Board Diagnostics (OBD)",
  "Over-Speed Warning System",
  "Panoramic Roof (Passenger Vans)",
  "Parking Sensors (Front / Rear)",
  "Passenger Airbags",
  "Payload Monitoring System",
  "Power Adjustable Seats",
  "Power Folding Mirrors",
  "Power Sliding Doors",
  "Power Take-Off (PTO)",
  "Privacy Glass",
  "Quick Charge Port (Electric Vans)",
  "Rain-Sensing Wipers",
  "Rear Air Conditioning Vents",
  "Rear Parking Camera",
  "Rear-Wheel Drive (RWD)",
  "Regenerative Braking (Hybrid / EV)",
  "Remote Central Locking",
  "Remote Engine Start",
  "Reversing Alarm (Commercial)",
  "Roof Racks / Roof Rails",
  "Satellite Navigation",
  "Seat Belt Pretensioners",
  "Side Airbags",
  "Sliding Side Door (Manual / Electric)",
  "Smart Key",
  "Speed Limiter",
  "Stability Control",
  "Stop-and-Go Traffic Assist",
  "Storage Compartments",
  "Sun Blinds (Passenger Vans)",
  "Tachograph (Digital / Analogue)",
  "Tinted Windows",
  "Tow Bar",
  "Towing Package",
  "Traction Control",
  "Traffic Sign Recognition",
  "Twin Rear Doors (Barn Doors)",
  "Tyre Pressure Monitoring System (TPMS)",
  "USB Ports (USB-A / USB-C)",
  "Underbody Protection",
  "Upholstery (Cloth / Leather / Vinyl)",
  "Valet Mode",
  "Vehicle Health Monitoring",
  "Vehicle Locator",
  "Ventilated Seats",
  "Voice Control",
  "Wheelbase Options (SWB / MWB / LWB)",
  "Wireless Apple CarPlay",
  "Wireless Android Auto",
  "Wireless Charging",
  "Xenon Headlights",
  "Yaw Stability Control",
  "Zone Climate Control",
] as const;

const GLOBAL_MOTORBIKE_FEATURE_LABELS = [
  "ABS (Anti-lock Braking System)",
  "Adjustable Brake Levers",
  "Adjustable Clutch Levers",
  "Adjustable Suspension",
  "Advanced Rider Assistance Systems (ARAS)",
  "Air Cooling",
  "Alarm System",
  "Alloy Wheels",
  "Anti-Hopping Clutch (Slipper Clutch)",
  "Anti-Theft Immobiliser",
  "Automatic Headlights",
  "Automatic Transmission (CVT / DCT)",
  "Auxiliary Power Outlet (12V)",
  "Backrest (Rider / Passenger)",
  "Belt Drive",
  "Bluetooth Connectivity",
  "Brembo / Performance Brakes (Generic)",
  "Built-in Navigation",
  "Built-in Ride Recorder / Dashcam",
  "Chain Drive",
  "Combined Braking System (CBS)",
  "Cornering ABS",
  "Cornering Lights",
  "Cruise Control",
  "Crash Bars / Engine Guards",
  "Cylinders (Single / Twin / Triple / Inline / V)",
  "Daytime Running Lights (DRL)",
  "Digital Instrument Cluster",
  "Digital Speedometer",
  "Drive Modes",
  "Dual Channel ABS",
  "Dual Disc Brakes",
  "Electric Start",
  "Electronic Fuel Injection (EFI)",
  "Electronic Steering Damper",
  "Engine Immobiliser",
  "Engine Kill Switch",
  "Engine Modes",
  "Exhaust Heat Shield",
  "Fairing (Full / Half / Naked)",
  "Fog Lights",
  "Foldable Foot Pegs",
  "Front Disc Brake",
  "Front Suspension (Telescopic / USD)",
  "Fuel Gauge",
  "Fuel Injection System",
  "Gear Position Indicator",
  "GPS Tracking",
  "Grab Rails",
  "Gear Shift Assist (Quickshifter)",
  "Hazard Lights",
  "Heated Grips",
  "Heated Seats",
  "Helmet Lock",
  "Hill Hold Assist",
  "Hydraulic Clutch",
  "Immobiliser",
  "Instrument Backlighting",
  "Integrated Pannier Mounts",
  "Integrated Top Box Mount",
  "Jockey Shift (Classic / Custom Bikes)",
  "Kick Starter",
  "Keyless Ignition",
  "Knee Guards / Fairing Protection",
  "LED Headlights",
  "LED Tail Lights",
  "Lean Angle Sensor",
  "Liquid Cooling",
  "Luggage Rack",
  "Mobile App Connectivity",
  "Mono-Shock Rear Suspension",
  "Multiple Ride Modes",
  "Mudguards (Front / Rear)",
  "Navigation Integration",
  "Nitrogen-Filled Suspension",
  "Off-Road ABS Mode",
  "Off-Road Riding Mode",
  "On-Board Diagnostics (OBD)",
  "Panniers / Side Boxes",
  "Passenger Foot Pegs",
  "Performance Exhaust",
  "Power Modes",
  "Power Outlet (USB / 12V)",
  "Preload Adjustable Suspension",
  "Quickshifter (Up / Down)",
  "Radiator Guard",
  "Rain Riding Mode",
  "Rear Disc Brake",
  "Rear Suspension Adjustment",
  "Regenerative Braking (Electric Motorcycles)",
  "Remote Lock / Unlock",
  "Ride-by-Wire Throttle",
  "Riding Modes",
  "Roll-Over Sensor",
  "Saddle Bags",
  "Seat Height Adjustment",
  "Self-Cancelling Indicators",
  "Shaft Drive",
  "Slipper Clutch",
  "Smart Key",
  "Smartphone Integration",
  "SOS Emergency Call",
  "Spoke Wheels",
  "Steering Damper",
  "Steering Lock",
  "Supercharger / Turbocharger (Rare)",
  "TFT Display",
  "Throttle-by-Wire",
  "Traction Control System (TCS)",
  "Touring Windshield",
  "TPMS (Tyre Pressure Monitoring System)",
  "Tubeless Tyres",
  "Twin Disc Brakes",
  "Underbody Protection (Skid Plate)",
  "USB Charging Port",
  "Upside-Down Front Forks (USD)",
  "Variable Valve Timing (VVT)",
  "Vehicle Tracking System",
  "Vibration Dampers",
  "Voice Control Integration",
  "Wheelie Control",
  "Windscreen",
  "Wire-Spoke Wheels",
  "X-Ring Chain",
  "Yaw Rate Sensor",
  "Zero-Emission Drive (Electric Motorcycles)",
] as const;

const GLOBAL_TRUCK_FEATURE_LABELS = [
  "ABS (Anti-lock Braking System)",
  "Adaptive Cruise Control",
  "Adjustable Air Suspension",
  "Adjustable Steering Column",
  "Air Brakes",
  "Air Conditioning",
  "Air Dryer System",
  "Air Suspension",
  "Alarm System",
  "Alloy Wheels",
  "Anti-Jackknife System",
  "Automatic Emergency Braking (AEB)",
  "Automatic Headlights",
  "Auxiliary Power Unit (APU)",
  "Battery Isolation Switch",
  "Blind Spot Monitoring",
  "Brake Assist",
  "Brake Retarder",
  "Bull Bar",
  "Cabin Air Suspension",
  "Camera System (Rear / Side / 360 deg)",
  "Central Locking",
  "Collision Avoidance System",
  "Cruise Control",
  "Coupling System (Fifth Wheel / Tow Hitch)",
  "Differential Lock",
  "Digital Tachograph",
  "Driver Fatigue Monitoring",
  "Drive Modes",
  "Dual Fuel Capability",
  "Electronic Braking System (EBS)",
  "Electronic Stability Program (ESP)",
  "Engine Brake",
  "Engine Immobiliser",
  "Exhaust Brake",
  "Fleet Management System",
  "Fuel Tank (Extended)",
  "Front Axle Lift",
  "GPS Fleet Tracking",
  "Gear Shift Assist",
  "Gross Vehicle Mass (GVM) Rating",
  "Hill Start Assist",
  "Hydraulic Retarder",
  "Idle Shutdown System",
  "Integrated Telematics",
  "Jacking Points (Heavy Duty)",
  "Keyless Entry",
  "Lane Departure Warning",
  "Load Monitoring System",
  "Load Securing Rails",
  "Manual / Automated Manual Transmission (AMT)",
  "Multi-Axle Configuration",
  "Mud Flaps",
  "Night Driving Assist",
  "On-Board Diagnostics (OBD)",
  "Over-Speed Warning System",
  "Power Steering",
  "Power Take-Off (PTO)",
  "Predictive Cruise Control",
  "Parking Sensors",
  "Rear Axle Lift",
  "Rear View Camera",
  "Retarder Control",
  "Roll Stability Control",
  "Sleeper Cabin",
  "Speed Limiter",
  "Stability Control",
  "Suspension Seat",
  "Telematics System",
  "Trailer Stability Assist",
  "Traction Control",
  "Tyre Pressure Monitoring System (TPMS)",
  "Underbody Protection",
  "Vehicle Health Monitoring",
  "Winch System",
] as const;

const GLOBAL_PLANT_FEATURE_LABELS = [
  "Auto Greasing System",
  "Auxiliary Hydraulic Lines",
  "Backhoe Attachment",
  "Blade Control System",
  "Boom Suspension",
  "Cab ROPS / FOPS",
  "Climate Controlled Cabin",
  "Central Lubrication System",
  "Counterweight System",
  "Diesel Particulate Filter (DPF)",
  "Dozer Blade",
  "Eco Operating Mode",
  "Emergency Stop System",
  "Engine Monitoring System",
  "Falling Object Protection (FOPS)",
  "Fuel Efficiency Monitoring",
  "GPS Machine Control",
  "Grade Control System",
  "Hydraulic Quick Coupler",
  "Hydraulic Hammer Compatibility",
  "Integrated Diagnostics",
  "Joystick Controls",
  "Keyless Start",
  "Load Moment Indicator (LMI)",
  "Low Emission Engine",
  "Machine Control Automation",
  "Multiple Attachments Support",
  "Noise Reduction Cabin",
  "Operator Presence System",
  "Overload Protection",
  "Proportional Hydraulics",
  "Reversible Fan",
  "ROPS Cabin",
  "Swing Boom",
  "Safety Interlock System",
  "Stabilizers / Outriggers",
  "Telematics (Remote Monitoring)",
  "Track / Wheel Configuration",
  "Undercarriage Protection",
  "Vibration Reduction System",
  "Work Lights (LED)",
] as const;

const GLOBAL_FARM_FEATURE_LABELS = [
  "Adjustable Row Spacing",
  "Auto-Steering (GPS Guided)",
  "Bale Counter",
  "Bale Ejector",
  "Cab Suspension",
  "Climate Controlled Operator Cabin",
  "Crop Monitoring Sensors",
  "Differential Lock",
  "Draft Control",
  "Engine Speed Management",
  "Emissions Control System",
  "Front Loader Compatibility",
  "Four-Wheel Drive (4WD)",
  "GPS Guidance System",
  "Ground Speed Sensor",
  "Hydraulic Remote Valves",
  "Hitch System (3-Point)",
  "Implement Control System",
  "ISOBUS Compatibility",
  "Joystick Loader Control",
  "Keyless Start",
  "Load Sensing Hydraulics",
  "Multi-Speed PTO",
  "Monitor Display (Yield / Performance)",
  "Nitrogen Filled Tyres",
  "On-Board Weighing System",
  "Precision Farming System",
  "Power Take-Off (PTO)",
  "Rear Hitch Control",
  "Roll-Over Protection Structure (ROPS)",
  "Self-Levelling Loader",
  "Section Control (Sprayers)",
  "Soil Compaction Monitoring",
  "Traction Control",
  "Tyre Pressure Adjustment System",
  "Universal Implement Mount",
  "Variable Rate Application",
  "Wide Tyres / Dual Wheels",
  "Yield Monitoring System",
  "Zero-Turn Capability (Specialised Equipment)",
] as const;

const CAR_FEATURE_ID_OVERRIDES: Record<string, string> = {
  "ABS (Anti-lock Braking System)": "safe_abs",
  "Android Auto": "info_android_auto",
  "Apple CarPlay": "info_apple_carplay",
  "Cruise Control (Standard)": "comfort_cruise_control",
  "Parking Sensors (Front / Rear)": "tech_parking_sensors",
};

const CAR_FEATURE_ALIASES: Record<string, readonly string[]> = {
  "Adaptive Cruise Control (ACC)": ["ACC"],
  "Tyre Pressure Monitoring System (TPMS)": ["TPMS"],
  "Lane Departure Warning (LDW)": ["LDW"],
  "Lane Keep Assist (LKA)": ["LKA"],
  "Automatic Emergency Braking (AEB)": ["AEB"],
  "Blind Spot Monitoring (BSM)": ["BSM"],
  "Digital Dashboard / Virtual Cockpit": ["Virtual Cockpit"],
  "Wireless Apple CarPlay": ["Apple CarPlay Wireless"],
  "Wireless Android Auto": ["Android Auto Wireless"],
};

function normalizeFeatureId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function createEmptyFeatureGroups(definition: ListingFeatureGroupDefinition): ListingFeatureGroups {
  const groups: ListingFeatureGroups = {};
  for (const key of definition.order) {
    groups[key] = [];
  }
  return groups;
}

function toFeatureOption(definition: ListingFeatureDefinition): ListingFeatureOption {
  return {
    id: definition.id,
    label: definition.label,
    aliases: definition.aliases,
  };
}

function groupFeatureDefinitions(
  definitions: readonly ListingFeatureDefinition[],
  groupDefinition: ListingFeatureGroupDefinition
): ListingFeatureGroups {
  const groups = createEmptyFeatureGroups(groupDefinition);
  for (const definition of definitions) {
    if (!groups[definition.group]) {
      groups[definition.group] = [];
    }
    if (!groups[definition.group].some((feature) => feature.id === definition.id)) {
      groups[definition.group].push(toFeatureOption(definition));
    }
  }
  return groups;
}

function inferCarVanTruckGroup(label: string): ListingFeatureGroupKey {
  const normalized = label.toLowerCase();

  const techKeywords = [
    "assist",
    "autonomous",
    "self-driving",
    "lane",
    "collision",
    "parking",
    "blind spot",
    "adaptive cruise",
    "cruise control",
    "traffic sign",
    "road sign",
    "intelligent speed",
    "pedestrian",
    "driver attention",
    "fatigue",
    "emergency braking",
    "aeb",
  ];

  const safetyKeywords = [
    "airbag",
    "abs",
    "brake assist",
    "brake override",
    "stability",
    "traction",
    "roll",
    "tpms",
    "security",
    "alarm",
    "immobiliser",
    "immobilizer",
    "anti-theft",
    "child lock",
    "isofix",
    "latch",
    "seat belt",
    "anti-jackknife",
  ];

  const infotainmentKeywords = [
    "android auto",
    "apple carplay",
    "navigation",
    "radio",
    "bluetooth",
    "wi-fi",
    "wifi",
    "touchscreen",
    "digital key",
    "connected car",
    "integrated apps",
    "mobile app",
    "smartphone integration",
    "voice control",
    "usb",
    "wireless charging",
    "over-the-air",
    "ota",
    "on-board computer",
    "vehicle health monitoring",
    "vehicle locator",
  ];

  const audioVisualKeywords = [
    "camera",
    "dashcam",
    "heads-up display",
    "hud",
    "sound",
    "audio",
    "display",
    "aux",
  ];

  const comfortKeywords = [
    "cruise control",
    "keyless",
    "push-button",
    "seat heating",
    "ventilated seats",
    "massage",
    "heated",
    "auto hold",
    "start button",
    "climate",
  ];

  const interiorKeywords = [
    "air conditioning",
    "seats",
    "steering wheel",
    "steering column",
    "cup holders",
    "cabin",
    "interior",
    "fragrance",
    "mood lighting",
    "ambient",
    "rear seat",
    "tachometer",
    "electric windows",
  ];

  const exteriorKeywords = [
    "headlight",
    "tail light",
    "lights",
    "roof",
    "sunroof",
    "tailgate",
    "wipers",
    "mirror",
    "glass",
    "wheel",
    "tyre",
    "body",
    "xenon",
    "laser",
    "fog lights",
    "rear window",
  ];

  const performanceKeywords = [
    "differential",
    "suspension",
    "drive mode",
    "torque",
    "performance",
    "engine",
    "hybrid",
    "ev",
    "brake energy",
    "regenerative",
    "power take-off",
    "pto",
    "retarder",
  ];

  if (techKeywords.some((keyword) => normalized.includes(keyword))) {
    return "technology_driver_assist";
  }
  if (safetyKeywords.some((keyword) => normalized.includes(keyword))) {
    return "safety";
  }
  if (infotainmentKeywords.some((keyword) => normalized.includes(keyword))) {
    return "infotainment";
  }
  if (audioVisualKeywords.some((keyword) => normalized.includes(keyword))) {
    return "audio_visual";
  }
  if (comfortKeywords.some((keyword) => normalized.includes(keyword))) {
    return "comfort_convenience";
  }
  if (interiorKeywords.some((keyword) => normalized.includes(keyword))) {
    return "interior";
  }
  if (exteriorKeywords.some((keyword) => normalized.includes(keyword))) {
    return "exterior";
  }
  if (performanceKeywords.some((keyword) => normalized.includes(keyword))) {
    return "performance_mechanical";
  }
  return "performance_mechanical";
}

function inferMotorbikeGroup(label: string): ListingFeatureGroupKey {
  const normalized = label.toLowerCase();

  const safetyKeywords = [
    "abs",
    "brake",
    "traction",
    "tcs",
    "stability",
    "cornering",
    "roll",
    "tpms",
    "alarm",
    "immobiliser",
  ];

  const performanceKeywords = [
    "engine",
    "quickshifter",
    "ride-by-wire",
    "throttle",
    "power",
    "turbo",
    "supercharger",
    "drive mode",
    "suspension",
    "cooling",
  ];

  const comfortKeywords = [
    "seat",
    "grip",
    "backrest",
    "windshield",
    "windscreen",
    "cruise",
    "foot peg",
  ];

  const electronicsKeywords = [
    "display",
    "digital",
    "bluetooth",
    "navigation",
    "gps",
    "usb",
    "app",
    "tracking",
    "tft",
    "voice",
  ];

  if (safetyKeywords.some((keyword) => normalized.includes(keyword))) {
    return "safety";
  }
  if (performanceKeywords.some((keyword) => normalized.includes(keyword))) {
    return "performance";
  }
  if (comfortKeywords.some((keyword) => normalized.includes(keyword))) {
    return "comfort";
  }
  if (electronicsKeywords.some((keyword) => normalized.includes(keyword))) {
    return "electronics";
  }
  return "accessories";
}

function inferFarmGroup(label: string): ListingFeatureGroupKey {
  const normalized = label.toLowerCase();

  if (normalized.includes("hydraulic") || normalized.includes("hitch") || normalized.includes("isobus")) {
    return "hydraulics";
  }
  if (normalized.includes("cabin") || normalized.includes("operator")) {
    return "cabin_comfort";
  }
  if (normalized.includes("pto") || normalized.includes("drive") || normalized.includes("engine") || normalized.includes("traction")) {
    return "power_drive";
  }
  if (normalized.includes("mount") || normalized.includes("loader") || normalized.includes("attachment") || normalized.includes("implement")) {
    return "attachments";
  }
  return "efficiency";
}

function inferPlantGroup(label: string): ListingFeatureGroupKey {
  const normalized = label.toLowerCase();

  if (normalized.includes("hydraulic") || normalized.includes("coupler")) {
    return "hydraulics";
  }
  if (normalized.includes("rops") || normalized.includes("fops") || normalized.includes("safety")) {
    return "cabin_safety";
  }
  if (normalized.includes("control") || normalized.includes("automation") || normalized.includes("joystick")) {
    return "control_systems";
  }
  return "monitoring_telematics";
}

function buildFeatureDefinitions(
  labels: readonly string[],
  inferGroup: (label: string) => ListingFeatureGroupKey,
  overrides?: Record<string, string>,
  aliases?: Record<string, readonly string[]>
): ListingFeatureDefinition[] {
  return labels.map((label) => {
    const id = overrides?.[label] ?? normalizeFeatureId(label);
    return {
      id,
      label,
      group: inferGroup(label),
      aliases: aliases?.[label],
    } satisfies ListingFeatureDefinition;
  });
}

function dedupeFeatureDefinitions(definitions: ListingFeatureDefinition[]): ListingFeatureDefinition[] {
  const deduped: ListingFeatureDefinition[] = [];
  const seen = new Set<string>();
  for (const definition of definitions) {
    if (seen.has(definition.id)) continue;
    seen.add(definition.id);
    deduped.push(definition);
  }
  return deduped;
}

const CAR_FEATURE_DEFINITIONS = dedupeFeatureDefinitions(
  buildFeatureDefinitions(GLOBAL_CAR_FEATURE_LABELS, inferCarVanTruckGroup, CAR_FEATURE_ID_OVERRIDES, CAR_FEATURE_ALIASES)
);

const VAN_FEATURE_DEFINITIONS = dedupeFeatureDefinitions(
  buildFeatureDefinitions(GLOBAL_VAN_FEATURE_LABELS, inferCarVanTruckGroup)
);

const TRUCK_FEATURE_DEFINITIONS = dedupeFeatureDefinitions(
  buildFeatureDefinitions(GLOBAL_TRUCK_FEATURE_LABELS, inferCarVanTruckGroup)
);

const MOTORBIKE_FEATURE_DEFINITIONS = dedupeFeatureDefinitions(
  buildFeatureDefinitions(GLOBAL_MOTORBIKE_FEATURE_LABELS, inferMotorbikeGroup)
);

const PLANT_FEATURE_DEFINITIONS = dedupeFeatureDefinitions(
  buildFeatureDefinitions(GLOBAL_PLANT_FEATURE_LABELS, inferPlantGroup)
);

const FARM_FEATURE_DEFINITIONS = dedupeFeatureDefinitions(
  buildFeatureDefinitions(GLOBAL_FARM_FEATURE_LABELS, inferFarmGroup)
);

export const GLOBAL_CAR_FEATURE_MASTER = CAR_FEATURE_DEFINITIONS;

export const LISTING_FEATURES_BY_CATEGORY: Record<ListingCategory, ListingFeatureGroups> = {
  car: groupFeatureDefinitions(CAR_FEATURE_DEFINITIONS, CAR_VAN_TRUCK_GROUP_DEF),
  van: groupFeatureDefinitions(VAN_FEATURE_DEFINITIONS, CAR_VAN_TRUCK_GROUP_DEF),
  truck: groupFeatureDefinitions(TRUCK_FEATURE_DEFINITIONS, CAR_VAN_TRUCK_GROUP_DEF),
  motorbike: groupFeatureDefinitions(MOTORBIKE_FEATURE_DEFINITIONS, MOTORBIKE_GROUP_DEF),
  plant_construction: groupFeatureDefinitions(PLANT_FEATURE_DEFINITIONS, PLANT_GROUP_DEF),
  farm_agricultural: groupFeatureDefinitions(FARM_FEATURE_DEFINITIONS, FARM_GROUP_DEF),
};

const ALL_FEATURE_DEFINITIONS = [
  ...CAR_FEATURE_DEFINITIONS,
  ...VAN_FEATURE_DEFINITIONS,
  ...TRUCK_FEATURE_DEFINITIONS,
  ...MOTORBIKE_FEATURE_DEFINITIONS,
  ...PLANT_FEATURE_DEFINITIONS,
  ...FARM_FEATURE_DEFINITIONS,
];

export const LISTING_FEATURE_INDEX: Record<string, ListingFeatureDefinition> = Object.fromEntries(
  dedupeFeatureDefinitions(ALL_FEATURE_DEFINITIONS).map((feature) => [feature.id, feature])
);

export const LISTING_STATUS_META = {
  draft: { label: "Draft", tone: "outline" },
  pending: { label: "Pending Review", tone: "warning" },
  active: { label: "Active", tone: "success" },
  reserved: { label: "Reserved", tone: "info" },
  sold: { label: "Sold", tone: "secondary" },
  rejected: { label: "Rejected", tone: "destructive" },
  expired: { label: "Expired", tone: "default" },
} as const;

export type ListingStatus = keyof typeof LISTING_STATUS_META;
