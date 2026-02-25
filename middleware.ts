import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login serbest
  if (pathname.startsWith("/login")) return NextResponse.next();

  const role = req.cookies.get("role")?.value; // "ADMIN" | "CONSULTANT" | undefined

  // Admin sayfaları
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Danışman sayfaları
  if (pathname.startsWith("/consultant")) {
    if (role !== "CONSULTANT") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/consultant/:path*", "/login"],
};