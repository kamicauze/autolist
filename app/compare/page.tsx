import { ChartNoAxesColumnIncreasing, Scale, ShieldCheck, Shuffle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketplaceHero, MARKETPLACE_PAGE_WIDTH } from "@/components/layout/marketplace-hero";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ComparePageClient } from "@/components/compare/compare-page-client";
import { COMPARE_MAX_ITEMS, parseCompareIds } from "@/lib/utils/compare";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Compare Vehicles",
  description: "Compare vehicles listed for sale in Kenya on Autolist side by side before you contact a seller.",
  path: "/compare",
});

const comparisonBenefits = [
  { icon: Scale, label: "See key differences" },
  { icon: ChartNoAxesColumnIncreasing, label: "Compare features" },
  { icon: ShieldCheck, label: "Choose with confidence" },
];

interface ComparePageProps {
  searchParams: Promise<{ ids?: string | string[] }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const idsParam = Array.isArray(params.ids) ? params.ids.join(",") : params.ids;
  const initialIds = parseCompareIds(idsParam);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-soft-surface">
        <MarketplaceHero
          imageSrc="/images/marketing/compare-hero.webp"
          imageClassName="lg:w-[57%] lg:[mask-image:linear-gradient(to_bottom,black_89%,transparent)]"
          className="lg:min-h-[292px]"
        >
          <div className="pt-5 pb-5 sm:pt-6 lg:pb-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Compare Vehicles" }]} />
            <div className="mt-5 max-w-[37rem] lg:max-w-[51%]">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#173263] shadow-sm">
                <Shuffle className="h-4 w-4 text-primary" aria-hidden="true" />
                Vehicle Comparison
              </p>
              <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl xl:text-[46px]">
                Compare Vehicles
              </h1>
              <p className="mt-2 max-w-[32rem] text-base leading-snug text-slate-600 xl:text-lg">
                Make a smarter choice. Compare up to {COMPARE_MAX_ITEMS} vehicles side by side on key specs, features, and pricing.
              </p>
              <ul className="mt-4 hidden flex-wrap gap-2 sm:flex">
                {comparisonBenefits.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-semibold text-[#173263] shadow-sm">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MarketplaceHero>

        <div className={MARKETPLACE_PAGE_WIDTH + " relative z-10 pb-12 pt-4 lg:-mt-3 lg:pt-0"}>
          <ComparePageClient initialIds={initialIds} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
