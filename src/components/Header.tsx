"use client";

import { Search, ShoppingCart, User, LogOut, Package, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { DesktopSearch } from "./DesktopSearch";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { openCart, cartCount } = useCart();
  const { openLoginModal } = useAuth();
  const { openSearch } = useSearch();
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/readywear logo.png" 
                alt="ReadyWear Logo" 
                width={300} 
                height={100} 
                className="h-12 md:h-16 w-auto object-contain mix-blend-multiply"
                priority
              />
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-12 relative z-50">
            <DesktopSearch />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={openSearch} aria-label="Search" className="md:hidden text-gray-600 hover:text-primary transition-colors">
              <Search className="w-6 h-6" />
            </button>
            
            <Link href="/track" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              <span className="text-[13px] font-semibold">ট্র্যাক অর্ডার</span>
            </Link>

            {session ? (
              <div className="hidden md:block relative group">
                <div className="flex items-center gap-2 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <span className="text-[13px] font-semibold text-gray-700 pr-1">{session.user?.name}</span>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-2 flex flex-col gap-1">
                    <Link href="/account" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      ড্যাশবোর্ড
                    </Link>
                    <Link href="/account/orders" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                      <Package className="w-4 h-4 text-gray-400" />
                      আমার অর্ডারসমূহ
                    </Link>
                    <Link href="/account/profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                      অ্যাকাউন্ট সেটিংস
                    </Link>
                    
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    
                    <button 
                      onClick={() => signOut()} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট করুন
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={openLoginModal} className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <User className="w-5 h-5" />
                <span className="text-[13px] font-semibold">অ্যাকাউন্ট</span>
              </button>
            )}

            <button onClick={openCart} aria-label="Cart" className="relative flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-[13px] font-semibold">কার্ট</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
