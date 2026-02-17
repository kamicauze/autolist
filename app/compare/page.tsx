import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ComparePageClient } from "@/components/compare/compare-page-client";
import { parseCompareIds } from "@/lib/utils/compare";

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

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Compare" },
            ]}
            className="mb-4"
          />

          <ComparePageClient initialIds={initialIds} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
