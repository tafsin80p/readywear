import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // If the user tries to access the admin login page while already authenticated as admin
    if (pathname === "/admin/login") {
      if (req.nextauth.token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // If user tries to access /admin pages but is not an admin
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      if (req.nextauth.token?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // If user tries to access /account pages but is not logged in
    if (pathname.startsWith("/account")) {
      if (!req.nextauth.token) {
        // Redirect to home page where the login modal will hopefully be triggered, or just home
        return NextResponse.redirect(new URL("/?login=true", req.url));
      }
    }
  },
  {
    callbacks: {
      // Let the middleware function handle the auth logic completely
      authorized: () => true,
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
