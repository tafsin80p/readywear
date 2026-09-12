"use client";

import { useCart } from "@/context/CartContext";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export function CartSidebar() {
  const { isCartOpen, closeCart, items, cartTotal, cartCount, removeFromCart, updateQuantity } = useCart();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);



  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-900">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">আপনার কার্ট ({toBengaliNumber(cartCount)})</h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="w-12 h-12 mb-4 text-gray-300" />
              <p>আপনার কার্ট খালি</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-white">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.size && `সাইজ: ${item.size} `}
                        {item.color && `| রং: ${item.color}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md h-8 px-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-500 hover:text-primary"
                      >-</button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-500 hover:text-primary"
                      >+</button>
                    </div>
                    <span className="font-bold text-primary">৳ {toBengaliNumber(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-medium">সাবটোটাল</span>
            <span className="text-xl font-bold text-gray-900">৳ {toBengaliNumber(cartTotal)}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4 text-center">ডেলিভারি চার্জ চেকআউট পেজে হিসাব করা হবে</p>
          
          <Link href="/checkout" onClick={closeCart} className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-[15px] py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
            চেকআউট করুন
          </Link>
          
          <button 
            onClick={closeCart}
            className="w-full mt-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-all border border-gray-200"
          >
            আরও কেনাকাটা করুন
          </button>
        </div>
      </div>
    </>
  );
}
