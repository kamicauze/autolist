"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  CarFront,
  CircleDollarSign,
  FileText,
  FileWarning,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  SquarePen,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "All Listings", href: "/admin/listings", icon: SquarePen },
      { name: "Featured Listings", href: "/admin/featured-listings", icon: CarFront },
      { name: "Review", href: "/admin/review", icon: FileWarning },
      { name: "Reports", href: "/admin/reports", icon: ScrollText },
      { name: "Verification (KYC)", href: "/admin/verification", icon: ShieldCheck },
      { name: "Insurance Requests", href: "/admin/insurance-requests", icon: ReceiptText },
      { name: "Car Inquiries", href: "/admin/car-inquiries", icon: MessageSquareText },
      { name: "Inquiries & Assistance", href: "/admin/inquiries-assistance", icon: MessageSquareText },
      { name: "Payments", href: "/admin/payments", icon: CircleDollarSign },
    ],
  },
  {
    title: "Content & System",
    items: [
      { name: "Ads & Banners", href: "/admin/ads-banners", icon: SquarePen },
      { name: "Blogs & Content", href: "/admin/blogs-content", icon: Newspaper },
      { name: "Special Offers", href: "/admin/special-offers", icon: Tag },
      { name: "CMS", href: "/admin/cms", icon: FileText },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Roles & Permissions", href: "/admin/roles-permissions", icon: UserCog },
      { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
];

export const adminSurfaceClass =
  "rounded-[16px] border border-[#e5e7eb] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]";

export const adminInputClass =
  "h-10 w-full rounded-[8px] border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#1f2937] outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 placeholder:text-[#9ca3af]";

export const adminSelectClass =
  "h-10 w-full appearance-none rounded-[8px] border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#1f2937] outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10";

export const adminTextareaClass =
  "min-h-[96px] w-full rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-2 text-[14px] text-[#1f2937] outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 placeholder:text-[#9ca3af]";

export const adminPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-[10px] bg-[#2563eb] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1d4ed8]";

export const adminGhostButtonClass =
  "inline-flex items-center justify-center rounded-[10px] border border-[#d1d5db] bg-white px-4 py-2.5 text-[13px] font-medium text-[#374151] transition hover:border-[#2563eb] hover:text-[#2563eb]";

export type AdminFeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

export function AdminPageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-tour="admin-page-header"
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <h1 className="font-heading text-[24px] font-semibold leading-[1.1] text-[#111827]">
        {title}
      </h1>
      {action ? <div data-tour="admin-page-action">{action}</div> : null}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-[16px] bg-[#fff7ed] px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2563eb] shadow-[0_8px_20px_rgba(37,99,235,0.08)]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[#1f2937]">{label}</p>
          <div className="mt-1 flex items-center gap-3">
            <p className="font-heading text-[18px] font-semibold text-[#111827]">{value}</p>
            {note ? <span className="text-[13px] font-medium text-[#22c55e]">{note}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  ...sectionProps
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section {...sectionProps} className={cn(adminSurfaceClass, className)}>
      <div className="px-6 pt-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-heading text-[18px] font-semibold text-[#111827]">{title}</h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      </div>
      <div className={cn("px-6 pb-6", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function AdminFeedbackBanner({
  feedback,
  className,
}: {
  feedback: AdminFeedbackState;
  className?: string;
}) {
  if (!feedback) return null;

  return (
    <div
      className={cn(
        adminSurfaceClass,
        "px-5 py-4 text-[13px]",
        feedback.tone === "success"
          ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
          : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
        className
      )}
    >
      {feedback.message}
    </div>
  );
}

export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#e5e7eb] bg-white sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[20px] text-[#111827]">{title}</DialogTitle>
          <DialogDescription className="text-[14px] leading-6 text-[#6b7280]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            className={adminGhostButtonClass}
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              adminPrimaryButtonClass,
              destructive && "bg-[#dc2626] hover:bg-[#b91c1c]"
            )}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPromptDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  confirmLabel = "Submit",
  pending = false,
  optional = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  label: string;
  placeholder?: string;
  confirmLabel?: string;
  pending?: boolean;
  optional?: boolean;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (open) setValue("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#e5e7eb] bg-white sm:max-w-[500px]">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(value);
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px] text-[#111827]">{title}</DialogTitle>
            <DialogDescription className="text-[14px] leading-6 text-[#6b7280]">
              {description}
            </DialogDescription>
          </DialogHeader>
          <label className="block space-y-2">
            <span className="text-[13px] font-medium text-[#374151]">
              {label}
              {optional ? <span className="font-normal text-[#9ca3af]"> optional</span> : null}
            </span>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className={adminTextareaClass}
              placeholder={placeholder}
              disabled={pending}
              required={!optional}
            />
          </label>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              className={adminGhostButtonClass}
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </button>
            <button type="submit" className={adminPrimaryButtonClass} disabled={pending}>
              {pending ? "Working..." : confirmLabel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function AdminStatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
}) {
  const tones: Record<typeof tone, string> = {
    blue: "bg-[#dbeafe] text-[#1d4ed8]",
    green: "bg-[#d1fae5] text-[#059669]",
    amber: "bg-[#fef3c7] text-[#d97706]",
    red: "bg-[#fee2e2] text-[#dc2626]",
    slate: "bg-[#f3f4f6] text-[#6b7280]",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-medium", tones[tone])}>
      {label}
    </span>
  );
}

export function AdminDataTable({
  columns,
  children,
  footer,
}: {
  columns: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div data-tour="admin-page-table" className={adminSurfaceClass}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#e5e7eb]">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-[13px] font-medium text-[#6b7280]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-[#e5e7eb] px-6 py-4">{footer}</div> : null}
    </div>
  );
}

export function AdminPagination({ label = "Showing 1 to 8 of 24,387 records" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-3 text-[12px] text-[#6b7280] md:flex-row md:items-center md:justify-between">
      <p>{label}</p>
      <div className="flex items-center gap-2">
        {["<", "1", "2", "3", "4", "...", ">"].map((item, index) => (
          <button
            key={item + index}
            type="button"
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#e5e7eb] px-2 text-[12px] font-medium",
              item === "3" ? "border-[#2563eb] bg-[#2563eb] text-white" : "bg-white text-[#6b7280]"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminSidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 text-[12px] font-medium uppercase tracking-[0.18em] text-white/35">
      {children}
    </p>
  );
}

export function AdminNavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-4 py-3 text-[14px] font-medium transition",
        active ? "bg-[#2563eb] text-white" : "text-white/90 hover:bg-white/6"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
            active
              ? "bg-white/20 text-white"
              : badge > 10
                ? "bg-[#f59e0b] text-white"
                : "bg-[#ef4444] text-white"
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminTopNavigation() {
  const links = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Listings", href: "/admin/listings" },
    { label: "Review Queue", href: "/admin/review" },
    { label: "Verification", href: "/admin/verification" },
    { label: "Audit Logs", href: "/admin/audit-logs" },
  ];

  return (
    <div
      data-tour="admin-topnav"
      className="hidden items-center gap-6 text-[12px] text-[#111827] xl:flex"
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="transition hover:text-[#2563eb]">
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function AdminActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-[#2563eb] transition hover:text-[#1d4ed8]"
    >
      {children}
    </Link>
  );
}

export const adminMetricIcons = {
  listings: <SquarePen className="h-5 w-5" />,
  pending: <BadgeCheck className="h-5 w-5" />,
  warning: <FileWarning className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  analytics: <BarChart3 className="h-5 w-5" />,
  inquiries: <MessageSquareText className="h-5 w-5" />,
  payments: <CircleDollarSign className="h-5 w-5" />,
  content: <Newspaper className="h-5 w-5" />,
  cms: <FileText className="h-5 w-5" />,
  roles: <UserCog className="h-5 w-5" />,
  kyc: <ShieldCheck className="h-5 w-5" />,
  cars: <CarFront className="h-5 w-5" />,
};
