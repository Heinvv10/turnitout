import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const sql = getDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id
          ? parseInt(session.client_reference_id, 10)
          : null;

        if (userId) {
          // Determine tier from the subscription
          const tier =
            session.amount_total && session.amount_total >= 50000
              ? "annual"
              : "student";

          // Set expiration: 30 days for monthly, 365 for annual
          const daysToAdd = tier === "annual" ? 365 : 30;

          await sql`
            UPDATE students
            SET subscription_tier = ${tier},
                subscription_expires_at = NOW() + INTERVAL '1 day' * ${daysToAdd},
                stripe_customer_id = ${session.customer as string}
            WHERE id = ${userId}
          `;
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer;

        await sql`
          UPDATE students
          SET subscription_tier = 'free',
              subscription_expires_at = NULL
          WHERE stripe_customer_id = ${customerId as string}
        `;
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer;

        await sql`
          UPDATE students
          SET payment_failed = true
          WHERE stripe_customer_id = ${customerId as string}
        `;
        break;
      }
    }
  } catch (dbError: unknown) {
    const message =
      dbError instanceof Error ? dbError.message : "Webhook DB update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
