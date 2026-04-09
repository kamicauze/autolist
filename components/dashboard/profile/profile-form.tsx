"use client";

import * as React from "react";
import { Camera, Link2, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  SellerPageHeader,
  SellerSurface,
  getInitials,
  sellerInputClass,
  sellerLabelClass,
  sellerTextareaClass,
} from "../seller-dashboard-ui";

interface ProfileFormProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const displayName = (user.user_metadata?.full_name as string) || "";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const [form, setForm] = React.useState({
    fullName: displayName,
    email: user.email || "",
    phone: "+254 700 000 111",
    whatsapp: "+254 700 000 111",
    bio: "Verified seller dealing in premium SUVs, executive sedans and clean accident-free imports.",
    city: "Nairobi",
    address: "Karen, Nairobi County",
    website: "https://autolist.co.ke",
    facebook: "facebook.com/autolist",
    twitter: "x.com/autolist",
    instagram: "instagram.com/autolist",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Profile"
        description="Update your public seller profile, business location, social links and account security details."
      />

      <SellerSurface className="p-5 lg:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative">
                  <Avatar
                    src={avatarUrl}
                    alt={form.fullName || "Seller"}
                    size="lg"
                    fallback={getInitials(form.fullName || "Seller")}
                    className="h-24 w-24 bg-[#eef4ff] text-[#2563eb]"
                  />
                  <button className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[28px] font-semibold text-[#202224]">
                    {form.fullName || "Your Name"}
                  </p>
                  <p className="mt-2 text-[14px] text-[#7d7d7d]">{form.email}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">
                      <ShieldCheck className="h-4 w-4" />
                      Verified seller
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#6f6f6f]">
                      <MapPin className="h-4 w-4" />
                      Nairobi, Kenya
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={sellerLabelClass}>Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                  className={sellerInputClass}
                />
              </div>
              <div>
                <label className={sellerLabelClass}>Email Address</label>
                <input value={form.email} disabled className={`${sellerInputClass} bg-[#f6f6f6]`} />
              </div>
              <div>
                <label className={sellerLabelClass}>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className={sellerInputClass}
                />
              </div>
              <div>
                <label className={sellerLabelClass}>Whatsapp Number</label>
                <input
                  value={form.whatsapp}
                  onChange={(event) => update("whatsapp", event.target.value)}
                  className={sellerInputClass}
                />
              </div>
            </div>

            <div>
              <label className={sellerLabelClass}>About Seller</label>
              <textarea
                value={form.bio}
                onChange={(event) => update("bio", event.target.value)}
                className={sellerTextareaClass}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={sellerLabelClass}>City</label>
                <input
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  className={sellerInputClass}
                />
              </div>
              <div>
                <label className={sellerLabelClass}>Street Address</label>
                <input
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  className={sellerInputClass}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#ededed]">
              <div className="flex h-[290px] items-end justify-start bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_32%),linear-gradient(135deg,#f6f6f6,#ece6dc)] p-5">
                <div className="rounded-[18px] bg-white/85 px-4 py-3 backdrop-blur">
                  <p className="text-[13px] font-semibold text-[#202224]">Seller Location</p>
                  <p className="mt-1 text-[12px] text-[#7d7d7d]">
                    Karen, Nairobi County, Kenya
                  </p>
                </div>
              </div>
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
                    Social Links
                  </h2>
                  <p className="text-[13px] text-[#7b7b7b]">Attach public pages used by buyers.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={sellerLabelClass}>Website</label>
                  <input
                    value={form.website}
                    onChange={(event) => update("website", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
                <div>
                  <label className={sellerLabelClass}>Facebook</label>
                  <input
                    value={form.facebook}
                    onChange={(event) => update("facebook", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
                <div>
                  <label className={sellerLabelClass}>Twitter / X</label>
                  <input
                    value={form.twitter}
                    onChange={(event) => update("twitter", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
                <div>
                  <label className={sellerLabelClass}>Instagram</label>
                  <input
                    value={form.instagram}
                    onChange={(event) => update("instagram", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ededed] bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3e4] text-[#f79009]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                    Change Password
                  </h2>
                  <p className="text-[13px] text-[#7b7b7b]">Keep your seller account secure.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={sellerLabelClass}>Current Password</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(event) => update("currentPassword", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
                <div>
                  <label className={sellerLabelClass}>New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(event) => update("newPassword", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
                <div>
                  <label className={sellerLabelClass}>Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => update("confirmPassword", event.target.value)}
                    className={sellerInputClass}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
                <p className="text-[13px] font-semibold text-[#202224]">Password must include:</p>
                <ul className="mt-3 space-y-2 text-[13px] text-[#777]">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One number or special character</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#2563eb] px-6 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]">
            Save Changes
          </button>
        </div>
      </SellerSurface>
    </div>
  );
}
