import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    period: "/month",
    description: "Perfect for individual sellers",
    features: ["5 Active Listings", "Basic Analytics", "Email Support", "Standard Visibility"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 2999,
    period: "/month",
    description: "For growing dealerships",
    popular: true,
    features: ["25 Active Listings", "Advanced Analytics", "Priority Support", "Featured Listings", "Social Media Promotion"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 7999,
    period: "/month",
    description: "For large dealership networks",
    features: ["Unlimited Listings", "Full Analytics Suite", "Dedicated Manager", "Top Placement", "API Access", "Custom Branding"],
  },
];

export function PricingCards() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative rounded-2xl border bg-white p-8 shadow-sm",
            plan.popular ? "border-primary shadow-lg scale-105" : "border-border"
          )}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
          )}
          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-foreground">KES {plan.price.toLocaleString()}</span>
            <span className="text-muted-foreground">{plan.period}</span>
          </div>
          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="mt-8 w-full"
            variant={plan.popular ? "default" : "outline"}
            size="lg"
          >
            Get Started
          </Button>
        </div>
      ))}
    </div>
  );
}
