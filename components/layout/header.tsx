"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, GitCompare, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconMenu, IconX, IconUser, IconSearch } from "@/components/ui/icons";
import { useCompare } from "@/lib/hooks/use-compare";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { ListingCategory } from "@/lib/constants/marketplace";

const vehicleTypes = [
  { name: "Cars", href: "/search?category=car", category: "car" },
  { name: "Vans", href: "/search?category=van", category: "van" },
  { name: "Motorbikes", href: "/search?category=motorbike&q=motorbike", category: "motorbike" },
  { name: "Trucks", href: "/search?category=truck&q=truck", category: "truck" },
  { name: "Farm", href: "/search?category=farm_agricultural&q=farm+agricultural", category: "farm_agricultural" },
  { name: "Plant", href: "/search?category=plant_construction&q=plant+construction", category: "plant_construction" },
] as const satisfies ReadonlyArray<{ name: string; href: string; category: ListingCategory }>;

const buyMenu = [
  { name: "New Cars", href: "/search?condition=new" },
  { name: "Used Cars", href: "/search" },
  { name: "Compare Cars", href: "/compare" },
];

const toolsMenu = [
  { name: "Car Financing", href: "/calculator" },
  { name: "Value your car", href: "/valuation" },
  { name: "Compare cars", href: "/compare" },
  { name: "Car Insurance", href: "/insurance" },
  { name: "Import Inquiry", href: "/import-inquiry" },
  { name: "Inquiries & Assistance", href: "/inquiries-assistance" },
];

const pagesMenu = [
  { name: "About us", href: "/about" },
  { name: "Dealers", href: "/dealers" },
  { name: "FAQs", href: "/faqs" },
  { name: "How it works", href: "/how-it-works" },
];

const desktopLinks = [
  { name: "Home", href: "/" },
  { name: "Buy a car", menu: buyMenu, key: "buy" },
  { name: "Sell a car", href: "/sell" },
  { name: "News & reviews", href: "/blog" },
  { name: "Tools & Services", menu: toolsMenu, key: "tools" },
  { name: "Car alerts", href: "/alerts" },
  { name: "Pages", menu: pagesMenu, key: "pages" },
] as const;

