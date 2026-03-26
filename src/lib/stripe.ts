import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    checksPerMonth: 5,
    features: ["Basic readability", "Grammar check", "5 checks/month"],
  },
  student: {
    name: "Student",
    priceMonthly: 79, // ZAR
    priceId: process.env.STRIPE_STUDENT_MONTHLY_PRICE_ID || "",
    checksPerMonth: -1, // unlimited
    features: [
      "Unlimited checks",
      "All analysis tabs",
      "Source suggestions",
      "Writing coach",
      "Export .docx/.pdf",
    ],
  },
  annual: {
    name: "Annual",
    priceYearly: 599, // ZAR
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || "",
    checksPerMonth: -1,
    features: [
      "Everything in Student",
      "Save R349/year",
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
