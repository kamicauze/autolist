"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    period: "/month",
    features: ["5 Active Listings", "Basic Analytics", "Email Support", "Standard Visibility"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 2999,
    period: "/month",
    popular: true,
    features: ["25 Active Listings", "Advanced Analytics", "Priority Support", "Featured Listings", "Social Media Promotion"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 7999,
    period: "/month",
    features: ["Unlimited Listings", "Full Analytics Suite", "Dedicated Manager", "Top Placement", "API Access", "Custom Branding"],
  },
];

interface Subscription {
  id: string;
  plan: string;
  listing: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
}

const SUBSCRIPTIONS: Subscription[] = [
  { id: "1", plan: "Professional", listing: "2022 Toyota Prado TX", startDate: "Dec 1, 2025", endDate: "Jan 1, 2026", status: "active" },
  { id: "2", plan: "Basic", listing: "2020 Mazda CX-5", startDate: "Nov 15, 2025", endDate: "Dec 15, 2025", status: "active" },
  { id: "3", plan: "Basic", listing: "2019 Nissan X-Trail", startDate: "Oct 1, 2025", endDate: "Nov 1, 2025", status: "expired" },
];

export function MembershipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Membership</h1>
        <p className="text-sm text-muted-foreground">Manage your plans and subscriptions</p>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-xl border bg-white p-6 shadow-sm",
                  plan.popular ? "border-primary" : "border-border"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">KES {plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.popular ? "Get Started" : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <div className="rounded-xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">End Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SUBSCRIPTIONS.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{sub.listing}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{sub.plan}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{sub.startDate}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{sub.endDate}</td>
                      <td className="px-4 py-3">
                        <Badge variant={sub.status === "active" ? "success" : sub.status === "expired" ? "default" : "destructive"}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sub.status === "active" && (
                          <Button size="sm" variant="outline">Manage</Button>
                        )}
                        {sub.status === "expired" && (
                          <Button size="sm">Renew</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
