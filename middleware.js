import { NextResponse } from "next/server";
import { getLocaleFromHostname } from "@/lib/i18n/translations";

export function middleware(request) {
  const hostname = request.headers.get("host") || "localhost";
  const locale = getLocaleFromHostname(hostname);

  // Clone request headers and add locale
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

export const config = {
  // Run on all routes except static files and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|.*\\..*|api).*)"],
};
