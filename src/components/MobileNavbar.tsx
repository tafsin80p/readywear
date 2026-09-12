"use client";

import { Home, LayoutGrid, Truck, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { categoryData } from "@/data/mock";
import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";

type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  matchPattern?: RegExp;
  badge?: number;
};

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'হোম', href: '/', matchPattern: /^\/$/ },
  { id: 'category', icon: LayoutGrid, label: 'ক্যাটাগরি', href: '/categories', matchPattern: /^\/categor/ },
  { id: 'track', icon: Truck, label: 'ট্র্যাক', href: '/track', matchPattern: /^\/track/ },
  { id: 'account', icon: User, label: 'অ্যাকাউন্ট', href: '#' },
];

export function MobileNavbar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { openCart } = useCart();
  const { openLoginModal } = useAuth();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Close popup if pathname changes (e.g. back button)
  useEffect(() => {
    setIsCategoryOpen(false);
  }, [pathname]);

  // Prevent scrolling when popup is open
  useEffect(() => {
    if (isCategoryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; }
  }, [isCategoryOpen]);

  const categories = [
    { 
      slug: "all", 
      label: "সকল পণ্য", 
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop" 
    }, 
    ...categoryData
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 px-2 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = item.matchPattern ? item.matchPattern.test(pathname) : false;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (item.href === '#' || item.id === 'category') e.preventDefault();
                  if (item.id === 'cart') openCart();
                  if (item.id === 'account') openLoginModal();
                  if (item.id === 'category') setIsCategoryOpen(true);
                }}
                className={cn(
                  "flex items-center justify-center px-4 py-2.5 rounded-full transition-all duration-300 ease-out",
                  isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:text-gray-800"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className={cn(
                      "absolute -top-1.5 -right-2 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white",
                      isActive ? "bg-white text-primary" : "bg-primary text-white"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
                
                <span 
                  className={cn(
                    "text-[12px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                    isActive ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Category Bottom Sheet */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isCategoryOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsCategoryOpen(false)}
      >
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col max-h-[80vh] ${isCategoryOpen ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">ক্যাটাগরি সমূহ</h3>
            <button 
              onClick={() => setIsCategoryOpen(false)}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-y-auto p-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setIsCategoryOpen(false);
                    setTimeout(() => {
                      router.push(cat.slug === 'all' ? '/categories' : `/category/${cat.slug}`);
                    }, 100);
                  }}
                  className="flex flex-col items-center p-2 bg-gray-50 hover:bg-primary/5 rounded-2xl transition-colors group border border-gray-100 hover:border-primary/20 overflow-hidden"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-200">
                    <Image 
                      src={cat.image} 
                      alt={cat.label} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm mb-1">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
