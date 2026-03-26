import { NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { plan, userId } = (await request.json()) as {
      plan: "student" | "annual";
      userId?: number;
    };

    const planConfig = PLANS[plan];
    if (!planConfig || !("priceId" in planConfig) || !planConfig.priceId) {
      return NextResponse.json(
        { error: `Invalid plan or missing price ID for: ${plan}` },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing/cancel`,
      client_reference_id: userId ? String(userId) : undefined,
      currency: "zar",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Checkout session failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
