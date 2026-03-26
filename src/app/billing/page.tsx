"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/store/settings-store";
import {
  Check,
  Zap,
  Crown,
  Users,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: "R0",
    period: "",
    description: "Try it out",
    checks: "2 checks total",
    features: [
      "2 free checks total",
      "Full analysis suite included",
      "See exactly what you get",
      "Then upgrade to continue",
    ],
    icon: Zap,
    highlight: false,
  },
  {
    id: "student_monthly",
    name: "Student",
    price: "R149",
    period: "/month",
    description: "Everything you need",
    checks: "Unlimited checks",
    features: [
      "Unlimited checks",
      "All 9 analysis tabs",
      "AI Writing Coach",
      "Source suggestions (250M+ papers)",
      "Citation formatter",
      "Word template export",
      "PDF export",
      "Outline generator",
      "Guided fix suggestions",
      "Draft progress tracking",
    ],
    icon: Crown,
    highlight: true,
    popular: true,
  },
  {
    id: "student_annual",
    name: "Annual",
    price: "R1,199",
    priceMonthly: "R100",
    period: "/year",
    description: "Best value — save R589",
    checks: "Unlimited checks",
    features: [
      "Everything in Student",
      "Save R589/year (R100/mo effective)",
      "Priority support",
      "Early access to new features",
    ],
    icon: Crown,
    highlight: false,
    savings: "Save 33%",
  },
  {
    id: "study_group",
    name: "Study Group",
    price: "R99",
    period: "/student/month",
    description: "For 5+ students",
    checks: "Unlimited per student",
    features: [
      "Everything in Student",
      "R99/mo per student (min 5)",
      "Shared module library",
      "Group progress dashboard",
    ],
    icon: Users,
    highlight: false,
  },
];

export default function BillingPage() {
  const { studentName } = useSettingsStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"payfast" | "stripe">(
    "payfast",
  );

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      if (paymentMethod === "payfast") {
        const res = await fetch("/api/payfast/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: planId,
            userId: 1, // TODO: get from auth session
            email: "",
            name: studentName,
          }),
        });
        const data = await res.json();
        if (data.url && data.formData) {
          // Create a form and submit to PayFast
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.url;
          Object.entries(data.formData).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
          return;
        }
      } else {
        // Stripe checkout
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planId, userId: 1 }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Invest in Your Academic Success
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            One tool that replaces Grammarly + Scribbr + GPTZero + Quillbot
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Trusted by students at Cornerstone Institute, UCT, Stellenbosch and
            more
          </p>
        </div>

        {/* Payment method selector */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Pay with:</span>
          <Button
            variant={paymentMethod === "payfast" ? "default" : "outline"}
            size="sm"
            onClick={() => setPaymentMethod("payfast")}
            className="gap-1.5"
          >
            <Banknote className="h-3.5 w-3.5" />
            PayFast (EFT, SnapScan, Card)
          </Button>
          <Button
            variant={paymentMethod === "stripe" ? "default" : "outline"}
            size="sm"
            onClick={() => setPaymentMethod("stripe")}
            className="gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Stripe (International Card)
          </Button>
        </div>

        {/* Plans */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col p-6 ${
                plan.highlight
                  ? "border-2 border-primary shadow-lg"
                  : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              {plan.savings && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2"
                >
                  {plan.savings}
                </Badge>
              )}

              <div className="mb-4">
                <plan.icon
                  className={`mb-2 h-8 w-8 ${
                    plan.highlight ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
                {plan.priceMonthly && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ({plan.priceMonthly}/mo effective)
                  </p>
                )}
              </div>

              <Badge variant="secondary" className="mb-4 w-fit">
                {plan.checks}
              </Badge>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              ) : plan.id === "study_group" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    (window.location.href = "mailto:support@turnitout.co.za?subject=Study%20Group%20Plan")
                  }
                >
                  Contact Us
                </Button>
              ) : (
                <Button
                  className={`w-full ${plan.highlight ? "" : "variant-outline"}`}
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {loading === plan.id ? "Processing..." : "Get Started"}
                </Button>
              )}
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Comparison with competitors */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-xl font-bold">
            Why Students Switch to TurnItOut
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Card className="p-4 text-left">
              <p className="font-medium text-red-500 line-through">
                Grammarly Pro
              </p>
              <p className="text-muted-foreground">R200-510/mo</p>
              <p className="text-xs text-muted-foreground">
                Grammar + basic plagiarism only
              </p>
            </Card>
            <Card className="p-4 text-left">
              <p className="font-medium text-green-600">TurnItOut Student</p>
              <p className="text-muted-foreground">R149/mo</p>
              <p className="text-xs text-muted-foreground">
                Grammar + 8 more checks + coach + rubric grading
              </p>
            </Card>
            <Card className="p-4 text-left">
              <p className="font-medium text-red-500 line-through">
                Scribbr
              </p>
              <p className="text-muted-foreground">R340 per paper</p>
              <p className="text-xs text-muted-foreground">
                Single plagiarism check per payment
              </p>
            </Card>
            <Card className="p-4 text-left">
              <p className="font-medium text-green-600">TurnItOut Student</p>
              <p className="text-muted-foreground">R149/mo unlimited</p>
              <p className="text-xs text-muted-foreground">
                Unlimited checks all month, every subject
              </p>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* FAQ */}
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-center text-xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel your subscription at any time. You'll keep access until the end of your billing period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept EFT (instant bank transfer), SnapScan, credit/debit cards via PayFast, and international cards via Stripe.",
              },
              {
                q: "Is this allowed by my university?",
                a: "Yes. TurnItOut is a writing improvement tool, like Grammarly. It helps you check your own work before submission - it never writes content for you.",
              },
              {
                q: "What happens when my 2 free checks run out?",
                a: "You'll need to upgrade to Student or Annual to continue running checks. Your essays and previous results are saved — you won't lose anything.",
              },
              {
                q: "Do you offer student discounts?",
                a: "Our pricing IS the student price. We're already 50-70% cheaper than competitors while offering more features.",
              },
            ].map(({ q, a }, i) => (
              <Card key={i} className="p-4">
                <p className="font-medium">{q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
