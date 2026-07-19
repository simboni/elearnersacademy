import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Edge route protection (defense-in-depth on top of per-page guards).
 * - Any matched route requires a valid session.
 * - /admin requires ADMIN; /instructor requires INSTRUCTOR or ADMIN.
 */
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/instructor") && role !== "INSTRUCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/instructor/:path*", "/admin/:path*", "/learn/:path*"],
};
