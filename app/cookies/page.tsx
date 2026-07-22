import type { Metadata } from "next";
import { ManagedContentPage } from "@/components/cms/managed-content-page";
import { buildManagedContentPageMetadata } from "@/lib/data/content-pages";

const SLUG = "cookies";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedContentPageMetadata(SLUG);
}

export default async function CookiesPage() {
  return <ManagedContentPage slug={SLUG} eyebrow="Privacy & data" />;
}
