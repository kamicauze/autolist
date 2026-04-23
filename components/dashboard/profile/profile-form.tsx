import Link from "next/link";
import { Link2, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  SellerPageHeader,
  SellerSurface,
  getInitials,
} from "../seller-dashboard-ui";

interface ProfileFormProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const metadata = user.user_metadata || {};
  const displayName =
    (metadata.full_name as string) || user.email?.split("@")[0] || "Seller";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const profileFields = [
    {
      label: "Display name",
      value: displayName,
      icon: <UserRound className="h-4 w-4" />,
    },
    {
      label: "Email address",
      value: user.email || "Not available",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      label: "Phone",
      value: (metadata.phone as string) || (metadata.phone_number as string) || "Not set",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      label: "Location",
      value:
        (metadata.city as string) ||
        (metadata.location as string) ||
        (metadata.address as string) ||
        "Not set",
      icon: <MapPin className="h-4 w-4" />,
    },
  ];

  const website = (metadata.website as string) || (metadata.business_website as string) || null;

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Profile"
        description="Review the authenticated seller account details currently available in Supabase."
      />

      <SellerSurface className="p-5 lg:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <Avatar
                  src={avatarUrl}
                  alt={displayName}
                  size="lg"
                  fallback={getInitials(displayName)}
                  className="h-24 w-24 bg-[#eef4ff] text-[#2563eb]"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[28px] font-semibold text-[#202224]">
                    {displayName}
                  </p>
                  <p className="mt-2 text-[14px] text-[#7d7d7d]">{user.email || "No email found"}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">
                      <ShieldCheck className="h-4 w-4" />
                      Authenticated seller account
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#6f6f6f]">
                      <MapPin className="h-4 w-4" />
                      {(metadata.city as string) || "Location not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {profileFields.map((field) => (
                <div
                  key={field.label}
                  className="rounded-[20px] border border-[#ededed] bg-white px-4 py-4"
                >
                  <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-[#7b7b7b]">
                    <span className="text-[#2563eb]">{field.icon}</span>
                    {field.label}
                  </div>
                  <p className="mt-3 text-[16px] font-semibold text-[#202224]">{field.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-dashed border-[#d8d8d8] bg-[#faf9f7] px-5 py-5">
              <p className="text-[14px] font-semibold text-[#202224]">Profile editing is not wired yet.</p>
              <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">
                The previous form fields on this page were local-only UI. They have been removed
                until seller profile persistence is implemented against real backend tables.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                    Public Links
                  </h2>
                  <p className="text-[13px] text-[#7b7b7b]">
                    Values shown here only when they already exist in authenticated metadata.
                  </p>
                </div>
              </div>

              <div className="rounded-[18px] border border-[#ededed] bg-white px-4 py-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#7b7b7b]">
                  Website
                </p>
                <p className="mt-3 break-all text-[15px] font-semibold text-[#202224]">
                  {website || "Not set"}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ededed] bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3e4] text-[#f79009]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                    Account Security
                  </h2>
                  <p className="text-[13px] text-[#7b7b7b]">
                    Password management is handled on the dedicated security page.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
                <p className="text-[13px] font-semibold text-[#202224]">Live actions available:</p>
                <div className="mt-3 space-y-3 text-[13px] text-[#777]">
                  <p>Use the verification page to manage seller onboarding requirements.</p>
                  <p>Use the change password page for real Supabase password updates.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/change-password"
                  className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[13px] font-semibold text-white"
                >
                  Open Change Password
                </Link>
                <Link
                  href="/dashboard/verification"
                  className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#dbe3f5] bg-white px-5 text-[13px] font-semibold text-[#2563eb]"
                >
                  Open Verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SellerSurface>
    </div>
  );
}
