"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PLANS } from "@/lib/stripe";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  Loader2,
  ExternalLink,
} from "lucide-react";

type PaidPlan = "student" | "annual";

export default function BillingPage() {
  const [loading, setLoading] = useState<PaidPlan | null>(null);
  const [currentPlan] = useState<string>("free");

  async function handleUpgrade(plan: PaidPlan) {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto w-full max-w-5xl flex-1 p-6">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Choose Your Plan
          </h2>
          <p className="mt-2 text-muted-foreground">
            Get the most out of TurnItOut with unlimited checks and advanced
            features
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <Card
            className={`relative flex flex-col ${currentPlan === "free" ? "ring-2 ring-primary" : ""}`}
          >
            {currentPlan === "free" && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                Current Plan
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{PLANS.free.name}</CardTitle>
              </div>
              <CardDescription>Get started with basic checks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">R0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator className="mb-4" />
              <ul className="space-y-2.5">
                {PLANS.free.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                disabled={currentPlan === "free"}
              >
                {currentPlan === "free" ? "Active" : "Downgrade"}
              </Button>
            </CardFooter>
          </Card>

          {/* Student Plan */}
          <Card
            className={`relative flex flex-col border-primary/50 shadow-lg ${currentPlan === "student" ? "ring-2 ring-primary" : ""}`}
          >
            <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {currentPlan === "student" ? "Current Plan" : "Most Popular"}
            </Badge>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <CardTitle>{PLANS.student.name}</CardTitle>
              </div>
              <CardDescription>
                Everything you need to ace your papers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  R{PLANS.student.priceMonthly}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator className="mb-4" />
              <ul className="space-y-2.5">
                {PLANS.student.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                disabled={currentPlan === "student" || loading === "student"}
                onClick={() => handleUpgrade("student")}
              >
                {loading === "student" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {currentPlan === "student" ? "Active" : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>

          {/* Annual Plan */}
          <Card
            className={`relative flex flex-col ${currentPlan === "annual" ? "ring-2 ring-primary" : ""}`}
          >
            {currentPlan === "annual" && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                Current Plan
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="absolute -top-2.5 right-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              Save R349/yr
            </Badge>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <CardTitle>{PLANS.annual.name}</CardTitle>
              </div>
              <CardDescription>Best value for serious students</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-1">
                <span className="text-3xl font-bold">
                  R{PLANS.annual.priceYearly}
                </span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Only R{Math.round(PLANS.annual.priceYearly / 12)}/month
              </p>
              <Separator className="mb-4" />
              <ul className="space-y-2.5">
                {PLANS.annual.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                disabled={currentPlan === "annual" || loading === "annual"}
                onClick={() => handleUpgrade("annual")}
              >
                {loading === "annual" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {currentPlan === "annual" ? "Active" : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-12">
          <h3 className="mb-4 text-center text-lg font-semibold">
            Feature Comparison
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">
                        Feature
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Free
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Student
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Annual
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: "Readability analysis",
                        free: true,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Grammar check",
                        free: true,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Monthly checks",
                        free: "5",
                        student: "Unlimited",
                        annual: "Unlimited",
                      },
                      {
                        feature: "AI risk analysis",
                        free: false,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Citation compliance",
                        free: false,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Source suggestions",
                        free: false,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Writing coach",
                        free: false,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Export .docx / .pdf",
                        free: false,
                        student: true,
                        annual: true,
                      },
                      {
                        feature: "Priority support",
                        free: false,
                        student: false,
                        annual: true,
                      },
                    ].map((row) => (
                      <tr key={row.feature} className="border-b last:border-0">
                        <td className="px-4 py-2.5">{row.feature}</td>
                        <td className="px-4 py-2.5 text-center">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span>{row.free}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {typeof row.student === "boolean" ? (
                            row.student ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className="font-medium">{row.student}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {typeof row.annual === "boolean" ? (
                            row.annual ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className="font-medium">{row.annual}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manage Subscription */}
        {currentPlan !== "free" && (
          <div className="mt-8 text-center">
            <a
                href="https://billing.stripe.com/p/login/placeholder"
                className="text-sm text-muted-foreground hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Manage Subscription
              </a>
          </div>
        )}
      </div>
    </div>
  );
}
