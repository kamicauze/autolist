import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { getMyDealerVerification } from "@/lib/data/dealers";
import {
  SellerPageHeader,
  SellerStatusPill,
  SellerSurface,
} from "../seller-dashboard-ui";
import { getDashboardAccountContext } from "@/lib/data/dashboard-account";
import { createClient } from "@/lib/supabase/server";
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
    description: "Add required files and optional supporting documents from your dashboard.",
    icon: UploadCloud,
  },
  {
    title: "Autolist review",
    description: "The operations team checks business details, contact identity, and document quality.",
    icon: FileSearch,
  },
  {
    title: "Verification decision",
    description: "Approved accounts unlock trust signals; rejected accounts can resubmit updates.",
    icon: ClipboardCheck,
  },
];

const SELLER_TIMELINE = [
  {
    title: "Complete seller profile",
    description: "Keep your name, phone, city, and buyer-facing profile details accurate.",
    icon: ClipboardCheck,
  },
  {
    title: "Submit listings for review",
    description: "Each listing still goes through listing-level quality and moderation checks.",
    icon: FileSearch,
  },
  {
    title: "Upgrade to dealer if needed",
    description: "Only dealerships need business documents, contact-person ID, and dealer review.",
    icon: ShieldCheck,
  },
];

function SummaryCard({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
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

  return (
    <div className={`rounded-[24px] border p-5 ${classes[tone]}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#202224]">
          {icon}
        </div>
        <div>
          <h2 className="font-heading text-[24px] font-semibold text-[#202224]">{title}</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#6d6d6d]">{description}</p>
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
  const [accountContext, dealer] = await Promise.all([
    user ? getDashboardAccountContext(supabase, user.id) : null,
    getMyDealerVerification(),
  ]);

  if (accountContext?.kind === "seller" && !dealer) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Account Verification"
          description="Individual sellers do not go through dealership verification."
        />

        <SummaryCard
          icon={<ShieldCheck className="h-5 w-5 text-[#2563eb]" />}
          title="Individual seller account"
          description="This account is set up as an individual seller. Dealership verification only applies when you register a dealer business profile."
          tone="blue"
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <SellerSurface className="p-6">
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Seller trust checks
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#6d6d6d]">
              For individual sellers, trust is handled through your profile details and listing
              review. You should not be asked for company registration documents or dealer
              verification unless you choose to create a dealership account.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/dashboard/profile"
                className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[13px] font-semibold text-white"
              >
                Update seller profile
              </a>
              <a
                href="/dashboard/listings/new"
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#d9d9d9] bg-white px-5 text-[13px] font-semibold text-[#24272c]"
              >
                Add a listing
              </a>
            </div>
          </SellerSurface>

          <SellerSurface className="p-6">
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Review process
            </h2>
            <div className="mt-5 space-y-4">
              {SELLER_TIMELINE.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < SELLER_TIMELINE.length - 1 ? (
                        <div className="my-2 h-8 w-px bg-[#e6e6e6]" />
                      ) : null}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-[14px] font-semibold text-[#202224]">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-5 text-[#747474]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SellerSurface>
        </div>
      </div>
    );
  }

  const statusTone =
    !dealer
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
          icon={<ShieldCheck className="h-5 w-5 text-[#f79009]" />}
          title="No verification request yet"
          description="Create your first dealer verification request to unlock trusted seller status and premium listing tools. The dashboard shows the documents you will need before submission."
          tone="amber"
        />
      ) : dealer.status === "APPROVED" ? (
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5 text-[#2f9e63]" />}
          title="Verification approved"
          description="Your business profile is verified and public trust signals are now active across your seller dashboard."
          tone="green"
        />
      ) : dealer.status === "REJECTED" ? (
        <SummaryCard
          icon={<ShieldAlert className="h-5 w-5 text-[#f04438]" />}
          title="Verification needs attention"
          description={dealer.rejection_reason || "Update your submitted documents and send them again for review."}
          tone="red"
        />
      ) : (
        <SummaryCard
          icon={<Clock3 className="h-5 w-5 text-[#2563eb]" />}
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
                Replace files, save a draft, or send updated documents back to review.
              </p>
            </div>
            <SellerStatusPill label={dealer?.status || "NOT STARTED"} tone={statusTone} />
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
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Dealer</p>
                    <p className="mt-3 text-[15px] font-semibold text-[#202224]">
                      {dealer?.name || "Not created yet"}
                    </p>
                    <p className="mt-1 text-[14px] text-[#707070]">
                      {dealer?.email || "Complete dealer registration to attach business details."}
                    </p>
                    {dealer?.mobile ? (
                      <p className="mt-1 text-[14px] text-[#707070]">{dealer.mobile}</p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Timeline</p>
                <p className="mt-3 text-[14px] text-[#707070]">
                  Submitted: {formatDate(dealer?.submitted_at || dealer?.created_at)}
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
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < TIMELINE.length - 1 ? (
                        <div className="my-2 h-8 w-px bg-[#e6e6e6]" />
                      ) : null}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-[14px] font-semibold text-[#202224]">{item.title}</h3>
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
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Guidelines</h2>
            <div className="mt-5 space-y-3">
              {GUIDELINES.map((guideline) => (
                <div key={guideline} className="flex items-start gap-3 text-[13px] leading-5 text-[#6d6d6d]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f9e63]" />
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
