import type { Metadata } from "next";
import { ManagedContentPage } from "@/components/cms/managed-content-page";
import { buildManagedContentPageMetadata } from "@/lib/data/content-pages";

const SLUG = "terms";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedContentPageMetadata(SLUG);
}

export default async function TermsPage() {
  return <ManagedContentPage slug={SLUG} eyebrow="Terms & policies" />;
}
