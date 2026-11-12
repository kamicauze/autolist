import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AutolistLogo } from "@/components/brand/autolist-logo";
import { IconX } from "@/components/ui/icons";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f0f4f9] px-4 py-8 sm:px-6">
      <section
        aria-labelledby="forgot-password-title"
        className="grid w-full max-w-[74rem] overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_26px_70px_rgba(30,48,78,0.17)] md:grid-cols-[46.4%_1fr]"
      >
        <div className="relative min-h-[150px] bg-[#0f1b31] md:min-h-[32rem] lg:min-h-[33.375rem]">
          <Image
            src="/auth/forgot-password-hero.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 100vw, (max-width: 1232px) 46vw, 550px"
            className="object-cover object-[center_29%] md:object-center"
          />
          <Link
            href="/"
            aria-label="Autolist home"
            data-theme="autolist"
            className="absolute left-5 top-5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:left-8 md:top-7 lg:left-12"
          >
            <AutolistLogo className="h-8 w-auto lg:h-11" />
          </Link>
          <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-[#07182e]/90 via-[#07182e]/40 to-transparent px-8 pb-11 pt-14 text-white md:block lg:px-12 lg:pb-13">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Autolist account</p>
            <p className="mt-4 text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.1] font-extrabold tracking-tight">
              <span className="block">Let’s get you</span> back on the road.
            </p>
            <p className="mt-3 max-w-[22rem] text-base leading-relaxed text-white/90 lg:text-lg">
              Reset your password and get back to exploring, buying, and selling vehicles with ease.
            </p>
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-6 pt-10 pb-8 sm:px-9 md:py-12 lg:px-12">
          <Link
            href="/"
            aria-label="Close"
            className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <IconX className="h-5 w-5" />
          </Link>

          <p className="pr-10 text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">Forgot password</p>
          <h1 id="forgot-password-title" className="mt-4 text-[30px] leading-[1.12] font-extrabold tracking-tight text-[#0f1b31] lg:text-[44px]">
            Reset your password
          </h1>
          <p className="mt-4 max-w-[29rem] text-sm leading-relaxed text-slate-600 lg:text-base">
            Enter your email address and we’ll send you a link to reset your password.
          </p>

          <div className="mt-7 sm:mt-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </main>
  );
}
