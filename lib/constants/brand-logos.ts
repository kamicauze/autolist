export type BrandLogo = {
  src: string | null;
  colorClass: string;
};

export const BRAND_LOGO_BY_MAKE: Record<string, BrandLogo> = {
  "Alfa Romeo": { src: "/brands/alfa-romeo.svg", colorClass: "text-[#374151]" },
  "Aston Martin": { src: "/brands/aston-martin.svg", colorClass: "text-[#374151]" },
  Audi: { src: "/brands/audi.svg", colorClass: "text-[#bb0a30]" },
  BAIC: { src: "/brands/baic.svg", colorClass: "text-[#374151]" },
  Bentley: { src: "/brands/bentley.svg", colorClass: "text-[#0b4f3a]" },
  BMW: { src: "/brands/bmw.svg", colorClass: "text-[#0066b3]" },
  BYD: { src: "/brands/byd.svg", colorClass: "text-[#e60012]" },
  Cadillac: { src: "/brands/cadillac.png", colorClass: "text-[#374151]" },
  Changan: { src: "/brands/changan.png", colorClass: "text-[#374151]" },
  Chery: { src: "/brands/chery.png", colorClass: "text-[#d71920]" },
  Chevrolet: { src: "/brands/chevrolet.png", colorClass: "text-[#c99700]" },
  Chrysler: { src: "/brands/chrysler.svg", colorClass: "text-[#374151]" },
  Citroen: { src: "/brands/citroen.svg", colorClass: "text-[#374151]" },
  Cupra: { src: "/brands/cupra.svg", colorClass: "text-[#374151]" },
  Dacia: { src: "/brands/dacia.svg", colorClass: "text-[#374151]" },
  Daihatsu: { src: "/brands/daihatsu.svg", colorClass: "text-[#374151]" },
  Datsun: { src: "/brands/datsun.png", colorClass: "text-[#374151]" },
  Denza: { src: "/brands/denza.svg", colorClass: "text-[#374151]" },
  Dodge: { src: "/brands/dodge.png", colorClass: "text-[#374151]" },
  Ferrari: { src: "/brands/ferrari.svg", colorClass: "text-[#d40000]" },
  Fiat: { src: "/brands/fiat.svg", colorClass: "text-[#374151]" },
  Ford: { src: "/brands/ford.png", colorClass: "text-[#003478]" },
  Geely: { src: "/brands/geely.svg", colorClass: "text-[#374151]" },
  GWM: { src: "/brands/gwm.png", colorClass: "text-[#374151]" },
  Haval: { src: "/brands/haval.png", colorClass: "text-[#374151]" },
  Honda: { src: "/brands/honda.png", colorClass: "text-[#cc0000]" },
  Hyundai: { src: "/brands/hyundai.svg", colorClass: "text-[#002c5f]" },
  ICAUR: { src: "/brands/icaur.png", colorClass: "text-[#374151]" },
  Isuzu: { src: "/brands/isuzu.svg", colorClass: "text-[#d71920]" },
  JAC: { src: "/brands/jac.png", colorClass: "text-[#374151]" },
  Jaecoo: { src: "/brands/jaecoo.svg", colorClass: "text-[#374151]" },
  Jaguar: { src: "/brands/jaguar.svg", colorClass: "text-[#374151]" },
  Jeep: { src: "/brands/jeep.svg", colorClass: "text-[#5e5e22]" },
  Jetour: { src: "/brands/jetour.svg", colorClass: "text-[#374151]" },
  Kia: { src: "/brands/kia.svg", colorClass: "text-[#bb162b]" },
  Lamborghini: { src: "/brands/lamborghini.png", colorClass: "text-[#374151]" },
  "Land Rover": { src: "/brands/land-rover.svg", colorClass: "text-[#005a2b]" },
  Lepas: { src: "/brands/lepas.svg", colorClass: "text-[#374151]" },
  Lexus: { src: "/brands/lexus.png", colorClass: "text-[#4b5563]" },
  Mahindra: { src: "/brands/mahindra.png", colorClass: "text-[#374151]" },
  Maserati: { src: "/brands/maserati.png", colorClass: "text-[#0c2340]" },
  Maxus: { src: "/brands/maxus.png", colorClass: "text-[#374151]" },
  Mazda: { src: "/brands/mazda.svg", colorClass: "text-[#1f2937]" },
  McLaren: { src: "/brands/mclaren.svg", colorClass: "text-[#374151]" },
  "Mercedes-Benz": { src: "/brands/mercedes-benz.svg", colorClass: "text-[#6b7280]" },
  MG: { src: "/brands/mg.png", colorClass: "text-[#374151]" },
  MINI: { src: "/brands/mini.svg", colorClass: "text-[#111827]" },
  Mitsubishi: { src: "/brands/mitsubishi.svg", colorClass: "text-[#e60012]" },
  Nissan: { src: "/brands/nissan.svg", colorClass: "text-[#c3002f]" },
  Omoda: { src: "/brands/omoda.png", colorClass: "text-[#374151]" },
  Opel: { src: "/brands/opel.svg", colorClass: "text-[#374151]" },
  Peugeot: { src: "/brands/peugeot.svg", colorClass: "text-[#1f4f82]" },
  Porsche: { src: "/brands/porsche.svg", colorClass: "text-[#b12b28]" },
  Proton: { src: "/brands/proton.png", colorClass: "text-[#374151]" },
  Renault: { src: "/brands/renault.svg", colorClass: "text-[#374151]" },
  "Rolls Royce": { src: "/brands/rolls-royce.svg", colorClass: "text-[#374151]" },
  SEAT: { src: "/brands/seat.svg", colorClass: "text-[#374151]" },
  Smart: { src: "/brands/smart.png", colorClass: "text-[#374151]" },
  Subaru: { src: "/brands/subaru.png", colorClass: "text-[#004b93]" },
  Suzuki: { src: "/brands/suzuki.svg", colorClass: "text-[#e30613]" },
  Tesla: { src: "/brands/tesla.svg", colorClass: "text-[#374151]" },
  Toyota: { src: "/brands/toyota.svg", colorClass: "text-[#eb0a1e]" },
  Vauxhall: { src: "/brands/vauxhall.png", colorClass: "text-[#374151]" },
  Volkswagen: { src: "/brands/volkswagen.svg", colorClass: "text-[#001e50]" },
  Volvo: { src: "/brands/volvo.svg", colorClass: "text-[#003057]" },
  Xpeng: { src: "/brands/xpeng.png", colorClass: "text-[#374151]" },
  Zeekr: { src: "/brands/zeekr.png", colorClass: "text-[#374151]" },
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
