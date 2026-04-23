"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  LockKeyhole,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { DealerVerificationRecord } from "@/lib/types/dealer";
import type { SellerProfileRecord } from "@/lib/types/profile";
import {
  SellerPageHeader,
  SellerStatusPill,
  SellerSurface,
  getInitials,
  sellerInputClass,
  sellerLabelClass,
  sellerPrimaryButtonClass,
  sellerTextareaClass,
} from "../seller-dashboard-ui";

interface ProfileFormProps {
  user: {
    id?: string | null;
    email?: string | null;
  };
  profile?: SellerProfileRecord | null;
  verification?: DealerVerificationRecord | null;
}

type SellerProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  bio: string;
  city: string;
  address: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

function isValidPhone(value: string) {
  if (!value.trim()) {
    return true;
  }

  return PHONE_REGEX.test(value.replace(/\s+/g, ""));
}

function isValidUrl(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return true;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function verificationTone(
  verification: DealerVerificationRecord | null | undefined
): "amber" | "blue" | "green" | "red" {
  if (!verification) {
    return "amber";
  }

  if (verification.status === "APPROVED") {
    return "green";
  }

  if (verification.status === "REJECTED") {
    return "red";
  }

  return "blue";
}

function verificationLabel(verification: DealerVerificationRecord | null | undefined) {
  return verification?.status ?? "Not submitted";
}

function verificationSummary(
  verification: DealerVerificationRecord | null | undefined
) {
  if (!verification) {
    return {
      icon: <ShieldCheck className="h-5 w-5 text-[#f79009]" />,
      title: "Verification not started",
      description:
        "Submit dealer documents to unlock trusted seller status and keep your buyer-facing profile aligned with your business verification.",
    };
  }

  if (verification.status === "APPROVED") {
    return {
      icon: <CheckCircle2 className="h-5 w-5 text-[#2f9e63]" />,
      title: "Verification approved",
      description:
        "Your seller account is verified. Buyers will see the trust signals tied to your approved dealer profile.",
    };
  }

  if (verification.status === "REJECTED") {
    return {
      icon: <ShieldAlert className="h-5 w-5 text-[#f04438]" />,
      title: "Verification needs updates",
      description:
        verification.rejection_reason ||
        verification.review_notes ||
        "Review the notes from the admin team and resubmit the required documents.",
    };
  }

  return {
    icon: <Clock3 className="h-5 w-5 text-[#2563eb]" />,
    title: "Verification under review",
    description:
      "Your documents are with the Autolist review team. Use the verification page to track progress and open the submitted files.",
  };
}

function accountTypeLabel(
  role: SellerProfileRecord["role"],
  verification: DealerVerificationRecord | null | undefined
) {
  if (role === "dealer" && verification?.status === "APPROVED") {
    return "Verified dealer account";
  }

  if (role === "dealer") {
    return "Dealer account";
  }

  if (role === "seller") {
    return "Seller account";
  }

  if (role === "admin" || role === "support") {
    return "Staff account";
  }

  return "Autolist account";
}

export function ProfileForm({
  user,
  profile = null,
  verification = null,
}: ProfileFormProps) {
  const router = useRouter();
  const avatarUrl = profile?.avatar_url || undefined;
  const accountType = accountTypeLabel(profile?.role ?? null, verification);
  const initialForm: SellerProfileFormState = {
    fullName: profile?.full_name || user.email?.split("@")[0] || "",
    email: user.email || "",
    phone: profile?.phone || "",
    whatsapp: profile?.whatsapp || "",
    bio: profile?.bio || "",
    city: profile?.city || "",
    address: profile?.address || "",
    website: profile?.website || "",
    facebook: profile?.facebook_url || "",
    twitter: profile?.twitter_url || "",
    instagram: profile?.instagram_url || "",
  };

  const [form, setForm] = React.useState<SellerProfileFormState>(initialForm);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const displayName = form.fullName.trim() || "Seller";
  const locationLabel = form.city.trim() || "Location not set";
  const verificationState = verificationSummary(verification);
  const verificationStatusTone = verificationTone(verification);

  const update = <Key extends keyof SellerProfileFormState>(
    key: Key,
    value: SellerProfileFormState[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user.id) {
      setError("You need to be signed in to update your profile.");
      return;
    }

    const normalized = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      bio: form.bio.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      website: form.website.trim(),
      facebook: form.facebook.trim(),
      twitter: form.twitter.trim(),
      instagram: form.instagram.trim(),
    };

    if (!normalized.fullName) {
      setError("Full name is required.");
      return;
    }

    if (!isValidPhone(normalized.phone)) {
      setError("Enter a valid phone number.");
      return;
    }

    if (!isValidPhone(normalized.whatsapp)) {
      setError("Enter a valid WhatsApp number.");
      return;
    }

    const urlFields = [
      { value: normalized.website, label: "Website URL" },
      { value: normalized.facebook, label: "Facebook URL" },
      { value: normalized.twitter, label: "Twitter / X URL" },
      { value: normalized.instagram, label: "Instagram URL" },
    ];

    for (const field of urlFields) {
      if (!isValidUrl(field.value)) {
        setError(`${field.label} must start with http:// or https://.`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: normalized.fullName,
          avatar_url: avatarUrl || null,
          phone: normalized.phone || null,
          whatsapp: normalized.whatsapp || null,
          bio: normalized.bio || null,
          city: normalized.city || null,
          address: normalized.address || null,
          website: normalized.website || null,
          facebook_url: normalized.facebook || null,
          twitter_url: normalized.twitter || null,
          instagram_url: normalized.instagram || null,
        })
        .eq("id", user.id);

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setSuccess("Profile updated successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Profile"
        description="Update your public seller profile, contact details, location, and social links."
      />

      <SellerSurface className="p-5 lg:p-6">
        <form onSubmit={handleSubmit}>
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
                    <p className="mt-2 text-[14px] text-[#7d7d7d]">
                      {form.email || "No email found"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">
                        <ShieldCheck className="h-4 w-4" />
                        {accountType}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#6f6f6f]">
                        <MapPin className="h-4 w-4" />
                        {locationLabel}
                      </span>
                      <SellerStatusPill
                        label={verificationLabel(verification)}
                        tone={verificationStatusTone}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-[18px] border border-[#d1fadf] bg-[#eefaf2] px-4 py-3 text-[14px] text-[#2f9e63]">
                  {success}
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="profile-full-name" className={sellerLabelClass}>
                    Full Name
                  </label>
                  <input
                    id="profile-full-name"
                    value={form.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    className={sellerInputClass}
                    data-testid="profile-full-name"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className={sellerLabelClass}>
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    value={form.email}
                    disabled
                    className={`${sellerInputClass} bg-[#f6f6f6]`}
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className={sellerLabelClass}>
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    className={sellerInputClass}
                    placeholder="+254700000111"
                  />
                </div>
                <div>
                  <label htmlFor="profile-whatsapp" className={sellerLabelClass}>
                    WhatsApp Number
                  </label>
                  <input
                    id="profile-whatsapp"
                    value={form.whatsapp}
                    onChange={(event) => update("whatsapp", event.target.value)}
                    className={sellerInputClass}
                    placeholder="+254700000111"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-bio" className={sellerLabelClass}>
                  About Seller
                </label>
                <textarea
                  id="profile-bio"
                  value={form.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  className={sellerTextareaClass}
                  placeholder="Describe the kind of vehicles you sell and what buyers should know."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="profile-city" className={sellerLabelClass}>
                    City
                  </label>
                  <input
                    id="profile-city"
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className={sellerInputClass}
                    placeholder="Nairobi"
                  />
                </div>
                <div>
                  <label htmlFor="profile-address" className={sellerLabelClass}>
                    Street Address
                  </label>
                  <input
                    id="profile-address"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    className={sellerInputClass}
                    placeholder="Karen, Nairobi County"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-[#ededed]">
                <div className="flex min-h-[220px] items-end justify-start bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_32%),linear-gradient(135deg,#f6f6f6,#ece6dc)] p-5">
                  <div className="rounded-[18px] bg-white/85 px-4 py-3 backdrop-blur">
                    <p className="text-[13px] font-semibold text-[#202224]">
                      Seller Location
                    </p>
                    <p className="mt-1 text-[12px] text-[#7d7d7d]">
                      {[form.address.trim(), form.city.trim(), "Kenya"].filter(Boolean).join(", ") ||
                        "Location not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-[#ededed] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                      {verificationState.icon}
                    </div>
                    <div>
                      <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                        Verification Status
                      </h2>
                      <p className="mt-1 text-[13px] text-[#7b7b7b]">
                        {verificationState.description}
                      </p>
                    </div>
                  </div>
                  <SellerStatusPill
                    label={verificationLabel(verification)}
                    tone={verificationStatusTone}
                  />
                </div>

                <div className="mt-5 rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
                  <p className="text-[14px] font-semibold text-[#202224]">
                    {verificationState.title}
                  </p>
                  <div className="mt-3 space-y-2 text-[13px] text-[#6f6f6f]">
                    <p>Submitted: {formatDate(verification?.submitted_at || verification?.created_at)}</p>
                    <p>Reviewed: {formatDate(verification?.reviewed_at)}</p>
                  </div>
                </div>

                {verification?.review_notes ? (
                  <div className="mt-4 rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a8a8a]">
                      Review notes
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#6f6f6f]">
                      {verification.review_notes}
                    </p>
                  </div>
                ) : null}

                {verification?.documents?.length ? (
                  <div className="mt-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a8a8a]">
                      Submitted documents
                    </p>
                    <div className="mt-3 space-y-2">
                      {verification.documents.slice(0, 3).map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center gap-3 rounded-[16px] border border-[#ededed] bg-[#faf9f7] px-3 py-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2563eb]">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#202224]">
                              {document.display_name}
                            </p>
                            <p className="mt-1 text-[12px] text-[#7d7d7d]">
                              {document.document_type.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {verification.documents.length > 3 ? (
                      <p className="mt-3 text-[12px] text-[#7d7d7d]">
                        {verification.documents.length - 3} more document(s) are available on the
                        verification page.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/verification"
                    className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[13px] font-semibold text-white"
                  >
                    {verification ? "Open Verification" : "Start Verification"}
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                      Social Links
                    </h2>
                    <p className="text-[13px] text-[#7b7b7b]">
                      Attach public pages used by buyers.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="profile-website" className={sellerLabelClass}>
                      Website
                    </label>
                    <input
                      id="profile-website"
                      value={form.website}
                      onChange={(event) => update("website", event.target.value)}
                      className={sellerInputClass}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-facebook" className={sellerLabelClass}>
                      Facebook
                    </label>
                    <input
                      id="profile-facebook"
                      value={form.facebook}
                      onChange={(event) => update("facebook", event.target.value)}
                      className={sellerInputClass}
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-twitter" className={sellerLabelClass}>
                      Twitter / X
                    </label>
                    <input
                      id="profile-twitter"
                      value={form.twitter}
                      onChange={(event) => update("twitter", event.target.value)}
                      className={sellerInputClass}
                      placeholder="https://x.com/your-handle"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-instagram" className={sellerLabelClass}>
                      Instagram
                    </label>
                    <input
                      id="profile-instagram"
                      value={form.instagram}
                      onChange={(event) => update("instagram", event.target.value)}
                      className={sellerInputClass}
                      placeholder="https://instagram.com/your-handle"
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
                      Account Security
                    </h2>
                    <p className="text-[13px] text-[#7b7b7b]">
                      Password management is handled on the dedicated security page.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
                  <p className="text-[13px] font-semibold text-[#202224]">
                    Live actions available:
                  </p>
                  <div className="mt-3 space-y-3 text-[13px] text-[#777]">
                    <p>Use the change password page for real Supabase password updates.</p>
                    <p>Use the verification page to manage seller onboarding requirements.</p>
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

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={sellerPrimaryButtonClass}
              data-testid="profile-save"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </SellerSurface>
    </div>
  );
}
