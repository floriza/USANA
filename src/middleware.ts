import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_PATHS = ["/admin", "/api/v1/admin"];
const AUTH_PATHS = [
  "/account",
  "/checkout",
  "/api/v1/orders",
  "/api/v1/customer",
];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  // Admin protection
  if (ADMIN_PATHS.some((p) => path.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + path, nextUrl));
    }
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Auth protection
  if (AUTH_PATHS.some((p) => path.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + path, nextUrl));
    }
  }

  // Redirect logged-in users away from auth pages
  if (session?.user && ["/login", "/register"].includes(path)) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
