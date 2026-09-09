import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCOUNT_BENEFITS = [
  "Keep saved vehicles in one place",
  "Manage listings and dealer offers",
  "Follow enquiries, appointments, and messages",
];

const REGISTRATION_BENEFITS = [
  "Choose the account that matches how you use Autolist",
  "Keep account details when you change your selection",
  "Continue into the right profile and verification steps",
];

type AccountAccessShellProps = {
  activeView: "login" | "register";
  children: ReactNode;
  heading: string;
  description?: string;
  imageAlt: string;
  imageSrc: string;
  loginHref: string;
  registerHref: string;
  sideTitle: string;
  benefits: string[];
  className?: string;
};

function AccountAccessShell({
  activeView,
  benefits,
  children,
  className,
  description,
  heading,
  imageAlt,
  imageSrc,
  loginHref,
  registerHref,
  sideTitle,
}: AccountAccessShellProps) {
  const loginActive = activeView === "login";

  const tabClassName = (active: boolean) =>
    cn(
      "flex h-[60px] items-center justify-center text-[16px] font-semibold transition active:translate-y-px",
      active
        ? "bg-white text-primary"
        : "bg-[#f8f9fb] text-[#555d68] hover:bg-[#f1f4f8] hover:text-primary",
    );

  return (
    <main className="flex min-h-[100dvh] items-center bg-[#edf1f7] px-4 py-3 sm:px-6 sm:py-4">
      <section
        className={cn(
          "mx-auto w-full max-w-[1240px] overflow-hidden rounded-[20px] border border-[#dce2ea] bg-white shadow-[0_28px_80px_rgba(28,39,54,0.12)] lg:grid lg:grid-cols-[minmax(0,610px)_minmax(360px,1fr)]",
          className,
        )}
      >
        <div className="bg-white">
          <nav aria-label="Account access" className="grid grid-cols-2 border-b border-[#dfe3e8]">
            <Link
              href={loginHref}
              aria-current={loginActive ? "page" : undefined}
              className={cn(tabClassName(loginActive), "border-r border-[#dfe3e8]")}
            >
              <span
                className={cn(
                  "flex h-full items-center px-8",
                  loginActive && "border-b-[3px] border-primary",
                )}
              >
                Login
              </span>
            </Link>
            <Link
              href={registerHref}
              aria-current={!loginActive ? "page" : undefined}
              className={tabClassName(!loginActive)}
            >
              <span
                className={cn(
                  "flex h-full items-center px-8",
                  !loginActive && "border-b-[3px] border-primary",
                )}
              >
                Register
              </span>
            </Link>
          </nav>

          <div className="px-6 py-6 sm:px-10 lg:px-12">
            <h1 className="font-heading text-[30px] font-semibold leading-tight text-[#20242a] sm:text-[34px]">
              {heading}
            </h1>
            {description ? (
              <p className="mt-2 max-w-[62ch] text-sm leading-6 text-[#696f78]">
                {description}
              </p>
            ) : null}
            <div className="mt-4">{children}</div>
          </div>
        </div>

        <aside className="relative min-h-[420px] overflow-hidden border-t border-[#dfe3e8] lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 630px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#101828]/20" aria-hidden="true" />

          <div className="relative z-10 m-5 max-w-[500px] rounded-[24px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:m-8 sm:p-7 lg:m-10">
            <h2 className="font-heading text-[27px] font-semibold leading-[1.2] text-[#172033] sm:text-[30px]">
              {sideTitle}
            </h2>

            <div className="mt-6 space-y-4">
              {benefits.map((benefit) => (
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

export function LoginAccountShell({
  children,
  registerHref,
}: {
  children: ReactNode;
  registerHref: string;
}) {
  return (
    <AccountAccessShell
      activeView="login"
      heading="Hello! Welcome back!"
      imageAlt="Black performance sedan driving on an open road"
      imageSrc="/hero-car.jpg"
      loginHref="/login"
      registerHref={registerHref}
      sideTitle="Your advantages with an Autolist account"
      benefits={ACCOUNT_BENEFITS}
    >
      {children}
    </AccountAccessShell>
  );
}

export function RegisterAccountShell({
  children,
  loginHref,
}: {
  children: ReactNode;
  loginHref: string;
}) {
  return (
    <AccountAccessShell
      activeView="register"
      heading="Create your Autolist account"
      description="First choose how you plan to use Autolist. We will then show the right account details and next steps."
      imageAlt="Gold BMW ready for sale at a Kenyan dealership"
      imageSrc="/auth/login-bmw-x2-front.jpg"
      loginHref={loginHref}
      registerHref="/register"
      sideTitle="Start with the account that fits"
      benefits={REGISTRATION_BENEFITS}
      className="max-w-[1380px] lg:grid-cols-[minmax(0,820px)_minmax(360px,1fr)]"
    >
      {children}
    </AccountAccessShell>
  );
}
