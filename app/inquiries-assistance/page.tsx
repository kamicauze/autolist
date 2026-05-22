import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InquiryAssistanceForm } from "@/components/inquiries-assistance/inquiry-assistance-form";

export const metadata = {
  title: "Inquiries & Assistance | Autolist",
  description: "Send buyer or seller inquiries to the Autolist admin team.",
};

export default function InquiriesAssistancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <section className="border-b border-gray-200 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Inquiries & Assistance
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Contact the Autolist team
            </h1>
            <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base">
              Buyers, sellers, and dealers can send marketplace questions, listing support requests,
              and assistance inquiries directly to the admin team.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <InquiryAssistanceForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
