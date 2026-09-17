"use client";

import { Search, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const popularSearches = ["শাড়ি", "পাঞ্জাবি", "থ্রি পিস", "শার্ট", "কিডস কালেকশন", "RW-1002"];

export function DesktopSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Fetch from API
  useEffect(() => {
    if (!query.trim()) {
      setIsSearching(false);
      setFilteredProducts([]);
      return;
    }
    
    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setFilteredProducts(data.products);
        }
      } catch (error) {
        console.error("Search error:", error);
        setFilteredProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="প্রোডাক্ট, ক্যাটাগরি বা SKU দিয়ে খুঁজুন..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 px-6 pr-12 focus:outline-none focus:border-primary/50 focus:bg-white focus:shadow-sm transition-all text-[15px]"
        />
        <div className="absolute right-0 top-0 h-full px-4 bg-primary text-white rounded-r-full flex items-center justify-center transition-colors">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {!query.trim() ? (
              <div className="py-2">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  জনপ্রিয় সার্চ
                </h2>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="bg-gray-50 border border-gray-200 hover:border-primary/40 hover:text-primary text-gray-600 text-[13px] px-3 py-1.5 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-8 h-8 mb-3 text-primary animate-spin" />
                <p className="text-sm">প্রোডাক্ট খোঁজা হচ্ছে...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <ShoppingBag className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">দুঃখিত, কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex gap-3 bg-white p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="relative w-12 h-16 rounded-md overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                      <Image 
                        src={product.image} 
                        alt={product.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-[13px] line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      {product.sku && (
                        <p className="text-[10px] text-gray-400">SKU: {product.sku}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold text-primary text-xs">
                          ৳ {toBengaliNumber(product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
            <button 
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
