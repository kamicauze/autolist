export type BrandLogo = {
  src: string | null;
  colorClass: string;
};

export const BRAND_LOGO_BY_MAKE: Record<string, BrandLogo> = {
  Audi: { src: "/brands/audi.svg", colorClass: "text-[#bb0a30]" },
  BMW: { src: "/brands/bmw.svg", colorClass: "text-[#0066b3]" },
  Bentley: { src: null, colorClass: "text-[#0b4f3a]" },
  BYD: { src: null, colorClass: "text-[#e60012]" },
  Chery: { src: null, colorClass: "text-[#d71920]" },
  Chevrolet: { src: null, colorClass: "text-[#c99700]" },
  Ferrari: { src: null, colorClass: "text-[#d40000]" },
  Ford: { src: "/brands/ford.svg", colorClass: "text-[#003478]" },
  Honda: { src: null, colorClass: "text-[#cc0000]" },
  Hyundai: { src: "/brands/hyundai.svg", colorClass: "text-[#002c5f]" },
  Isuzu: { src: null, colorClass: "text-[#d71920]" },
  Jeep: { src: "/brands/jeep.svg", colorClass: "text-[#5e5e22]" },
  Kia: { src: "/brands/kia.svg", colorClass: "text-[#bb162b]" },
  "Land Rover": { src: "/brands/land-rover.svg", colorClass: "text-[#005a2b]" },
  Lexus: { src: null, colorClass: "text-[#4b5563]" },
  Maserati: { src: null, colorClass: "text-[#0c2340]" },
  Mazda: { src: null, colorClass: "text-[#1f2937]" },
  "Mercedes-Benz": { src: null, colorClass: "text-[#6b7280]" },
  MINI: { src: null, colorClass: "text-[#111827]" },
  Mitsubishi: { src: null, colorClass: "text-[#e60012]" },
  Nissan: { src: "/brands/nissan.svg", colorClass: "text-[#c3002f]" },
  Peugeot: { src: null, colorClass: "text-[#1f4f82]" },
  Porsche: { src: null, colorClass: "text-[#b12b28]" },
  Subaru: { src: null, colorClass: "text-[#004b93]" },
  Suzuki: { src: null, colorClass: "text-[#e30613]" },
  Toyota: { src: "/brands/toyota.svg", colorClass: "text-[#eb0a1e]" },
  Volkswagen: { src: null, colorClass: "text-[#001e50]" },
  Volvo: { src: "/brands/volvo.svg", colorClass: "text-[#003057]" },
};

const FALLBACK_COLOR_CLASSES = [
  "text-[#b91c1c]",
  "text-[#0f766e]",
  "text-[#1d4ed8]",
  "text-[#7c3aed]",
  "text-[#be123c]",
  "text-[#047857]",
  "text-[#b45309]",
  "text-[#0369a1]",
] as const;

function getFallbackColorClass(make: string) {
  const hash = Array.from(make).reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return FALLBACK_COLOR_CLASSES[hash % FALLBACK_COLOR_CLASSES.length];
}

export function getBrandLogo(make: string): BrandLogo {
  return BRAND_LOGO_BY_MAKE[make] || {
    src: null,
    colorClass: getFallbackColorClass(make),
  };
}

export function getBrandInitials(make: string) {
  return make
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
