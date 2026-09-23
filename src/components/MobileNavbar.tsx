"use client";

import { Home, LayoutGrid, Truck, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
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
  const { data: session } = useSession();
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

  const [categories, setCategories] = useState<any[]>([
    { 
      slug: "all", 
      label: "সকল পণ্য", 
    }
  ]);

  // Fetch live categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories([
            { 
              slug: "all", 
              label: "সকল পণ্য", 
            },
            ...data.categories
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    
    fetchCategories();
  }, []);

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
                  if (item.id === 'account') {
                    if (session) {
                      router.push('/account');
                    } else {
                      openLoginModal();
                    }
                  }
                  if (item.id === 'category') setIsCategoryOpen(true);
                }}
                className={cn(
                  "flex items-center justify-center px-4 py-2.5 rounded-full transition-all duration-300 ease-out",
                  isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <div className="relative flex items-center justify-center">
                  {item.id === 'account' && session?.user ? (
                    session.user.image ? (
                      <Image 
                        src={session.user.image} 
                        alt="Profile" 
                        width={28} 
                        height={28} 
                        className="rounded-full w-7 h-7 object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
                        {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  {item.badge && (
                    <span className={cn(
                      "absolute -top-2 -right-2.5 text-[12px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white",
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
              aria-label="Close Categories"
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
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-200 flex items-center justify-center">
                    {cat.image ? (
                      <Image 
                        src={cat.image} 
                        alt={cat.label} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-400/50 group-hover:text-primary/50 transition-colors uppercase">
                        {cat.label ? cat.label.charAt(0) : '?'}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm mb-1 text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
