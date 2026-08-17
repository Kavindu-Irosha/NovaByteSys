import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/", "/projects", "/reports", "/subscriptions"];
  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isAuthRoute = pathname === "/auth";

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/projects", "/reports", "/subscriptions", "/auth"],
};
