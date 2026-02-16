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
  steps,
  activeStep,
  children,
  footer,
  footerMeta,
  eyebrow = "Guided Workflow",
  className,
  testId,
}: WizardShellProps) {
  const totalSteps = steps.length;
  const safeStep = Math.min(Math.max(activeStep + 1, 1), totalSteps);
  const activeStepTitle = steps[activeStep]?.title ?? "Step";
  const progress = Math.round((safeStep / Math.max(totalSteps, 1)) * 100);

  return (
    <section
      className={cn(
        "grid gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm lg:grid-cols-[280px_1fr]",
        className
      )}
      data-testid={testId}
    >
      <aside className="space-y-5 border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="space-y-2 rounded-xl border border-border bg-gray-5/40 p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground">Step {safeStep} of {totalSteps}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-4">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
              aria-hidden
            />
          </div>
        </div>

        <ol className="space-y-3" aria-label="Wizard steps">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isComplete = index < activeStep;

            return (
              <li key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold",
                      isComplete && "border-primary bg-primary text-white",
                      isActive && "border-primary text-primary",
                      !isActive && !isComplete && "border-gray-4 text-gray-3"
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && <span className="mt-1 h-6 w-px bg-gray-4" />}
                </div>
                <div className="space-y-0.5 pb-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="space-y-6">
        <div className="space-y-2 rounded-xl border border-border bg-white px-4 py-3 text-sm lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{activeStepTitle}</p>
              <p className="text-xs text-muted-foreground">Step {safeStep} of {totalSteps}</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
              aria-hidden
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-gray-5/50 p-5">{children}</div>
        {footer && (
          <div className="sticky bottom-0 z-20 -mx-5 rounded-xl border border-border bg-white/95 px-5 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-muted-foreground">
                {footerMeta ?? `Current step: ${activeStepTitle}`}
              </p>
              <div className="ml-auto flex flex-wrap items-center gap-3">{footer}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
