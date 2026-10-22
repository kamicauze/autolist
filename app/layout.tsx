import type { Metadata } from "next";
import { ThemeScript } from "@/components/theme/theme-script";
import { resolveThemeId } from "@/lib/theme/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autolist",
  description: "Find and list items easily",
};

const initialTheme = resolveThemeId(process.env.NEXT_PUBLIC_AUTOLIST_THEME);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={initialTheme} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
        <ThemeScript initialTheme={initialTheme} />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
