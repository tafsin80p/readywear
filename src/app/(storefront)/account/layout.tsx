"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to home if not logged in (home has the login modal)
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const pathname = usePathname();
  const isRootAccount = pathname === "/account";

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 md:py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar - Visible on mobile ONLY if on root account, always visible on desktop */}
          <aside className={cn(
            "w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24",
            isRootAccount ? "block" : "hidden md:block"
          )}>
            <AccountSidebar />
          </aside>

          {/* Main Content Area - Hidden on mobile if on root account, always visible on desktop */}
          <main className={cn(
            "flex-1 w-full min-w-0",
            isRootAccount ? "hidden md:block" : "block"
          )}>
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
