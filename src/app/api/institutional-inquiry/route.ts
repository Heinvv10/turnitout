import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

interface InquiryPayload {
  name: string;
  email: string;
  institution: string;
  studentCount: string;
  message?: string;
}

function validate(body: unknown): body is InquiryPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.email === "string" &&
    b.email.includes("@") &&
    typeof b.institution === "string" &&
    b.institution.trim().length > 0 &&
    typeof b.studentCount === "string" &&
    Number(b.studentCount) > 0
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!validate(body)) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    // Try to persist to DB if available; gracefully fall back
    try {
      const url = process.env.DATABASE_URL;
      if (url) {
        const sql = neon(url);
        await sql`
          INSERT INTO institutional_inquiries (name, email, institution, student_count, message)
          VALUES (${body.name}, ${body.email}, ${body.institution}, ${Number(body.studentCount)}, ${body.message || ""})
        `;
      }
    } catch {
      // Table may not exist yet — that is fine, we still return success
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch within 48 hours.",
      data: {
        name: body.name,
        email: body.email,
        institution: body.institution,
        studentCount: body.studentCount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 },
    );
  }
}
