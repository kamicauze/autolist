
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getImageUrl(r2Key: string): string {
  if (!r2Key) return "/placeholder-car.jpg";
  if (r2Key.startsWith("http")) return r2Key;
  return `${R2_PUBLIC_URL}/${r2Key}`;
}
