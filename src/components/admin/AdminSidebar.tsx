"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { 
  Home, 
  ShoppingBag, 
  LayoutList, 
  ShoppingCart, 
  Users, 
  Ticket, 
  MessageSquare, 
  Package, 
  Truck, 
  PieChart, 
  FileText, 
  PenTool, 
  Image as ImageIcon, 
  Palette, 
  Settings,
  List,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Static icon map to prevent hydration mismatches
const ICON_MAP: Record<string, LucideIcon> = {
  Products: ShoppingBag,
  Categories: LayoutList,
  Attributes: List,
  Orders: ShoppingCart,
  Customers: Users,
  Coupons: Ticket,
  Reviews: MessageSquare,
  Inventory: Package,
  Shipping: Truck,
  Reports: PieChart,
  Pages: FileText,
  Blog: PenTool,
  Banners: ImageIcon,
  Appearance: Palette,
  Settings: Settings,
};

function renderIcon(name: string, className: string) {
  const Icon = ICON_MAP[name] || Circle;
  return <Icon className={className} />;
}

export function AdminSidebar({ 
  unreadOrdersCount: initialCount = 0,
  totalProductsCount = 0
}: { 
  unreadOrdersCount?: number,
  totalProductsCount?: number
}) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>("Products");
  const [unreadCount, setUnreadCount] = useState(initialCount);

  // Poll for unread orders count every 15 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/orders/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        // Silent error
      }
    };

    // Fetch immediately on mount to get latest state
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]); // Also re-fetch when pathname changes (e.g. going to order details)


  const navigation = [
    {
      title: "MANAGEMENT",
      items: [
        { 
          name: "Products", 
          subItems: [
            { name: "All Products", href: "/admin/products" },
            { name: "Add Product", href: "/admin/products/add" }
          ]
        },
        { name: "Categories", href: "/admin/categories" },
        { name: "Attributes", href: "/admin/attributes" },
        { name: "Orders", href: "/admin/orders" },
        { name: "Customers", href: "/admin/customers" },
        { name: "Coupons", href: "/admin/coupons" },
        { name: "Reviews", href: "/admin/reviews" },
        { name: "Inventory", href: "/admin/inventory" },
        { name: "Shipping", href: "/admin/shipping" },
        { name: "Reports", href: "/admin/reports" },
      ]
    },
    {
      title: "CMS & CONTENT",
      items: [
        { name: "Pages", href: "/admin/pages" },
        { name: "Blog", href: "/admin/blog" },
        { name: "Banners", href: "/admin/banners" },
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { name: "Appearance", href: "/admin/appearance" },
        { name: "Settings", href: "/admin/settings" },
      ]
    }
  ];

  return (
    <aside suppressHydrationWarning className="w-[280px] shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div suppressHydrationWarning className="h-[72px] flex items-center px-6 shrink-0">
        <Link href="/admin" className="flex items-center -ml-2">
          <Image 
            src="/readywear logo.png" 
            alt="ReadyWear Logo" 
            width={240} 
            height={60} 
            className="w-44 h-auto object-contain"
            priority
          />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        {/* Dashboard Link (Always at top) */}
        <Link 
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium mb-6 group",
            pathname === "/admin" 
              ? "bg-[#F5426A] text-white shadow-md shadow-[#F5426A]/20 font-semibold" 
              : "text-gray-500 hover:bg-pink-50/50 hover:text-[#F5426A] transition-colors"
          )}
        >
          <Home className={cn("w-5 h-5", pathname === "/admin" ? "text-white" : "text-gray-400 group-hover:text-[#F5426A] transition-colors")} />
          <span>Dashboard</span>
        </Link>

        {/* Dynamic Sections */}
        <div className="space-y-8">
          {navigation.map((section, idx) => (
            <div key={idx} suppressHydrationWarning>
              <h4 className="px-4 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const hasSubItems = !!item.subItems;
                  

                  
                  // For parent matching, check if current path starts with any sub-item href
                  const safePathname = pathname || "";
                  const isActive = hasSubItems 
                    ? item.subItems!.some(sub => safePathname === sub.href)
                    : safePathname.startsWith(item.href as string);

                  const isExpanded = expandedMenu === item.name;

                  return (
                    <li key={itemIdx} className="flex flex-col">
                      {hasSubItems ? (
                        <button
                          onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 rounded-xl text-[15px] w-full group",
                            isActive
                              ? "bg-[#F5426A] text-white shadow-md shadow-[#F5426A]/20 font-semibold"
                              : "text-gray-500 hover:bg-pink-50/50 hover:text-[#F5426A] transition-colors font-medium"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {renderIcon(item.name, cn("w-[18px] h-[18px] transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-[#F5426A]"))}
                            <span>{item.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Badge for Products */}
                            {item.name === "Products" && totalProductsCount > 0 && (
                              <div className={cn(
                                "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                                isActive 
                                  ? "bg-white text-[#F5426A]" 
                                  : "bg-[#F5426A] text-white shadow-sm shadow-[#F5426A]/30"
                              )}>
                                {totalProductsCount}
                              </div>
                            )}
                            <svg 
                              className={cn("w-4 h-4 transition-transform duration-200", isExpanded ? "rotate-90" : "", isActive ? "text-white" : "text-gray-400 group-hover:text-[#F5426A]")} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
                          suppressHydrationWarning
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 rounded-xl text-[15px] group",
                            isActive
                              ? "bg-[#F5426A] text-white shadow-md shadow-[#F5426A]/20 font-semibold"
                              : "text-gray-500 hover:bg-pink-50/50 hover:text-[#F5426A] transition-colors font-medium"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {renderIcon(item.name, cn("w-[18px] h-[18px] transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-[#F5426A]"))}
                            <span>{item.name}</span>
                          </div>
                          
                          {/* Badge for Orders */}
                          {item.name === "Orders" && unreadCount > 0 && (
                            <div className={cn(
                              "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                              isActive 
                                ? "bg-white text-[#F5426A]" 
                                : "bg-[#F5426A] text-white shadow-sm shadow-[#F5426A]/30"
                            )}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </Link>
                      )}

                      {/* Sub Items Dropdown */}
                      {hasSubItems && isExpanded && (
                        <ul className="mt-1 ml-11 space-y-1 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                          {item.subItems!.map((subItem, subIdx) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <li key={subIdx}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
                                    isSubActive
                                      ? "text-[#F5426A] bg-pink-50/30"
                                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                  )}
                                >
                                  {isSubActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#F5426A] rounded-r-full"></div>
                                  )}
                                  <span className="flex-1">{subItem.name}</span>
                                  
                                  {/* Badge for All Products */}
                                  {subItem.name === "All Products" && totalProductsCount > 0 && (
                                    <div className={cn(
                                      "flex items-center justify-center min-w-[20px] h-4 px-1.5 rounded-full text-[10px] font-bold ml-2",
                                      isSubActive 
                                        ? "bg-[#F5426A] text-white" 
                                        : "bg-[#F5426A] text-white shadow-sm shadow-[#F5426A]/30"
                                    )}>
                                      {totalProductsCount}
                                    </div>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="p-6 shrink-0 mt-auto">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-4 flex items-center justify-between border border-pink-100">
          <div>
            <h4 className="font-bold text-[#F5426A] text-sm">ReadyWear</h4>
            <p className="text-xs text-gray-500 mt-0.5">Fashion for Every You</p>
          </div>
          <div className="w-10 h-10 bg-[#F5426A] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm shadow-pink-200">
            {/* Placeholder for the pink shirt image in the reference */}
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f3f4f6;
          border-radius: 20px;
        }
      `}</style>
    </aside>
  );
}
