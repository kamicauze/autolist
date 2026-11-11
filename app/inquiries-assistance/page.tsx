import Image from "next/image";
import { CarFront, Headset, MapPin, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketplaceHero, MARKETPLACE_PAGE_WIDTH } from "@/components/layout/marketplace-hero";
import { SupportContactLinks } from "@/components/layout/support-contact-links";
import { InquiryAssistanceForm } from "@/components/inquiries-assistance/inquiry-assistance-form";
import { IconWhatsapp } from "@/components/ui/icons";
import { SUPPORT_WHATSAPP_NUMBER, SUPPORT_WHATSAPP_URL } from "@/lib/constants/support-contact";

export const metadata = {
  title: "Inquiries & Assistance | Autolist",
  description: "Send buyer or seller inquiries to the Autolist admin team.",
};

const inquiryTopics = [
  { icon: Headset, label: "Marketplace support" },
  { icon: CarFront, label: "Listing assistance" },
  { icon: MessageCircle, label: "General enquiries" },
];

export default function InquiriesAssistancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-brand-soft-surface">
        <MarketplaceHero imageSrc="/images/marketing/contact-hero.webp" className="lg:min-h-[356px]">
          <div className="py-7 sm:py-10 lg:py-12">
            <div className="max-w-[39rem] lg:max-w-[52%]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
                Inquiries &amp; Assistance
              </p>
              <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl xl:text-[48px]">
                Contact the Autolist team
              </h1>
              <p className="mt-2 max-w-[35rem] text-base leading-relaxed text-slate-700 xl:text-lg">
                Buyers, sellers, and dealers can send marketplace questions, listing support requests,
                website feedback, and assistance inquiries directly to the admin team.
              </p>
              <ul className="mt-6 hidden flex-wrap gap-x-6 gap-y-3 sm:flex">
                {inquiryTopics.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex max-w-[8rem] items-center gap-2.5 text-sm leading-snug font-semibold">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-tint-strong text-brand-link">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white/85 px-3 text-sm font-semibold text-[#173263] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hidden"
              >
                <IconWhatsapp className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                WhatsApp {SUPPORT_WHATSAPP_NUMBER}
              </a>
            </div>
          </div>
        </MarketplaceHero>

        <div className={MARKETPLACE_PAGE_WIDTH + " grid gap-6 py-6 lg:grid-cols-[minmax(0,1.64fr)_minmax(0,1fr)] lg:gap-9 lg:pb-14"}>
          <section id="inquiry-form" className="min-w-0 scroll-mt-28" aria-labelledby="inquiry-form-heading">
            <InquiryAssistanceForm />
          </section>

          <aside aria-label="Contact information" className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-border/50 bg-brand-tint p-4 sm:p-5 lg:p-6">
              <h2 className="mb-4 flex items-center gap-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                <Headset className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
                Other ways to reach us
              </h2>
              <SupportContactLinks />
            </section>

            <section className="relative isolate overflow-hidden rounded-2xl border border-border/50 bg-brand-tint p-4 sm:p-5 lg:p-6">
              <Image
                src="/images/marketing/office-skyline.webp"
                alt=""
                width={192}
                height={108}
                className="pointer-events-none absolute right-0 bottom-0 -z-10 h-auto w-28 sm:w-40"
              />
              <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                <MapPin className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
                Our office
              </h2>
              <p className="mt-3 pl-10 text-base font-semibold text-foreground">Nairobi, Kenya</p>
              <p className="mt-0.5 pl-10 text-sm text-muted-foreground">Autolist Kenya</p>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
