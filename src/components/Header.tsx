"use client";

import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { DesktopSearch } from "./DesktopSearch";

export function Header() {
  const { openCart, cartCount } = useCart();
  const { openLoginModal } = useAuth();
  const { openSearch } = useSearch();

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
            <button onClick={openSearch} className="md:hidden text-gray-600 hover:text-primary transition-colors">
              <Search className="w-6 h-6" />
            </button>
            
            <Link href="/track" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              <span className="text-[13px] font-semibold">ট্র্যাক অর্ডার</span>
            </Link>

            <button onClick={openLoginModal} className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span className="text-[13px] font-semibold">অ্যাকাউন্ট</span>
            </button>

            <button onClick={openCart} className="relative flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
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
