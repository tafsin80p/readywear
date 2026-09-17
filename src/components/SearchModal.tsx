"use client";

import { useSearch } from "@/context/SearchContext";
import { Search, X, ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const popularSearches = ["শাড়ি", "পাঞ্জাবি", "থ্রি পিস", "শার্ট", "কিডস কালেকশন", "RW-1002"];

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Prevent background scrolling and focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      setQuery(""); // Clear search on close
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeSearch}
      />

      {/* Modal - Mobile Full Screen */}
      <div 
        className={`md:hidden fixed inset-0 w-full h-[100dvh] bg-white z-[100] flex flex-col transform transition-all duration-300 ease-out origin-top ${isSearchOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        {/* Search Header */}
        <div className="flex items-center gap-1.5 p-3 border-b border-gray-100 bg-white">
          <button 
            onClick={closeSearch}
            aria-label="Close Search"
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full active:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 focus-within:border-primary/40 focus-within:bg-white rounded-full px-4 py-2 relative transition-all">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0 mr-2" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="প্রোডাক্ট বা ক্যাটাগরি খুঁজুন..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {query && (
              <button 
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-700 bg-gray-200 rounded-full ml-2 active:scale-95 transition-transform"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {!query.trim() ? (
            <div className="py-2">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                জনপ্রিয় সার্চ
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="bg-white border border-gray-200 hover:border-primary/40 hover:text-primary text-gray-600 text-[13px] px-4 py-2 rounded-full transition-colors shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
              <p>প্রোডাক্ট খোঁজা হচ্ছে...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
              <p>দুঃখিত, কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={closeSearch}
                  className="flex gap-4 bg-white p-3 rounded-xl border border-gray-50 hover:border-primary/20 hover:shadow-sm transition-all group"
                >
                  <div className="relative w-16 h-20 rounded-md overflow-hidden shrink-0 bg-gray-50">
                    <Image 
                      src={product.image} 
                      alt={product.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <span className="text-[10px] font-medium text-gray-400 mb-0.5 uppercase tracking-wide">
                      {product.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-[13px] line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    {product.sku && (
                      <p className="text-[10px] text-gray-400 mt-0.5">SKU: {product.sku}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="font-bold text-primary text-[14px]">
                        ৳ {toBengaliNumber(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ৳ {toBengaliNumber(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center text-[12px] text-gray-500 bg-white md:rounded-b-2xl">
          যেকোনো প্রোডাক্টের নাম, ক্যাটাগরি অথবা SKU লিখে সার্চ করুন
        </div>
      </div>
    </>
  );
}
