import { NextResponse } from "next/server";
import { generatePayFastPayment } from "@/lib/payfast";

export async function POST(request: Request) {
  try {
    const { plan, userId, email, name } = await request.json();

    if (!plan || !["student_monthly", "student_annual"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose student_monthly or student_annual." },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3456";

    const { url, formData } = generatePayFastPayment({
      plan,
      userId: userId || 0,
      email: email || "",
      name: name || "",
      returnUrl: `${baseUrl}/billing/success`,
      cancelUrl: `${baseUrl}/billing/cancel`,
      notifyUrl: `${baseUrl}/api/payfast/notify`,
    });

    return NextResponse.json({ url, formData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("PayFast checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
