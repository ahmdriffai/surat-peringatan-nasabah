import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminOnly =
    request.nextUrl.pathname.startsWith("/users") ||
    request.nextUrl.pathname.startsWith("/kejaksaan") ||
    request.nextUrl.pathname.startsWith("/pengaturan-approval");

  if (isAdminOnly && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isApproverOnly = request.nextUrl.pathname.startsWith("/persetujuan");

  if (isApproverOnly && token.role !== "APPROVER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/surat-peringatan/:path*",
    "/persetujuan/:path*",
    "/users/:path*",
    "/kejaksaan/:path*",
    "/pengaturan-approval/:path*",
    "/arsip-surat/:path*",
    "/akun/:path*",
  ],
};
