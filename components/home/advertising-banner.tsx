import Image from "next/image";
import Link from "next/link";

export function AdvertisingBanner() {
  return (
    <section aria-label="Advertise your vehicle" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/listings/new"
        aria-label="Start advertising — create a vehicle listing"
        data-track="sell_cta_click"
        data-track-target="Start advertising banner"
        className="block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <Image
          src="/images/marketing/start-advertising-banner.webp"
          alt="Advertise with us. Put your vehicles in front of buyers across Kenya. Start advertising."
          width={1600}
          height={900}
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="h-auto w-full"
        />
      </Link>
    </section>
  );
}
