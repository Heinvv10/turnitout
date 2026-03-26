import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
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
