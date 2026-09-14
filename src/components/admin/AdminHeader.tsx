"use client";

import { Search, Bell, Moon, ChevronDown, Menu, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { signOut, useSession } from "next-auth/react";

export function AdminHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products, orders, customers..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#F5426A] rounded-full border-2 border-white box-content"></span>
        </button>
        
        {/* Theme Toggle */}
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Moon className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 hidden sm:block mx-1"></div>

        {/* Profile / Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="flex items-center gap-3 hover:bg-gray-50 border border-gray-200 p-1.5 pr-4 rounded-full transition-colors">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-100 bg-[#F5426A]/10 flex items-center justify-center text-[#F5426A] font-bold text-sm">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="Admin Profile" fill className="object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="hidden sm:block text-left max-w-[120px]">
              <p className="text-sm font-bold text-gray-900 leading-none mb-1 truncate">{userName}</p>
              <p className="text-[11px] text-gray-500 font-medium leading-none">Super Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-gray-600 shrink-0" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
            <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-2 flex flex-col gap-1">
              <Link 
                href="/admin/profile"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#F5426A] rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Profile
              </Link>
              
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              
              <button 
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </header>
  );
}
