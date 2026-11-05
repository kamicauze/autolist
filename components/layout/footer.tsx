import Link from "next/link";
import { CookiePreferencesLink } from "@/components/analytics/google-analytics";
import { AutolistLogo } from "@/components/brand/autolist-logo";
import { BackToTopButton } from "@/components/layout/back-to-top-button";
import { CorporateInquiryForm } from "@/components/shared/corporate-inquiry-form";

const footerLinks = {
  Buying: [
    { name: "Used cars", href: "/search?category=car&condition=used" },
    { name: "New cars", href: "/search?category=car&condition=new" },
    { name: "New listings", href: "/search?sortBy=newest" },
    { name: "All listings", href: "/search" },
    { name: "Compare", href: "/compare" },
    { name: "Financing", href: "/calculator" },
    { name: "Find a dealer", href: "/dealers" },
    { name: "News & reviews", href: "/blog" },
  ],
  Selling: [
    { name: "Sell your vehicle", href: "/sell" },
    { name: "Private seller", href: "/sell" },
    { name: "Dealer advertising", href: "/dealers" },
    { name: "Trade-In", href: "/trade-in" },
  ],
  About: [
    { name: "About Autolist", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Advertise with us", href: "/advertise-with-us" },
    { name: "Contact us", href: "/inquiries-assistance#inquiry-form" },
    { name: "FAQs", href: "/faqs" },
    { name: "Security advice", href: "/security-advice" },
    { name: "Privacy policy", href: "/privacy" },
    { name: "Cookie policy", href: "/cookies" },
    { name: "Terms & conditions", href: "/terms" },
    { name: "Acceptable use", href: "/acceptable-use" },
  ],
};

export function Footer() {
  return (
    <>
      <BackToTopButton />
      <footer className="bg-[#0F0F14] text-white">
        {/* Main Footer */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Links Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-5 text-sm font-semibold">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#92929D] transition-colors hover:text-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  {title === "About" && (
                    <li><CookiePreferencesLink className="text-sm text-[#92929D] transition-colors hover:text-white" /></li>
                  )}
                </ul>
              </div>
            ))}

            {/* Corporate inquiries */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <h3 className="mb-5 text-sm font-semibold">Corporate Advertising &amp; Partnerships</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#92929D]">
                Partner with us for advertising, brand collaborations, and strategic
                opportunities. Reach out and let’s create value together.
              </p>
              <CorporateInquiryForm dark />
            </div>
          </div>
        </div>

        <div className="border-t border-[#2E2E38]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-5 text-sm sm:px-6 lg:px-8">
            <p className="text-[#92929D]">Help us improve our website.</p>
            <Link
              href="/inquiries-assistance#inquiry-form"
              className="font-medium text-white underline underline-offset-4 hover:text-primary"
            >
              Send feedback
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2E2E38]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <Link href="/" className="flex items-center">
                <AutolistLogo
                  className="h-7 w-auto [--brand-logo-accent:#FFFFFF] [--brand-logo-mark:#FFFFFF] [--brand-logo-text:#FFFFFF]"
                />
              </Link>

              <p className="text-sm text-[#92929D]">
                &copy; {new Date().getFullYear()} All rights reserved. Autolist
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
