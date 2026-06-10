import Link from "next/link";
import { Facebook, Youtube, Instagram } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.12z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: Youtube,
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
  },
  {
    name: "TikTok",
    href: "https://tiktok.com",
    icon: TikTokIcon,
  },
];

export function SocialMediaSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Follow us on social media
        </h2>
        <p className="mt-3 text-gray-500">
          All the latest news for you
        </p>

        <div className="mt-10 grid grid-cols-2 justify-items-center gap-x-8 gap-y-6 sm:flex sm:items-center sm:justify-center sm:gap-16">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <Icon className="w-8 h-8 text-gray-700 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">
                  {social.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
