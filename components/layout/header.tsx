"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IconMenu,
  IconX,
  IconHeart,
  IconUser,
  IconSearch,
} from "@/components/ui/icons";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Buy Cars", href: "/search" },
  { name: "Sell Vehicle", href: "/sell" },
  { name: "New, Reviews & Videos", href: "/reviews" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const vehicleTypes = [
  "Cars",
  "Vans",
  "Bikes",
  "Motorhomes",
  "Caravans",
  "Trucks",
  "Farm",
  "Plant",
  "Electric Bikes",
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      {/* Top Bar - Vehicle Types */}
      <div className="hidden lg:block bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 py-2 text-sm">
            {vehicleTypes.map((type) => (
              <Link
                key={type}
                href={`/search?type=${type.toLowerCase()}`}
                className="hover:text-secondary transition-colors"
              >
                {type}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-primary">Auto</span>
                <span className="text-secondary">list</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search (Mobile) */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <IconSearch className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <IconHeart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Login/Register */}
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="gap-2">
                <IconUser className="h-4 w-4" />
                <span>Login / Register</span>
              </Button>
            </Link>

            {/* Add Listing Button */}
            <Link href="/dashboard/listings/new">
              <Button size="sm" className="hidden sm:flex">
                Add Listing
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <IconX className="h-6 w-6" />
              ) : (
                <IconMenu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full my-1">
                  Login / Register
                </Button>
              </Link>
              <Link href="/dashboard/listings/new" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full my-1">Add Listing</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
