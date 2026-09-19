"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LucideIcon, X } from "lucide-react";
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
  Circle,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Trash2
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
  Integrations: LinkIcon,
  Trash: Trash2,
  Visitors: BarChart2,
};

function renderIcon(name: string, className: string) {
  const Icon = ICON_MAP[name] || Circle;
  return <Icon className={className} />;
}

export function AdminSidebar({ 
  unreadOrdersCount: initialCount = 0,
  totalProductsCount = 0,
  logo
}: { 
  unreadOrdersCount?: number,
  totalProductsCount?: number,
  logo?: string
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobileOpen = searchParams.get("sidebar") === "true";

  const closeMobileSidebar = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sidebar");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [expandedMenu, setExpandedMenu] = useState<string | null>("Products");
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        { name: "Inventory", href: "/admin/inventory" },
        { name: "Shipping", href: "/admin/shipping" },
      ]
    },
    {
      title: "ANALYTICS",
      items: [
        { name: "Visitors", href: "/admin/analytics" }
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
        { name: "Integrations", href: "/admin/integrations" },
        { name: "Trash", href: "/admin/integrations/trash" },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
        />
      )}

      <aside suppressHydrationWarning className={cn(
        "shrink-0 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 transition-all duration-300 z-50",
        isCollapsed ? "w-[84px]" : "w-[280px]",
        isMobileOpen ? "fixed inset-y-0 left-0 flex shadow-2xl translate-x-0" : "hidden lg:flex"
      )}>
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button 
            onClick={closeMobileSidebar}
            className="absolute top-4 right-4 lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-50"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo Area */}
      <div suppressHydrationWarning className="h-[72px] relative flex items-center shrink-0 border-b border-gray-100 px-6">
        <a 
          href="/admin" 
          className={cn(
            "flex items-center transition-all duration-300 origin-left", 
            isCollapsed ? "opacity-0 pointer-events-none scale-90 w-0" : "opacity-100 scale-100 w-auto"
          )}
        >
          <Image 
            src={logo || "/readywear logo.png"} 
            alt="ReadyWear Logo" 
            width={240} 
            height={60} 
            className="h-9 sm:h-10 w-auto object-contain object-left"
            priority
          />
        </a>

        {/* Collapsed Logo (R) */}
        <a 
          href="/admin" 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300", 
            isCollapsed ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-90"
          )}
        >
          <div suppressHydrationWarning className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
            R
          </div>
        </a>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute top-[28px] -right-[14px] z-50 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-400 hover:text-primary transition-all hover:scale-110"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 custom-scrollbar">
        {/* Dashboard Link (Always at top) */}
        <Link 
          href="/admin"
          className={cn(
            "flex items-center py-3 rounded-xl font-medium mb-6 group transition-all duration-300 relative",
            isCollapsed ? "justify-center" : "px-4",
            pathname === "/admin" 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 font-bold" 
              : "text-gray-500 hover:bg-pink-50/50 hover:text-primary"
          )}
        >
          <Home className={cn("w-5 h-5 shrink-0 transition-transform duration-300", !isCollapsed && "group-hover:scale-110", pathname === "/admin" ? "text-white" : "text-gray-400 group-hover:text-primary")} />
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3 group-hover:translate-x-1"
          )}>
            Dashboard
          </span>
        </Link>

        {/* Dynamic Sections */}
        <div className="space-y-8">
          {navigation.map((section, idx) => (
            <div key={idx} suppressHydrationWarning>
              <div suppressHydrationWarning className={cn("transition-all duration-300 overflow-hidden", isCollapsed ? "h-0 opacity-0 mb-0" : "h-6 opacity-100 mb-3")}>
                <h4 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {section.title}
                </h4>
              </div>
              <div className={cn("transition-all duration-300 mx-4 bg-gray-100", isCollapsed && idx !== 0 ? "h-px my-4 opacity-100" : "h-0 my-0 opacity-0")}></div>
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
                            "flex items-center justify-between py-2.5 rounded-xl text-[15px] w-full group transition-all duration-300 overflow-hidden",
                            isCollapsed ? "px-0 justify-center" : "px-4",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 font-bold"
                              : "text-gray-500 hover:bg-pink-50/50 hover:text-primary font-medium"
                          )}
                        >
                          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
                            {renderIcon(item.name, cn("w-[20px] h-[20px] shrink-0 transition-all duration-300", !isCollapsed && "group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary"))}
                            <span className={cn(
                              "transition-all duration-300 overflow-hidden whitespace-nowrap text-left",
                              isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3 group-hover:translate-x-1"
                            )}>
                              {item.name}
                            </span>
                          </div>
                          
                          <div className={cn(
                            "flex items-center gap-2 transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"
                          )}>
                            {/* Badge for Products */}
                            {item.name === "Products" && totalProductsCount > 0 && (
                              <div className={cn(
                                "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold shrink-0",
                                isActive 
                                  ? "bg-white text-primary" 
                                  : "bg-primary text-white shadow-sm shadow-primary/30"
                              )}>
                                {totalProductsCount}
                              </div>
                            )}
                            <svg 
                              className={cn("w-4 h-4 shrink-0 transition-transform duration-200", isExpanded ? "rotate-90" : "", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} 
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
                            "flex items-center justify-between py-2.5 rounded-xl text-[15px] group transition-all duration-300 relative overflow-hidden",
                            isCollapsed ? "px-0 justify-center" : "px-4",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 font-bold"
                              : "text-gray-500 hover:bg-pink-50/50 hover:text-primary font-medium"
                          )}
                        >
                          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
                            {renderIcon(item.name, cn("w-[20px] h-[20px] shrink-0 transition-all duration-300", !isCollapsed && "group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary"))}
                            <span className={cn(
                              "transition-all duration-300 overflow-hidden whitespace-nowrap",
                              isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3 group-hover:translate-x-1"
                            )}>
                              {item.name}
                            </span>
                          </div>
                          
                          {/* Badge for Orders */}
                          {item.name === "Orders" && unreadCount > 0 && (
                            <div className={cn(
                              "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all duration-300",
                              isCollapsed ? "absolute top-1 right-2 border-2 border-white min-w-[16px] h-4 text-[9px] px-1 shadow-md" : "ml-2",
                              isActive 
                                ? (isCollapsed ? "bg-white text-primary" : "bg-white text-primary") 
                                : "bg-primary text-white shadow-sm shadow-primary/30"
                            )}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </Link>
                      )}

                      {/* Sub Items Dropdown */}
                      {hasSubItems && isExpanded && !isCollapsed && (
                        <ul className="mt-1 ml-11 space-y-1 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                          {item.subItems!.map((subItem, subIdx) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <li key={subIdx}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                                    isSubActive
                                      ? "text-primary bg-pink-50/50 font-bold"
                                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                  )}
                                >
                                  {isSubActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full"></div>
                                  )}
                                  <span className="flex-1 transition-transform duration-300 group-hover:translate-x-1">{subItem.name}</span>
                                  
                                  {/* Badge for All Products */}
                                  {subItem.name === "All Products" && totalProductsCount > 0 && (
                                    <div className={cn(
                                      "flex items-center justify-center min-w-[20px] h-4 px-1.5 rounded-full text-[10px] font-bold ml-2",
                                      isSubActive 
                                        ? "bg-primary text-white" 
                                        : "bg-primary text-white shadow-sm shadow-primary/30"
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
      <div className={cn("transition-all duration-300 overflow-hidden", isCollapsed ? "h-0 opacity-0 p-0" : "h-[100px] opacity-100 p-6")}>
        <div className="bg-gradient-to-br from-pink-50 via-white to-pink-100/50 rounded-2xl p-4 flex items-center justify-between border border-pink-100/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div>
            <h4 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 text-sm">ReadyWear</h4>
            <p className="text-xs text-gray-500 mt-0.5 font-medium whitespace-nowrap">Fashion for Every You</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="w-4 h-4" />
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
    </>
  );
}
