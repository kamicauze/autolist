import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RecentlyViewedPageClient } from "@/components/home/recently-viewed-page-client";

export default function RecentlyViewedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold leading-9 text-[#202224]">
              Recently viewed vehicles
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#6f7784]">
              Continue from vehicles you opened on this device.
            </p>
          </div>
          <RecentlyViewedPageClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
