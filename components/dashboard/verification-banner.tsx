import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { getMyDealerVerification } from "@/lib/data/dealers";
import { SellerSurface } from "./seller-dashboard-ui";

export async function VerificationBanner() {
  const dealer = await getMyDealerVerification();

  if (!dealer) {
    return (
      <SellerSurface className="overflow-hidden border-[#ffd3d0] bg-[#fff1f0]">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffdbd8] text-[#f04438]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                Verify your account!
              </h2>
              <p className="max-w-2xl text-[14px] leading-6 text-[#6d6d6d]">
                Complete dealership verification to unlock premium visibility, trust signals, and
                faster listing approvals on the seller dashboard.
              </p>
            </div>
          </div>

          <Link
            href="/register/dealer"
            className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#f04438] px-5 text-[14px] font-semibold text-white transition hover:bg-[#d92d20]"
          >
            Verify
          </Link>
        </div>
      </SellerSurface>
    );
  }

  if (dealer.status === "APPROVED") {
    return (
      <SellerSurface className="border-[#ccebd7] bg-[#eefaf2]">
        <div className="flex items-start gap-4 p-5 lg:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f4e2] text-[#2f9e63]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
              Your dealer account is verified
            </h2>
            <p className="text-[14px] leading-6 text-[#5c7467]">
              Your seller profile now displays the verified badge and listings can be published
              without additional trust prompts.
            </p>
          </div>
        </div>
      </SellerSurface>
    );
  }

  if (dealer.status === "REJECTED") {
    return (
      <SellerSurface className="border-[#ffd3d0] bg-[#fff4f3]">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffdfdc] text-[#f04438]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                Verification needs updates
              </h2>
              <p className="max-w-2xl text-[14px] leading-6 text-[#6d6d6d]">
                {dealer.rejection_reason || "Update your documents and submit the application again."}
              </p>
            </div>
          </div>
          <Link
            href="/register/dealer"
            className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#f04438]/20 bg-white px-5 text-[14px] font-semibold text-[#f04438] transition hover:bg-[#fff7f6]"
          >
            Resubmit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SellerSurface>
    );
  }

  return (
    <SellerSurface className="border-[#d4e4ff] bg-[#f4f8ff]">
      <div className="flex items-start gap-4 p-5 lg:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2edff] text-[#2563eb]">
          <Clock3 className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
            Verification in review
          </h2>
          <p className="text-[14px] leading-6 text-[#5c6980]">
            Submitted on{" "}
            {new Date(dealer.submitted_at || dealer.created_at).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            . The admin team will notify you once the seller account review is complete.
          </p>
        </div>
      </div>
    </SellerSurface>
  );
}
