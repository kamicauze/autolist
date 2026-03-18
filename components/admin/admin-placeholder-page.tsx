import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  nextSteps: string[];
}

export function AdminPlaceholderPage({
  title,
  description,
  nextSteps,
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <Clock3 className="h-3.5 w-3.5" />
          Planned Next
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Implementation Checklist
        </h3>
        <div className="mt-4 space-y-3">
          {nextSteps.map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3">
          <p className="text-sm text-slate-600">
            The shared admin shell is in place. This section is ready for the next feature pass.
          </p>
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-emerald-700"
          >
            Open moderation queue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
