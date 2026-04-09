"use client";

import * as React from "react";
import { BadgeCheck, CalendarRange, ListChecks, WalletCards } from "lucide-react";
import {
  SellerPageHeader,
  SellerStatCard,
  SellerTabs,
  membershipPlans,
} from "../seller-dashboard-ui";

const membershipStats = [
  {
    label: "Available listing",
    value: "12",
    icon: <BadgeCheck className="h-5 w-5 text-[#2563eb]" />,
    accentClass: "bg-[#eef4ff]",
  },
  {
    label: "Used listing",
    value: "08",
    icon: <ListChecks className="h-5 w-5 text-[#2f9e63]" />,
    accentClass: "bg-[#eaf7ef]",
  },
  {
    label: "Payment due",
    value: "03",
    icon: <CalendarRange className="h-5 w-5 text-[#f79009]" />,
    accentClass: "bg-[#fff3e4]",
  },
  {
    label: "Billing cycle",
    value: "Monthly",
    icon: <WalletCards className="h-5 w-5 text-[#f04438]" />,
    accentClass: "bg-[#fff0ef]",
  },
];

const paymentHistory = [
  {
    id: "1",
    title: "Professional Plan",
    amount: "KES 45,000",
    detail: "Paid on 01 Jan, 2025 via card",
  },
  {
    id: "2",
    title: "Featured Boost",
    amount: "KES 15,000",
    detail: "Paid on 12 Dec, 2024 via M-Pesa",
  },
  {
    id: "3",
    title: "Basic Plan",
    amount: "KES 15,000",
    detail: "Paid on 01 Nov, 2024 via bank transfer",
  },
];

export function MembershipPage() {
  const [tab, setTab] = React.useState("packages");

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Membership"
        description="Choose the package that fits your listing volume, compare coverage, and review recent billing activity."
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {membershipStats.map((item) => (
          <SellerStatCard key={item.label} {...item} />
        ))}
      </div>

      <section className="rounded-[28px] border border-[#ededed] bg-white shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-[#ededed] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Membership Package</h2>
            <p className="mt-1 text-[13px] text-[#7a7a7a]">
              Select a plan for your seller account or review prior package payments.
            </p>
          </div>
          <SellerTabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "packages", label: "Membership package" },
              { value: "history", label: "Payment history" },
            ]}
          />
        </div>

        {tab === "packages" ? (
          <div className="grid gap-5 p-6 xl:grid-cols-3">
            {membershipPlans.map((plan, index) => {
              const featured = index === 1;

              return (
                <article
                  key={plan.id}
                  className={[
                    "rounded-[26px] border p-6 transition",
                    featured
                      ? "border-[#2563eb] bg-[#eef4ff] shadow-[0_18px_36px_rgba(37,99,235,0.12)]"
                      : "border-[#ededed] bg-white",
                  ].join(" ")}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                    {featured ? "Recommended" : "Seller package"}
                  </p>
                  <h3 className="mt-4 font-heading text-[28px] font-semibold text-[#202224]">
                    {plan.name}
                  </h3>
                  <p className="mt-4 font-heading text-[34px] font-semibold text-[#202224]">
                    {plan.price}
                    <span className="ml-1 text-[15px] font-medium text-[#7d7d7d]">{plan.period}</span>
                  </p>

                  <ul className="mt-6 space-y-3 text-[14px] leading-6 text-[#666]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={[
                      "mt-8 inline-flex h-12 w-full items-center justify-center rounded-[14px] text-[14px] font-semibold transition",
                      featured
                        ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                        : "border border-[#d9d9d9] bg-white text-[#202224] hover:border-[#2563eb] hover:text-[#2563eb]",
                    ].join(" ")}
                  >
                    Choose Plan
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {paymentHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-[22px] border border-[#ededed] bg-[#faf9f7] p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-[16px] font-semibold text-[#202224]">{item.title}</p>
                  <p className="mt-1 text-[13px] text-[#7a7a7a]">{item.detail}</p>
                </div>
                <p className="font-heading text-[24px] font-semibold text-[#202224]">{item.amount}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
