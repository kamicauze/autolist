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
  stepMeta?: ReadonlyArray<{
    complete?: boolean;
  }>;
  onStepSelect?: (stepIndex: number) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerMeta?: React.ReactNode;
  eyebrow?: string;
  compact?: boolean;
  className?: string;
  testId?: string;
}

export function WizardShell({
  title,
  description,
  headerAction,
  steps,
  activeStep,
  stepMeta,
  onStepSelect,
  children,
  footer,
  footerMeta,
  eyebrow = "Seller Workflow",
  compact = false,
  className,
  testId,
}: WizardShellProps) {
  const progress = Math.round(((activeStep + 1) / steps.length) * 100);

  if (compact) {
    return (
      <section className={cn("space-y-4", className)} data-testid={testId}>
        <div className="rounded-[16px] border border-[#ededed] bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
              <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
                <h1 className="font-heading text-[24px] font-semibold leading-none text-[#202224]">
                  {title}
                </h1>
                <p className="text-[12px] font-semibold text-[#6c7280]">
                  Step {activeStep + 1} of {steps.length} · {progress}%
                </p>
              </div>
              {description ? (
                <p className="mt-1 hidden max-w-2xl text-[13px] leading-5 text-[#757575] md:block">
                  {description}
                </p>
              ) : null}
            </div>
            {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe8f8]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const active = index === activeStep;
              const complete = stepMeta?.[index]?.complete ?? index < activeStep;

              return (
                <li key={step.id} className="group relative shrink-0">
                  <button
                    type="button"
                    disabled={!onStepSelect}
                    onClick={onStepSelect ? () => onStepSelect(index) : undefined}
                    aria-label={step.description ? `${step.title}. ${step.description}` : step.title}
                    className={cn(
                      "flex h-12 min-w-[132px] items-center gap-2 rounded-[10px] border px-3 text-left transition",
                      active
                        ? "border-primary bg-brand-tint text-brand-hover"
                        : complete
                          ? "border-brand-muted-border bg-white text-primary"
                          : "border-[#e7e7e7] bg-white text-[#4b5563]",
                      onStepSelect &&
                        "hover:border-primary hover:bg-brand-soft-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      !onStepSelect && "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                        active
                          ? "bg-primary text-white"
                          : complete
                            ? "bg-brand-tint text-primary"
                            : "bg-[#f3f4f6] text-[#737780]"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 truncate text-[12px] font-semibold">{step.title}</span>
                  </button>

                  {step.description ? (
                    <div className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-30 w-64 translate-y-1 rounded-[10px] border border-brand-muted-border bg-white px-3 py-2 text-[12px] leading-5 text-[#5f6673] opacity-0 shadow-[0_16px_32px_rgba(15,23,42,0.14)] transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {step.description}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-[16px] border border-[#ededed] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <div className="p-4 lg:p-5 [&_input]:!min-h-0 [&_input]:!text-[13px] [&_input:not([type='checkbox'])]:!h-10 [&_select]:!h-10 [&_select]:!text-[13px] [&_textarea]:!min-h-[96px] [&_textarea]:!text-[13px]">
            {children}
          </div>

          {footer ? (
            <div className="flex flex-col gap-3 border-t border-[#ededed] px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
              <p className="text-[12px] text-[#7a7a7a]">{footerMeta}</p>
              <div className="flex flex-wrap items-center gap-2">{footer}</div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start", className)}
      data-testid={testId}
    >
      <aside className="rounded-[28px] border border-[#ededed] bg-white p-6 shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
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
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ol className="mt-9 space-y-1">
          {steps.map((step, index) => {
            const active = index === activeStep;
            const complete = stepMeta?.[index]?.complete ?? index < activeStep;

            return (
              <li key={step.id} className="relative pl-[52px]">
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[20px] top-11 h-[calc(100%-12px)] w-px",
                      complete ? "bg-primary/30" : "bg-[#e5e7eb]"
                    )}
                  />
                ) : null}

                <div className="absolute left-0 top-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold transition",
                      active
                        ? "bg-primary text-white shadow-[0_10px_24px_rgb(var(--primary-rgb)/0.22)]"
                        : complete
                          ? "bg-brand-tint text-primary"
                          : "bg-white text-[#737780] ring-1 ring-[#e7e7e7]"
                    )}
                  >
                    {index + 1}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!onStepSelect}
                  onClick={onStepSelect ? () => onStepSelect(index) : undefined}
                  className={cn(
                    "w-full rounded-[18px] pb-8 text-left transition",
                    !onStepSelect && "cursor-default",
                    onStepSelect &&
                      "hover:bg-brand-soft-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
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
                </button>
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
