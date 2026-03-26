import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    const sql = neon(url);

    await sql`
      CREATE TABLE IF NOT EXISTS institutions (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        country TEXT DEFAULT 'ZA',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS shared_outlines (
        id SERIAL PRIMARY KEY,
        institution_id INTEGER REFERENCES institutions(id),
        uploaded_by INTEGER,
        module_code TEXT NOT NULL,
        module_name TEXT,
        lecturer TEXT,
        turnitin_threshold INTEGER DEFAULT 25,
        outline_data JSONB NOT NULL,
        download_count INTEGER DEFAULT 0,
        approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(institution_id, module_code)
      )
    `;

    return NextResponse.json({ success: true, message: "Library tables created" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
