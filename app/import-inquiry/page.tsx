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
        <section className="relative overflow-hidden bg-primary py-16 text-center text-white sm:py-20">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/hero-car.jpg')" }}
          />
          <div className="relative z-10 mx-auto max-w-3xl px-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">
              Import Inquiry
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
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
