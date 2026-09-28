import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Icon3D, Illustration3D } from "@/components/ui/icon-3d";
import type { Icon3DAssetKey } from "@/lib/constants/icon-3d-assets";
import { getMyDealerVerification } from "@/lib/data/dealers";
import {
  SellerPageHeader,
  SellerStatusPill,
  SellerSurface,
} from "../seller-dashboard-ui";
import { getDashboardAccountContext } from "@/lib/data/dashboard-account";
import { getMySellerVerification } from "@/lib/data/seller-verification";
import { createClient } from "@/lib/supabase/server";
import { SellerVerificationPanel } from "./seller-verification-panel";
import { VerificationUploadPanel } from "./verification-upload-panel";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const GUIDELINES = [
  "Use clear, uncropped documents where the business name and registration number are readable.",
  "Upload PDF, JPG, PNG, or WEBP files under 10MB per document.",
  "Keep the contact person photo current because it is used to validate buyer-facing support details.",
];

const TIMELINE = [
  {
    title: "Upload documents",
    description:
      "Add required files and optional supporting documents from your dashboard.",
    icon: UploadCloud,
    asset: "upload-cloud" as const,
  },
  {
    title: "Autolist review",
    description:
      "The operations team checks business details, contact identity, and document quality.",
    icon: FileSearch,
    asset: "file-review" as const,
  },
  {
    title: "Verification decision",
    description:
      "Approved accounts unlock trust signals; rejected accounts can resubmit updates.",
    icon: ClipboardCheck,
    asset: "clipboard-decision" as const,
  },
];

function SummaryCard({
  icon,
  asset,
  title,
  description,
  tone,
}: {
  icon: LucideIcon;
  asset?: Icon3DAssetKey;
  title: string;
  description: string;
  tone: "green" | "red" | "blue" | "amber";
}) {
  const classes = {
    green: "border-[#ccebd7] bg-[#eefaf2]",
    red: "border-[#ffd6d3] bg-[#fff4f3]",
    blue: "border-[#d4e4ff] bg-[#f4f8ff]",
    amber: "border-[#ffe4bf] bg-[#fff8eb]",
  };
  const iconTone = {
    green: "success",
    red: "danger",
    blue: "primary",
    amber: "warning",
  } as const;

  return (
    <div className={`rounded-[24px] border p-5 ${classes[tone]}`}>
      <div className="flex items-start gap-4">
        {asset ? (
          <Illustration3D
            asset={asset}
            fallbackIcon={icon}
            tone={iconTone[tone]}
            className="h-12 w-12"
          />
        ) : (
          <Icon3D icon={icon} size="lg" tone={iconTone[tone]} variant="solid" />
        )}
        <div>
          <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
            {title}
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#6d6d6d]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [accountContext, dealer, sellerVerification] = await Promise.all([
    user ? getDashboardAccountContext(supabase, user.id) : null,
    getMyDealerVerification(),
    getMySellerVerification(),
  ]);

  if (accountContext?.kind === "seller" && !dealer) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Account Verification"
          description="Verify your identity document and phone ownership without exposing either on your public listings."
        />
        <SellerVerificationPanel verification={sellerVerification} />
      </div>
    );
  }

  const statusTone = !dealer
    ? ("amber" as const)
    : dealer.status === "APPROVED"
      ? ("green" as const)
      : dealer.status === "REJECTED"
        ? ("red" as const)
        : ("blue" as const);

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Account Verification"
        description="Upload business documents, track review status, and resubmit updates without leaving the dashboard."
      />

      {!dealer ? (
        <SummaryCard
          icon={ShieldCheck}
          asset="shield-check"
          title="No verification request yet"
          description="Create your first dealer verification request to unlock trusted seller status and premium listing tools. The dashboard shows the documents you will need before submission."
          tone="amber"
        />
      ) : dealer.status === "APPROVED" ? (
        <SummaryCard
          icon={CheckCircle2}
          asset="success-check"
          title="Verification approved"
          description="Your business profile is verified and public trust signals are now active across your seller dashboard."
          tone="green"
        />
      ) : dealer.status === "REJECTED" ? (
        <SummaryCard
          icon={ShieldAlert}
          asset="shield-alert"
          title="Verification needs attention"
          description={
            dealer.rejection_reason ||
            "Update your submitted documents and send them again for review."
          }
          tone="red"
        />
      ) : (
        <SummaryCard
          icon={Clock3}
          asset="clock-pending"
          title="Verification in progress"
          description="Your seller documents are with the review team. We’ll notify you as soon as the verification process is complete."
          tone="blue"
        />
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <SellerSurface className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
                Verification documents
              </h2>
              <p className="mt-1 text-[13px] text-[#7a7a7a]">
                Replace files, save a draft, or send updated documents back to
                review.
              </p>
            </div>
            <SellerStatusPill
              label={dealer?.status || "NOT STARTED"}
              tone={statusTone}
            />
          </div>

          <div className="mt-6">
            <VerificationUploadPanel dealer={dealer} />
          </div>
        </SellerSurface>

        <div className="space-y-6">
          <SellerSurface className="p-6">
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Submission details
            </h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
                <div className="flex items-start gap-4">
                  {dealer?.logo_url ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] border border-[#e6e6e6] bg-white">
                      <Image
                        src={dealer.logo_url}
                        alt={`${dealer.name} logo`}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">
                      Dealer
                    </p>
                    <p className="mt-3 text-[15px] font-semibold text-[#202224]">
                      {dealer?.name || "Not created yet"}
                    </p>
                    <p className="mt-1 text-[14px] text-[#707070]">
                      {dealer?.email ||
                        "Complete dealer registration to attach business details."}
                    </p>
                    {dealer?.mobile ? (
                      <p className="mt-1 text-[14px] text-[#707070]">
                        {dealer.mobile}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">
                  Timeline
                </p>
                <p className="mt-3 text-[14px] text-[#707070]">
                  Submitted:{" "}
                  {formatDate(dealer?.submitted_at || dealer?.created_at)}
                </p>
                <p className="mt-2 text-[14px] text-[#707070]">
                  Reviewed: {formatDate(dealer?.reviewed_at)}
                </p>
              </div>
            </div>

            {dealer?.review_notes ? (
              <div className="mt-4 rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">
                  Review notes
                </p>
                <p className="mt-3 text-[14px] leading-6 text-[#6d6d6d]">
                  {dealer.review_notes}
                </p>
              </div>
            ) : null}
          </SellerSurface>

          <SellerSurface className="p-6">
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Review process
            </h2>
            <div className="mt-5 space-y-4">
              {TIMELINE.map((item, index) => {
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Illustration3D
                        asset={item.asset}
                        fallbackIcon={item.icon}
                        size="md"
                      />
                      {index < TIMELINE.length - 1 ? (
                        <div className="my-2 h-8 w-px bg-[#e6e6e6]" />
                      ) : null}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-[14px] font-semibold text-[#202224]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-5 text-[#747474]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SellerSurface>

          <SellerSurface className="p-6">
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Guidelines
            </h2>
            <div className="mt-5 space-y-3">
              {GUIDELINES.map((guideline) => (
                <div
                  key={guideline}
                  className="flex items-start gap-3 text-[13px] leading-5 text-[#6d6d6d]"
                >
                  <Icon3D
                    icon={CheckCircle2}
                    tone="success"
                    variant="glyph"
                    className="mt-0.5"
                  />
                  <span>{guideline}</span>
                </div>
              ))}
            </div>
          </SellerSurface>
        </div>
      </div>
    </div>
  );
}
