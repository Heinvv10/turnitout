import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { strictAuthRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateCheck = strictAuthRateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json(
        { error: "DATABASE_URL not set" },
        { status: 500 },
      );
    }

    const sql = neon(url);

    await sql`
      CREATE TABLE IF NOT EXISTS auth_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        student_number TEXT,
        university TEXT,
        country TEXT DEFAULT 'ZA',
        subscription_tier TEXT DEFAULT 'free',
        subscription_expires_at TIMESTAMPTZ,
        checks_used_this_month INTEGER DEFAULT 0,
        checks_reset_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    return NextResponse.json({ success: true, message: "auth_users table created" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
