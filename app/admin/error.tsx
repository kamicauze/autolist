"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[20px] border border-[#e5e7eb] bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#94a3b8]">Admin</p>
        <h1 className="mt-3 font-heading text-[32px] font-semibold leading-[1.1] text-[#111827]">
          This admin page could not load.
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#475569]">
          The request failed on the server. You can retry the page or return to the dashboard while the
          route is being checked.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-[12px] bg-[#f8fafc] px-4 py-3 text-[12px] text-[#64748b]">
            Digest: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-[10px] bg-[#2563eb] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            Retry
          </button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-[10px] border border-[#d1d5db] bg-white px-4 py-2.5 text-[13px] font-medium text-[#374151] transition hover:border-[#2563eb] hover:text-[#2563eb]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
