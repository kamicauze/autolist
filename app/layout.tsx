import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeScript } from "@/components/theme/theme-script";
import { resolveThemeId } from "@/lib/theme/themes";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
        <ThemeScript initialTheme={initialTheme} />
      </head>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
