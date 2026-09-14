"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="w-8 h-8 animate-spin text-[#F5426A]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 md:py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24">
            <AccountSidebar />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
