import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const handleI18n = createMiddleware(routing);

const VALID_LOCALES = ["en", "fa"];

const PROTECTED = [
  "/dashboard", "/playground", "/prompts",
  "/tasks", "/workflows", "/analytics", "/settings",
];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Let NextAuth's own API routes through unmodified
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Resolve locale and path-after-locale
  const segments = pathname.split("/").filter(Boolean);
  const locale = VALID_LOCALES.includes(segments[0]) ? segments[0] : "en";
  const pathAfterLocale = "/" + (VALID_LOCALES.includes(segments[0]) ? segments.slice(1) : segments).join("/");

  const isAuthenticated = !!req.auth;
  const isAuthRoute = pathAfterLocale.startsWith("/auth");
  const isProtected = PROTECTED.some(
    (p) => pathAfterLocale === p || pathAfterLocale.startsWith(p + "/")
  );

  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, req.url));
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return handleI18n(req as NextRequest);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
