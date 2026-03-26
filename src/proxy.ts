import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is optional for now - the app works without login.
// This proxy is set up to support future auth enforcement.

// Public routes that never require auth
const publicPaths = [
  "/",
  "/preview",
  "/api/auth",
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For now, allow all routes (auth is optional during development).
  // To enforce auth later, uncomment the block below:
  //
  // const token = request.cookies.get("authjs.session-token")?.value
  //   || request.cookies.get("__Secure-authjs.session-token")?.value;
  //
  // if (!token) {
  //   const loginUrl = new URL("/", request.url);
  //   loginUrl.searchParams.set("signin", "true");
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
