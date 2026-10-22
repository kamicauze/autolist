import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ImportInquiryForm } from "@/components/import-inquiry/import-inquiry-form";
import { ImportFAQ } from "@/components/import-inquiry/import-faq";
import { getAllMakeNames } from "@/lib/data/car-data";

export const metadata = {
  title: "Import Inquiry | Autolist",
  description:
    "Fill this form and get a quote for importing your preferred car to Kenya.",
};

export default async function ImportInquiryPage() {
  const makes = await getAllMakeNames();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative flex min-h-[320px] items-center overflow-hidden bg-gray-900 py-16 text-white sm:min-h-[400px] sm:py-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/import-hero.webp')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">
              Import Inquiry
            </p>
            <h1 className="max-w-lg text-3xl font-bold sm:text-4xl">
              Fill this form and get a quote for your preferred car.
            </h1>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImportInquiryForm makes={makes} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImportFAQ />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
