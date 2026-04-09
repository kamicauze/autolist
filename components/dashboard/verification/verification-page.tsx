import Link from "next/link";
import { CheckCircle2, Clock3, FileText, ShieldAlert, ShieldCheck } from "lucide-react";
import { getMyDealerVerification } from "@/lib/data/dealers";
import { getImageUrl } from "@/lib/utils/listings";
import {
  SellerPageHeader,
  SellerStatusPill,
  SellerSurface,
} from "../seller-dashboard-ui";

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
  const dealer = await getMyDealerVerification();

  if (!dealer) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Account Verification"
          description="Submit business and compliance documents so buyers can trust your seller profile and the dashboard can unlock dealer features."
        />

        <SummaryCard
          icon={<ShieldCheck className="h-5 w-5 text-[#f79009]" />}
          title="No verification request yet"
          description="Create your first dealer verification request to unlock trusted seller status and premium listing tools."
          tone="amber"
        />

        <SellerSurface className="p-6">
          <Link
            href="/register/dealer"
            className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            Start verification
          </Link>
        </SellerSurface>
      </div>
    );
  }

  const statusTone =
    dealer.status === "APPROVED"
      ? ("green" as const)
      : dealer.status === "REJECTED"
        ? ("red" as const)
        : ("blue" as const);

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Account Verification"
        description="Track the status of your submitted business documents and review notes from the Autolist admin team."
      />

      {dealer.status === "APPROVED" ? (
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
                Submission details
              </h2>
              <p className="mt-1 text-[13px] text-[#7a7a7a]">
                Overview of the business information tied to this verification request.
              </p>
            </div>
            <SellerStatusPill label={dealer.status} tone={statusTone} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Dealer</p>
              <p className="mt-3 text-[15px] font-semibold text-[#202224]">{dealer.name}</p>
              <p className="mt-1 text-[14px] text-[#707070]">{dealer.email}</p>
              <p className="mt-1 text-[14px] text-[#707070]">{dealer.mobile}</p>
            </div>
            <div className="rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Timeline</p>
              <p className="mt-3 text-[14px] text-[#707070]">
                Submitted: {formatDate(dealer.submitted_at || dealer.created_at)}
              </p>
              <p className="mt-2 text-[14px] text-[#707070]">Reviewed: {formatDate(dealer.reviewed_at)}</p>
            </div>
          </div>

          {dealer.review_notes ? (
            <div className="mt-4 rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Review notes</p>
              <p className="mt-3 text-[14px] leading-6 text-[#6d6d6d]">{dealer.review_notes}</p>
            </div>
          ) : null}

          {dealer.status === "REJECTED" ? (
            <div className="mt-6">
              <Link
                href="/register/dealer"
                className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Update and resubmit
              </Link>
            </div>
          ) : null}
        </SellerSurface>

        <SellerSurface className="p-6">
          <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Submitted documents</h2>
          <p className="mt-1 text-[13px] text-[#7a7a7a]">
            Files used to validate the seller business account.
          </p>

          <div className="mt-6 space-y-3">
            {dealer.documents.map((document) => (
              <a
                key={document.id}
                href={getImageUrl(document.r2_key)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[18px] border border-[#ededed] bg-[#faf9f7] px-4 py-4 transition hover:border-[#2563eb]/20 hover:bg-[#f7fbff]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2563eb]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#202224]">{document.display_name}</p>
                    <p className="mt-1 text-[12px] text-[#7d7d7d]">
                      {document.document_type.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#2563eb]">Open</span>
              </a>
            ))}
          </div>
        </SellerSurface>
      </div>
    </div>
  );
}
