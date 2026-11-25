import Image from "next/image";
import Link from "next/link";

export function AdvertisingBanner() {
  return (
    <section aria-label="Advertise your vehicle" className="w-full">
      <h1 className="sr-only">Advertise your vehicle on Autolist</h1>
      <Link
        href="/advertise-with-us"
        aria-label="Start advertising with us"
        data-track="sell_cta_click"
        data-track-target="Start advertising banner"
        className="block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet="/images/marketing/advertising-hero-desktop-clean.webp"
            width={1600}
            height={600}
          />
          <Image
            src="/images/marketing/advertising-hero-mobile-clean.webp"
            alt="Advertise with us. Put your vehicles in front of buyers across Kenya. Start advertising."
            priority
            width={1600}
            height={900}
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="h-auto w-full object-cover object-left md:h-[470px] lg:h-[500px]"
          />
        </picture>
      </Link>
    </section>
  );
}
