"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardShellProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  steps: readonly WizardStep[];
  activeStep: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerMeta?: React.ReactNode;
  eyebrow?: string;
  className?: string;
  testId?: string;
}

export function WizardShell({
  title,
  description,
  headerAction,
  steps,
  activeStep,
  children,
  footer,
  footerMeta,
  eyebrow = "Seller Workflow",
  className,
  testId,
}: WizardShellProps) {
  const progress = Math.round(((activeStep + 1) / steps.length) * 100);

  return (
    <section
      className={cn("grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start", className)}
      data-testid={testId}
    >
      <aside className="rounded-[28px] border border-[#ededed] bg-white p-6 shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
            {eyebrow}
          </p>
          <h1 className="font-heading text-[34px] font-semibold leading-none text-[#202224]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-[240px] text-[14px] leading-6 text-[#757575]">{description}</p>
          ) : null}
          {headerAction ? <div className="pt-2">{headerAction}</div> : null}
        </div>

        <div className="mt-10 rounded-[24px] border border-[#eaedf3] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[#202224]">
              Step {activeStep + 1} of {steps.length}
            </p>
            <p className="text-[14px] font-semibold text-[#6c7280]">{progress}%</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#dfe8f8]">
            <div
              className="h-full rounded-full bg-[#2563eb] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ol className="mt-9 space-y-1">
          {steps.map((step, index) => {
            const active = index === activeStep;
            const done = index < activeStep;

            return (
              <li key={step.id} className="relative pl-[52px]">
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[20px] top-11 h-[calc(100%-12px)] w-px",
                      done ? "bg-[#2563eb]/30" : "bg-[#e5e7eb]"
                    )}
                  />
                ) : null}

                <div className="absolute left-0 top-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold transition",
                      active
                        ? "bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
                        : done
                          ? "bg-[#e6efff] text-[#2563eb]"
                          : "bg-white text-[#737780] ring-1 ring-[#e7e7e7]"
                    )}
                  >
                    {index + 1}
                  </div>
                </div>

                <div className="pb-8">
                  <p
                    className={cn(
                      "text-[15px] font-semibold",
                      active ? "text-[#202224]" : "text-[#1f2937]"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description ? (
                    <p className="mt-1 max-w-[220px] text-[13px] leading-6 text-[#7a7a7a]">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="rounded-[28px] border border-[#ededed] bg-white shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
        <div className="p-6">{children}</div>

        {footer ? (
          <div className="flex flex-col gap-4 border-t border-[#ededed] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[13px] text-[#7a7a7a]">{footerMeta}</p>
            <div className="flex flex-wrap items-center gap-3">{footer}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
