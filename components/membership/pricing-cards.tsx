import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SELLER_PACKAGE_PLANS } from "@/lib/data/membership";
import { cn } from "@/lib/utils";

const PLAN_DESCRIPTIONS = {
  basic: "For independent and smaller dealerships",
  professional: "For growing dealerships with larger inventory",
  enterprise: "For large yards, groups, and franchises",
} as const;

export function PricingCards() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {SELLER_PACKAGE_PLANS.map((plan) => {
        const popular = plan.id === "professional";

        return (
          <div
            key={plan.id}
            className={cn(
              "relative rounded-2xl border bg-white p-8 shadow-sm",
              popular ? "border-primary shadow-lg md:scale-105" : "border-border"
            )}
          >
            {popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {PLAN_DESCRIPTIONS[plan.id]}
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">{plan.priceLabel}</span>
              <span className="text-muted-foreground">{plan.periodLabel}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 w-full"
              variant={popular ? "default" : "outline"}
              size="lg"
              asChild
            >
              <Link href="/sell/dealer">Apply as a dealer</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
