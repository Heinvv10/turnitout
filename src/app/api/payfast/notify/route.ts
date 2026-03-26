import { NextResponse } from "next/server";
import { validateITN } from "@/lib/payfast";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

/**
 * PayFast ITN (Instant Transaction Notification) handler.
 * PayFast sends POST notifications for payment events.
 */
export async function POST(request: Request) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const body: Record<string, string> = {};
    params.forEach((value, key) => {
      body[key] = value;
    });

    // Validate the ITN
    const isValid = await validateITN(body);
    if (!isValid) {
      console.error("PayFast ITN validation failed");
      return NextResponse.json({ error: "Invalid ITN" }, { status: 400 });
    }

    const paymentStatus = body.payment_status;
    const userId = parseInt(body.custom_str1 || "0");
    const plan = body.custom_str2 || "";
    const paymentId = body.m_payment_id || "";

    const sql = getDb();

    if (paymentStatus === "COMPLETE" && userId > 0) {
      // Calculate expiry
      const isAnnual = plan === "student_annual";
      const expiresAt = new Date();
      if (isAnnual) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const tier = isAnnual ? "annual" : "student";

      // Update user subscription
      await sql`
        UPDATE auth_users
        SET subscription_tier = ${tier},
            subscription_expires_at = ${expiresAt.toISOString()},
            checks_used_this_month = 0,
            updated_at = NOW()
        WHERE id = ${userId}
      `;

      console.log(
        `PayFast: User ${userId} subscribed to ${tier} (payment: ${paymentId})`,
      );
    } else if (paymentStatus === "CANCELLED" && userId > 0) {
      // Downgrade to free
      await sql`
        UPDATE auth_users
        SET subscription_tier = 'free',
            subscription_expires_at = NULL,
            updated_at = NOW()
        WHERE id = ${userId}
      `;

      console.log(`PayFast: User ${userId} subscription cancelled`);
    }

    // PayFast expects a 200 response
    return new NextResponse("OK", { status: 200 });
  } catch (error: unknown) {
    console.error("PayFast ITN error:", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}
