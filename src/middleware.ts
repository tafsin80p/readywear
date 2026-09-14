import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user tries to access the login page while already authenticated as admin
    if (req.nextUrl.pathname === "/admin/login") {
      if (req.nextauth.token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Let anyone access the login page (we handle redirects in the middleware function above)
        if (pathname === "/admin/login") {
          return true;
        }

        // Only allow admins to access other /admin routes
        return token?.role === "admin";
      },
    },
    // If not authorized, redirect to the admin login page
    pages: {
      signIn: "/admin/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
