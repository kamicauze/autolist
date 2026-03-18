import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

function SkeletonRow({ width = "w-full" }: { width?: string }) {
  return <div className={`h-10 rounded-md bg-gray-100 ${width}`} aria-hidden />;
}

export default function VehicleLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-36 rounded-lg border border-gray-200 bg-gray-50" />
            <div className="h-36 rounded-lg border border-gray-200 bg-gray-50" />
            <div className="h-36 rounded-lg border border-gray-200 bg-gray-50" />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-6 text-sm">
            <div className="h-2 rounded bg-primary" />
            <div className="h-2 rounded bg-gray-100" />
            <div className="h-2 rounded bg-gray-100" />
          </div>

          <section className="mt-8 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Car Overview</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <SkeletonRow key={`overview-${index}`} />
              ))}
            </div>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Features</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 18 }).map((_, index) => (
                <SkeletonRow key={`features-${index}`} />
              ))}
            </div>
          </section>

          <section className="mt-10 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonRow key={`footer-row-${index}`} width="w-1/2" />
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
