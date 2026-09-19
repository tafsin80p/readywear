"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Moon, ChevronDown, Menu, LogOut, User, Package, Users, ShoppingBag, LayoutList, Loader2, X, Settings, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function AdminHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isSidebarOpen = searchParams.get("sidebar") === "true";

  const toggleSidebar = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isSidebarOpen) {
      params.delete("sidebar");
    } else {
      params.set("sidebar", "true");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Notification States
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close search results & sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    fetchNotifications();
    
    // Refresh notifications periodically
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          if (data.success) {
            setSearchResults(data.results);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (url: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(url);
  };

  const hasResults = searchResults && (
    searchResults.pages?.length > 0 ||
    searchResults.products?.length > 0 || 
    searchResults.orders?.length > 0 || 
    searchResults.customers?.length > 0 || 
    searchResults.categories?.length > 0
  );

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="p-6 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
          <p className="text-sm">Searching...</p>
        </div>
      );
    }
    
    if (!hasResults) {
      return (
        <div className="p-6 text-center text-gray-500 text-sm">
          No results found for "{searchQuery}"
        </div>
      );
    }

    return (
      <div className="overflow-y-auto">
        {/* Pages / Quick Links */}
        {searchResults.pages?.length > 0 && (
          <div className="py-2 border-b border-gray-100 last:border-0">
            <div className="px-4 py-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Menu className="w-3 h-3" /> Quick Links
            </div>
            {searchResults.pages.map((page: any, index: number) => (
              <div 
                key={index} 
                onClick={() => { handleResultClick(page.url); setShowMobileSearch(false); }}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <LayoutList className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{page.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{page.url}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {searchResults.products.length > 0 && (
          <div className="py-2 border-b border-gray-100 last:border-0">
            <div className="px-4 py-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <ShoppingBag className="w-3 h-3" /> Products
            </div>
            {searchResults.products.map((product: any) => (
              <div 
                key={product._id} 
                onClick={() => { handleResultClick(`/admin/products/edit/${product._id}`); setShowMobileSearch(false); }}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
                  {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">SKU: {product.sku} • ৳{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {searchResults.orders.length > 0 && (
          <div className="py-2 border-b border-gray-100 last:border-0">
            <div className="px-4 py-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Package className="w-3 h-3" /> Orders
            </div>
            {searchResults.orders.map((order: any) => (
              <div 
                key={order._id} 
                onClick={() => { handleResultClick(`/admin/orders/${order._id}`); setShowMobileSearch(false); }}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">#{order.orderId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.customerInfo.firstName} • {order.customerInfo.phone}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Customers */}
        {searchResults.customers.length > 0 && (
          <div className="py-2 border-b border-gray-100 last:border-0">
            <div className="px-4 py-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Users className="w-3 h-3" /> Customers
            </div>
            {searchResults.customers.map((user: any) => (
              <div 
                key={user._id} 
                onClick={() => { handleResultClick(`/admin/customers/${user._id}`); setShowMobileSearch(false); }}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{user.email || user.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {searchResults.categories.length > 0 && (
          <div className="py-2 border-b border-gray-100 last:border-0">
            <div className="px-4 py-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <LayoutList className="w-3 h-3" /> Categories
            </div>
            {searchResults.categories.map((cat: any) => (
              <div 
                key={cat._id} 
                onClick={() => { handleResultClick(`/admin/categories`); setShowMobileSearch(false); }}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{cat.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">/{cat.slug}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo */}
        <Link href="/admin" className="lg:hidden font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-bengali">
          মেহজাবিন অফারস
        </Link>
        
        <div ref={searchRef} className="relative max-w-md w-full hidden md:block">
          {isSearching ? (
            <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <input 
            type="text" 
            placeholder="Search pages, products, orders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setShowResults(true);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(""); setShowResults(false); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[70vh]">
              {renderSearchResults()}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-5 shrink-0">
        
        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationSidebarOpen(!isNotificationSidebarOpen)}
            className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white box-content animate-pulse"></span>
            )}
          </button>
          
          {/* Notification Sidebar / Dropdown */}
          {isNotificationSidebarOpen && (
            <>
              {/* Overlay for mobile */}
              <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsNotificationSidebarOpen(false)} />
              
              <div className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col animate-in slide-in-from-right">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsNotificationSidebarOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {isLoadingNotifications ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                      <p className="text-sm">Loading...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {notifications.map((notification) => (
                        <Link 
                          href={notification.link}
                          key={notification._id}
                          onClick={() => setIsNotificationSidebarOpen(false)}
                          className={`p-3 rounded-xl transition-all ${
                            notification.isRead 
                              ? 'hover:bg-gray-50' 
                              : 'bg-primary/5 hover:bg-primary/10 border border-primary/10'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              notification.isRead ? 'bg-gray-100 text-gray-500' : 'bg-primary text-white'
                            }`}>
                              {(() => {
                                switch (notification.type) {
                                  case 'order': return <Package className="w-4 h-4" />;
                                  case 'product': return <ShoppingBag className="w-4 h-4" />;
                                  case 'category': return <LayoutList className="w-4 h-4" />;
                                  case 'customer': return <Users className="w-4 h-4" />;
                                  case 'setting': return <Settings className="w-4 h-4" />;
                                  default: return <Activity className="w-4 h-4" />;
                                }
                              })()}
                            </div>
                            <div>
                              <p className={`text-sm mb-1 ${notification.isRead ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                {notification.message}
                              </p>
                              <p className="text-[10px] font-medium text-gray-400">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <Bell className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <Link 
                    href="/admin/orders"
                    onClick={() => setIsNotificationSidebarOpen(false)}
                    className="block w-full text-center text-sm font-bold text-primary hover:text-primary/80 p-2"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Theme Toggle */}
        <button className="hidden sm:block p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Moon className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 hidden sm:block mx-1"></div>

        {/* Profile / Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-colors">
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white bg-gradient-to-br from-primary to-primary/80 font-bold text-sm shrink-0 shadow-sm">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Admin Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = userInitial;
                  }}
                />
              ) : (
                userInitial
              )}
            </div>
            <div className="hidden sm:block text-left ml-1">
              <p className="text-sm font-bold text-gray-900 leading-none mb-1 truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] text-gray-500 font-medium leading-none">Super Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-primary shrink-0 ml-1 transition-colors" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
            <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-2 flex flex-col gap-1">
              <Link 
                href="/admin/profile"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
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
      
      
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div 
          ref={mobileSearchRef}
          className="absolute top-0 left-0 right-0 p-4 bg-white border-b border-gray-100 z-50 md:hidden animate-in slide-in-from-top-2"
        >
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
            <input 
              type="text" 
              autoFocus
              placeholder="Search anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowResults(true);
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button 
              onClick={() => {
                setSearchQuery("");
                setShowMobileSearch(false);
                setShowResults(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mobile Search Results */}
          {showResults && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-[70vh] overflow-y-auto flex flex-col">
              {renderSearchResults()}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
