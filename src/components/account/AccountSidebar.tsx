"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, User as UserIcon, LogOut, ChevronRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createPortal } from "react-dom";

const navItems = [
  {
    title: "Overview",
    href: "/account/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Order History",
    href: "/account/orders",
    icon: Package,
  },
  {
    title: "Profile Settings",
    href: "/account/profile",
    icon: UserIcon,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <div className="bg-transparent md:bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm overflow-hidden md:p-4">
      
      {/* Mobile App-like Profile Header (Visible only on mobile) */}
      <div className="md:hidden flex items-center gap-4 p-6 bg-white rounded-2xl mb-4 border border-gray-100 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden shrink-0">
          {session?.user?.image ? (
            <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <UserIcon className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">{session?.user?.name || "Customer"}</h2>
          <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 bg-white md:bg-transparent rounded-2xl md:rounded-none p-4 md:p-0 border md:border-none border-gray-100 shadow-sm md:shadow-none">
        {navItems.map((item) => {
          // In mobile, we might be on /account (menu view), so isActive won't match. But on desktop it will.
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              suppressHydrationWarning
              className={cn(
                "flex items-center justify-between px-4 py-3.5 md:py-3 rounded-xl font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3 md:gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                <span className="text-base md:text-base">{item.title}</span>
              </div>
              <ChevronRight className={cn("w-5 h-5 md:hidden", isActive ? "text-white/70" : "text-gray-300")} />
            </Link>
          );
        })}

        <div className="hidden md:block h-px bg-gray-100 my-2 mx-4" />

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="flex items-center justify-between px-4 py-3.5 md:py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span className="text-base">Logout</span>
          </div>
          <ChevronRight className="w-5 h-5 md:hidden text-red-300" />
        </button>
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Yes, Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
