
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Foundational",
    price: "Free Forever",
    description: "For individuals and small teams getting started with AI.",
    features: [
      "1 user account",
      "Up to 2 projects per month",
      "Connect to 1 data source",
      "Basic analysis & standard reports",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: "$499 - $799 / mo",
    description: "For growing teams that need regular, more powerful analysis.",
    features: [
      "Up to 5 user accounts",
      "Up to 10 projects per month",
      "Up to 5 data sources",
      "Multi-source analysis & scenario modeling",
      "1 hr/mo On-Demand Data Structuring",
    ],
    cta: "Choose Growth",
    popular: true,
  },
  {
    name: "Strategic",
    price: "$1,999 - $4,999 / mo",
    description: "For large departments with a high demand for constant AI analysis.",
    features: [
      "Up to 25 user accounts",
      "Unlimited analysis projects",
      "Unlimited data sources & real-time API feeds",
      "Custom report dashboards & historical analysis",
      "2 hrs/mo AI-Driven Content Strategy",
      "Quarterly Strategic Data Audits",
    ],
    cta: "Choose Strategic",
  },
  {
    name: "Enterprise",
    price: "Custom Quote",
    description: "For major corporations that need a fully customized, white-glove solution.",
    features: [
        "Unlimited user accounts",
        "Unlimited & priority processing",
        "Full custom API & legacy system integration",
        "Dedicated AI Strategist",
        "White-Labeling",
        "On-Site Training and support"
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold font-heading">Find the right plan for your team</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          From solo-preneurs to enterprise teams, Pollitago's tiered plans are designed to scale with your strategic needs.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "flex flex-col relative",
              tier.popular ? "border-primary shadow-2xl shadow-primary/20" : ""
            )}
          >
            {tier.popular && (
              <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                 <div className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-full">
                    Most Popular
                 </div>
              </div>
            )}
            <CardHeader className="pt-10">
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-3xl font-bold font-heading">{tier.price}</p>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <p className="font-semibold text-sm">Features Included:</p>
                <ul className="space-y-3">
                    {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.popular ? 'default' : 'secondary'}>
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
