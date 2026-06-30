"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, GitCompare, LogOut, Plus } from "lucide-react";
import { AutolistLogo } from "@/components/brand/autolist-logo";
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
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import type { ListingCategory } from "@/lib/constants/marketplace";

const vehicleTypes = [
  { name: "Cars & Vans", href: "/search?category=car", category: "car" },
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
    <div className="hidden xl:block border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-6">
        <div className="flex min-h-9 items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-[12px]">
            {vehicleTypes.map((type) => (
              <Link
                key={type.name}
                href={type.href}
                className={cn(
                  "border-b-2 px-2 py-2 font-medium text-gray-500 transition-colors hover:text-gray-900",
                  activeCategory === type.category
                    ? "border-primary text-primary"
                    : "border-transparent"
                )}
              >
                {type.name}
              </Link>
            ))}
          </nav>
          <ThemeSwitcher layout="topbar" />
        </div>
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
    if (bodyType === "Van") return "car";
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
  const closeMenuTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ids } = useCompare();
  const { user, loading } = useAuth();

  const clearCloseMenuTimeout = React.useCallback(() => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }
  }, []);

  const scheduleCloseMenu = React.useCallback(() => {
    clearCloseMenuTimeout();
    closeMenuTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
      closeMenuTimeoutRef.current = null;
    }, 150);
  }, [clearCloseMenuTimeout]);

  React.useEffect(() => {
    return () => {
      clearCloseMenuTimeout();
    };
  }, [clearCloseMenuTimeout]);

  React.useEffect(() => {
    if (!openMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        clearCloseMenuTimeout();
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearCloseMenuTimeout();
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearCloseMenuTimeout, openMenu]);

  React.useEffect(() => {
    clearCloseMenuTimeout();
    setOpenMenu(null);
    setAccountMenuOpen(false);
    setMobileOpenMenu(null);
  }, [clearCloseMenuTimeout, pathname]);

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

      <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between xl:h-14">
          <Link href="/" className="flex items-center gap-2">
            <AutolistLogo className="h-8 w-auto xl:h-7" />
          </Link>

          <nav ref={desktopNavRef} className="hidden items-center gap-0.5 xl:flex">
            {desktopLinks.map((item) => {
              if ("menu" in item) {
                const isOpen = openMenu === item.key;
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onPointerEnter={() => {
                      clearCloseMenuTimeout();
                      setOpenMenu(item.key);
                    }}
                    onPointerLeave={scheduleCloseMenu}
                    onFocus={() => {
                      clearCloseMenuTimeout();
                      setOpenMenu(item.key);
                    }}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        scheduleCloseMenu();
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onClick={() => {
                        clearCloseMenuTimeout();
                        setOpenMenu((current) => (current === item.key ? null : item.key));
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:text-gray-900",
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
                    "rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:text-gray-900",
                    pathname === item.href ? "text-primary" : "text-gray-700"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="xl:hidden">
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
              className="xl:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-card shadow-[0_18px_48px_rgb(var(--primary-rgb)/0.18)] xl:hidden">
          <div className="max-h-[calc(100dvh-4rem)] space-y-5 overflow-y-auto px-4 py-5">
            <div className="space-y-3 border-b border-border pb-5">
              {user ? (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted p-3">
                  <div className="flex items-center gap-3 px-1 py-1 text-sm font-semibold text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {userInitial}
                    </span>
                    <span className="min-w-0 truncate">{userLabel}</span>
                  </div>
                  <Link href="/dashboard/profile" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="min-h-11 w-full justify-start gap-2 border-border bg-card text-foreground hover:bg-muted">
                      <IconUser className="h-4 w-4" />
                      Account details
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="min-h-11 w-full justify-start gap-2 border-border bg-card text-foreground hover:bg-muted">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="min-h-11 w-full justify-start gap-2 border-border bg-card text-foreground hover:bg-muted"
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
                <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
                  <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="min-h-11 w-full border-primary text-primary hover:bg-brand-tint">
                      Login / Register
                    </Button>
                  </Link>
                  <Link href="/dashboard/listings/new" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="min-h-11 w-full bg-primary text-primary-foreground hover:bg-brand-hover">
                      <Plus className="h-4 w-4" />
                      Add listing
                    </Button>
                  </Link>
                </div>
              )}
              {user ? (
                <Link href="/dashboard/listings/new" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="min-h-11 w-full bg-primary text-primary-foreground hover:bg-brand-hover">
                    <Plus className="h-4 w-4" />
                    Add listing
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Vehicle categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {vehicleTypes.map((type) => (
                  <Link
                    key={type.name}
                    href={type.href}
                    className="rounded-xl border border-border bg-muted px-3 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
            </div>

            <ThemeSwitcher layout="mobile" />

            <nav className="space-y-2" aria-label="Mobile menu">
              {desktopLinks.map((item) => {
                if ("menu" in item) {
                  const isMobileSectionOpen = mobileOpenMenu === item.key;

                  return (
                    <Collapsible
                      key={item.name}
                      open={isMobileSectionOpen}
                      onOpenChange={(open) => setMobileOpenMenu(open ? item.key : null)}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <CollapsibleTrigger className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:bg-muted">
                        {item.name}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t border-border bg-muted/55">
                        <div className="flex flex-col gap-1 p-2">
                          {item.menu.map((menuItem) => (
                            <Link
                              key={menuItem.name}
                              href={menuItem.href}
                              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
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
                      "block rounded-xl px-4 py-3 text-sm font-semibold transition",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border pt-5">
              <Link href="/compare" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="min-h-11 w-full justify-start gap-2 border-primary text-primary hover:bg-brand-tint"
                >
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
