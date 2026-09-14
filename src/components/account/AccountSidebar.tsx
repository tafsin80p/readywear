"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Overview",
    href: "/account",
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
    icon: User,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              suppressHydrationWarning
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive
                  ? "bg-[#F5426A] text-white shadow-md shadow-[#F5426A]/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="h-px bg-gray-100 my-2 mx-4" />

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
