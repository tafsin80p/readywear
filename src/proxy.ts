import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// In-memory store for Edge environment (per isolate)
const rateLimitMap = new Map<string, { attempts: number, timestamp: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "unknown";

    // 1. Check if IP is currently blocked
    if (ip !== "unknown" && rateLimitMap.has(ip)) {
      const record = rateLimitMap.get(ip)!;
      if (record.attempts >= MAX_ATTEMPTS) {
        if (Date.now() - record.timestamp < BLOCK_DURATION_MS) {
          // Serve blocked page immediately
          return NextResponse.rewrite(new URL("/blocked", req.url));
        } else {
          // Block expired, reset
          rateLimitMap.delete(ip);
        }
      }
    }

    // Helper to record an unauthorized violation
    const recordViolation = () => {
      if (ip === "unknown") return;
      const current = rateLimitMap.get(ip) || { attempts: 0, timestamp: Date.now() };
      
      // Reset attempts if it's been a while (e.g., 5 mins) since the last attempt and they aren't blocked
      if (Date.now() - current.timestamp > 5 * 60 * 1000 && current.attempts < MAX_ATTEMPTS) {
         current.attempts = 0;
      }
      
      current.attempts += 1;
      current.timestamp = Date.now();
      rateLimitMap.set(ip, current);
    };
    
    // If the user tries to access the admin login page while already authenticated as admin
    if (pathname === "/admin/login") {
      if (req.nextauth.token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      // If they are just visiting login, we don't penalize them.
      return NextResponse.next();
    }

    // If user tries to access /admin pages but is not an admin
    if (pathname.startsWith("/admin")) {
      if (req.nextauth.token?.role !== "admin") {
        recordViolation();
        
        // If they just crossed the threshold, immediately rewrite to blocked
        if (ip !== "unknown" && (rateLimitMap.get(ip)?.attempts || 0) >= MAX_ATTEMPTS) {
           return NextResponse.rewrite(new URL("/blocked", req.url));
        }

        // Show Access Denied instead of redirecting to login
        return NextResponse.rewrite(new URL("/access-denied", req.url));
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
