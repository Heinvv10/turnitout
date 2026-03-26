import crypto from "crypto";

/**
 * PayFast integration for South African payments.
 * Supports: instant EFT, SnapScan, credit/debit cards, Mobicred.
 *
 * Docs: https://developers.payfast.co.za/docs
 */

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "10000100"; // sandbox
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a"; // sandbox
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || ""; // optional, recommended for production
const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX !== "false"; // default to sandbox

const PAYFAST_URL = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

const PAYFAST_VALIDATE_URL = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/query/validate"
  : "https://www.payfast.co.za/eng/query/validate";

export const PLANS = {
  free: {
    name: "Free Trial",
    price: 0,
    checksTotal: 2, // 2 checks TOTAL, not per month
    features: [
      "2 free checks total",
      "Full analysis suite",
      "See what TurnItOut can do",
      "Then upgrade to continue",
    ],
  },
  student_monthly: {
    name: "Student Monthly",
    price: 149, // ZAR
    checksPerMonth: -1, // unlimited
    features: [
      "Unlimited checks",
      "All 9 analysis tabs",
      "AI Writing Coach",
      "Source suggestions",
      "Citation formatter",
      "Word template export",
      "PDF export",
      "Outline generator",
      "Priority processing",
    ],
  },
  student_annual: {
    name: "Student Annual",
    price: 1199, // ZAR per year (R100/mo effective)
    priceMonthly: 100, // effective monthly
    checksPerMonth: -1,
    features: [
      "Everything in Student Monthly",
      "Save R589/year",
      "Priority support",
      "Early access to new features",
    ],
  },
  study_group: {
    name: "Study Group",
    pricePerStudent: 99, // ZAR per student per month
    minStudents: 5,
    checksPerMonth: -1,
    features: [
      "Everything in Student Monthly",
      "R99/mo per student (min 5)",
      "Shared module library",
      "Group progress dashboard",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

/**
 * Generate PayFast payment form data for a subscription.
 */
export function generatePayFastPayment(params: {
  plan: "student_monthly" | "student_annual";
  userId: number;
  email: string;
  name: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string; // ITN callback URL
}): { url: string; formData: Record<string, string> } {
  const plan = PLANS[params.plan];
  const isAnnual = params.plan === "student_annual";
  const amount = isAnnual ? plan.price : (plan as typeof PLANS.student_monthly).price;

  const nameParts = params.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const data: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: firstName,
    name_last: lastName,
    email_address: params.email,
    m_payment_id: `${params.userId}-${params.plan}-${Date.now()}`,
    amount: amount.toFixed(2),
    item_name: `TurnItOut ${plan.name}`,
    item_description: isAnnual
      ? "Annual subscription - unlimited academic checks"
      : "Monthly subscription - unlimited academic checks",
    custom_str1: String(params.userId),
    custom_str2: params.plan,
  };

  // For monthly recurring subscription
  if (!isAnnual) {
    data.subscription_type = "1"; // subscription
    data.billing_date = new Date().toISOString().split("T")[0]; // today
    data.recurring_amount = amount.toFixed(2);
    data.frequency = "3"; // monthly
    data.cycles = "0"; // indefinite
  }

  // Generate signature
  const signature = generateSignature(data);
  data.signature = signature;

  return { url: PAYFAST_URL, formData: data };
}

/**
 * Validate a PayFast ITN (Instant Transaction Notification).
 */
export async function validateITN(body: Record<string, string>): Promise<boolean> {
  // Step 1: Verify signature
  const receivedSignature = body.signature;
  const dataWithoutSignature = { ...body };
  delete dataWithoutSignature.signature;

  const expectedSignature = generateSignature(dataWithoutSignature);
  if (receivedSignature !== expectedSignature) {
    console.error("PayFast ITN: Signature mismatch");
    return false;
  }

  // Step 2: Verify with PayFast server
  try {
    const params = new URLSearchParams(dataWithoutSignature);
    const response = await fetch(PAYFAST_VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const result = await response.text();
    return result.trim() === "VALID";
  } catch {
    console.error("PayFast ITN: Validation request failed");
    return false;
  }
}

/**
 * Generate PayFast MD5 signature.
 */
function generateSignature(data: Record<string, string>): string {
  // Sort by key and create parameter string
  const paramString = Object.keys(data)
    .sort()
    .filter((key) => data[key] !== "" && key !== "signature")
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  // Add passphrase if set
  const stringToHash = PAYFAST_PASSPHRASE
    ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
    : paramString;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}