function VehicleTypeLinks({ activeCategory }: { activeCategory: ListingCategory | null }) {
  return (
    <div className="hidden lg:block border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-[12px]">
          {vehicleTypes.map((type) => (
            <Link
              key={type.name}
              href={type.href}
              className={cn(
                "border-b-2 px-2 py-2.5 font-medium text-gray-500 transition-colors hover:text-gray-900",
                activeCategory === type.category
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
            >
              {type.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function HeaderVehicleTypeNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeVehicleCategory = React.useMemo<ListingCategory | null>(() => {
    if (pathname !== "/search") {
      return null;
    }

    const explicitCategory = searchParams.get("category") as ListingCategory | null;
    if (explicitCategory) {
      return explicitCategory;
    }

    const legacyType = searchParams.get("type");
    if (legacyType === "motorbikes") return "motorbike";
    if (legacyType === "plant") return "plant_construction";
    if (legacyType === "farm") return "farm_agricultural";

    const bodyType = searchParams.get("bodyType");
    if (bodyType === "Van") return "van";
    if (bodyType === "Truck") return "truck";

    return "car";
  }, [pathname, searchParams]);

  return <VehicleTypeLinks activeCategory={activeVehicleCategory} />;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileOpenMenu, setMobileOpenMenu] = React.useState<string | null>(null);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const desktopNavRef = React.useRef<HTMLElement | null>(null);
  const accountMenuRef = React.useRef<HTMLDivElement | null>(null);
  const { ids } = useCompare();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!openMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  React.useEffect(() => {
    setOpenMenu(null);
    setAccountMenuOpen(false);
    setMobileOpenMenu(null);
  }, [pathname]);

  React.useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const userLabel = user?.email?.split("@")[0] || "Account";
  const userInitial = userLabel.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <React.Suspense fallback={<VehicleTypeLinks activeCategory={null} />}>
        <HeaderVehicleTypeNav />
      </React.Suspense>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/autolist-logo.svg"
              alt="Autolist"
              width={154}
              height={44}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <nav ref={desktopNavRef} className="hidden items-center gap-1 lg:flex">
            {desktopLinks.map((item) => {
              if ("menu" in item) {
                const isOpen = openMenu === item.key;
                return (
                  <div
                    key={item.name}
                    className="relative"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onClick={() => setOpenMenu((current) => (current === item.key ? null : item.key))}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:text-gray-900",
                        isOpen && "text-gray-900"
                      )}
                    >
                      {item.name}
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                        {item.menu.map((menuItem) => (
                          <Link
                            key={menuItem.name}
                            href={menuItem.href}
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          >
                            {menuItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:text-gray-900",
                    pathname === item.href ? "text-primary" : "text-gray-700"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <IconSearch className="h-5 w-5" />
            </Button>

            <Link href="/compare" className="relative hidden sm:block">
              <Button variant="ghost" size="icon">
                <GitCompare className="h-5 w-5" />
              </Button>
              {ids.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                  {ids.length}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="hidden h-10 w-32 animate-pulse rounded-lg bg-gray-100 sm:block" />
            ) : user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700">
                  <NotificationBell className="text-gray-700" />
                </div>
                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setAccountMenuOpen((current) => !current)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {userInitial}
                    </span>
                    <span className="max-w-[108px] truncate">{userLabel}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", accountMenuOpen && "rotate-180")} />
                  </button>
                  {accountMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
                    >
                      <Link
                        href="/dashboard/profile"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        <IconUser className="h-4 w-4" />
                        Account details
                      </Link>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button size="sm" className="rounded-[10px] px-4">
                  Login / Register
                </Button>
              </Link>
            )}

            <Link href="/dashboard/listings/new" className="hidden sm:block">
              <Button size="sm" className="gap-1.5 rounded-[10px] bg-primary px-4 hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add listing
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 lg:hidden">
          <div className="max-h-[calc(100vh-4rem)] space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3 border-b border-gray-200 pb-4">
              {user ? (
                <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-800">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {userInitial}
                    </span>
                    <span className="min-w-0 truncate">{userLabel}</span>
                  </div>
                  <Link href="/dashboard/profile" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="min-h-11 w-full justify-start gap-2">
                      <IconUser className="h-4 w-4" />
                      Account details
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="min-h-11 w-full justify-start gap-2">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="min-h-11 w-full justify-start gap-2"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="min-h-11 w-full">Login / Register</Button>
                </Link>
              )}
              <Link href="/dashboard/listings/new" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="min-h-11 w-full">Add listing</Button>
              </Link>
            </div>

            {desktopLinks.map((item) => {
              if ("menu" in item) {
                const isMobileSectionOpen = mobileOpenMenu === item.key;

                return (
                  <Collapsible
                    key={item.name}
                    open={isMobileSectionOpen}
                    onOpenChange={(open) => setMobileOpenMenu(open ? item.key : null)}
                    className="rounded-lg border border-gray-200"
                  >
                    <CollapsibleTrigger className="px-3 py-3 text-left text-sm font-semibold text-gray-800">
                      {item.name}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="border-t border-gray-100">
                      <div className="flex flex-col gap-1 px-2">
                        {item.menu.map((menuItem) => (
                          <Link
                            key={menuItem.name}
                            href={menuItem.href}
                            className="block rounded-md px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {menuItem.name}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary text-white"
                      : "text-gray-800 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
              <Link href="/compare" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="min-h-11 w-full justify-start gap-2">
                  <GitCompare className="h-4 w-4" />
                  Compare{ids.length > 0 ? ` (${ids.length})` : ""}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
