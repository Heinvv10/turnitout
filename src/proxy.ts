import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public API routes that never require authentication
const PUBLIC_API_PATHS = [
  "/api/auth",
  "/api/payfast/notify",
  "/api/billing/webhook",
  "/api/institutional-inquiry",
];

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only enforce auth on /api/ routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public API routes without auth
  if (isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  // Check for valid session token
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    return Response.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
