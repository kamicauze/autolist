import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

const ACCOUNT_BENEFITS = [
  "Keep saved vehicles in one place",
  "Manage listings and dealer offers",
  "Follow enquiries, appointments, and messages",
];

export function LoginAccountShell({
  children,
  registerHref,
}: {
  children: ReactNode;
  registerHref: string;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center bg-[#edf1f7] px-4 py-3 sm:px-6 sm:py-4">
      <section className="mx-auto w-full max-w-[1240px] overflow-hidden rounded-[20px] border border-[#dce2ea] bg-white shadow-[0_28px_80px_rgba(28,39,54,0.12)] lg:grid lg:grid-cols-[minmax(0,610px)_minmax(360px,1fr)]">
        <div className="bg-white">
          <div className="grid grid-cols-2 border-b border-[#dfe3e8]">
            <div className="flex h-[60px] items-center justify-center border-r border-[#dfe3e8] text-[16px] font-semibold text-primary">
              <span className="flex h-full items-center border-b-[3px] border-primary px-8">
                Login
              </span>
            </div>
            <Link
              href={registerHref}
              className="flex h-[60px] items-center justify-center bg-[#f8f9fb] text-[16px] font-semibold text-[#555d68] transition hover:bg-[#f1f4f8] hover:text-primary"
            >
              Register
            </Link>
          </div>

          <div className="px-6 py-6 sm:px-10 lg:px-12">
            <h1 className="font-heading text-[30px] font-semibold leading-tight text-[#20242a] sm:text-[34px]">
              Hello! Welcome back!
            </h1>
            <div className="mt-4">{children}</div>
          </div>
        </div>

        <aside className="relative min-h-[420px] overflow-hidden border-t border-[#dfe3e8] lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src="/hero-car.jpg"
            alt="Black performance sedan driving on an open road"
            fill
            priority
            sizes="(min-width: 1024px) 630px, 100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-[#101828]/20"
            aria-hidden="true"
          />

          <div className="relative z-10 m-5 max-w-[500px] rounded-[24px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:m-8 sm:p-7 lg:m-10">
            <h2 className="font-heading text-[27px] font-semibold leading-[1.2] text-[#172033] sm:text-[30px]">
              Your advantages with an Autolist account
            </h2>

            <div className="mt-6 space-y-4">
              {ACCOUNT_BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-[15px] font-medium text-[#283448] sm:text-[16px]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm">
                    <Check className="h-4 w-4 text-[#21875a]" />
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
