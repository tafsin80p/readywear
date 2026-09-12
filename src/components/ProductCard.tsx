"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface ProductProps {
  product: {
    id: number;
    sku?: string;
    title: string;
    category: string;
    price: number;
    oldPrice: number;
    discount: number;
    rating: number;
    reviews: number;
    image: string;
    inStock?: boolean;
  };
}

// Convert English numbers to Bengali numerals
const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdded) return;
    
    addToCart(product, 1);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  const isOutOfStock = product.inStock === false;
  
  return (
    <div className={`group bg-white rounded-xl border border-gray-100 p-3 shadow-sm transition-all duration-300 flex flex-col h-full ${isOutOfStock ? 'opacity-75 grayscale-[30%]' : 'hover:shadow-lg'}`}>
      {/* Image & Badges */}
      <Link href={`/product/${product.id}`} className="relative w-full rounded-lg overflow-hidden bg-white mb-4 block group/image">
        <Image
          src={product.image}
          alt={product.title}
          width={400}
          height={600}
          className="w-full h-auto object-cover group-hover/image:scale-105 transition-transform duration-500"
        />
        
        {/* Stock Status Badges */}
        {isOutOfStock ? (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
            স্টক আউট
          </div>
        ) : (
          product.discount > 0 ? (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
              {toBengaliNumber(product.discount)}% ছাড়
            </div>
          ) : (
            <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
              ইন স্টক
            </div>
          )
        )}

      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <span className="text-xs text-gray-400 font-medium mb-1 bg-gray-100 self-start px-2 py-0.5 rounded">
          {product.category}
        </span>
        <Link href={`/product/${product.id}`} className="block mb-2 hover:text-primary transition-colors">
          <h3 className="text-[15px] font-semibold text-gray-800 line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mb-3">
          {product.sku ? (
            <span className="text-[11px] text-gray-400">SKU: {product.sku}</span>
          ) : (
            <span className="text-[11px] text-transparent">SKU</span>
          )}
          
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md border border-gray-100">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] md:text-xs font-bold text-gray-700">{toBengaliNumber(product.rating)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-baseline gap-1.5 md:gap-2 mt-auto mb-3 md:mb-4">
          <span className="text-[16px] md:text-[19px] font-bold text-primary">
            ৳ {toBengaliNumber(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] md:text-[14px] text-gray-400 line-through">
              ৳{toBengaliNumber(product.oldPrice)}
            </span>
          )}
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={isAdded || isOutOfStock}
          className={`w-full transition-all duration-300 py-2 md:py-2.5 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 font-medium text-[12px] md:text-sm mt-auto border
            ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : isAdded 
                ? 'bg-emerald-500 text-white border-emerald-500 scale-95' 
                : 'bg-pink-50 hover:bg-primary text-primary hover:text-white border-primary/20 hover:border-primary active:scale-95'
            }`}
        >
          {isOutOfStock ? (
            <>
              স্টক শেষ
            </>
          ) : isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce" />
              যোগ হয়েছে
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
              কার্টে যোগ করুন
            </>
          )}
        </button>
      </div>
    </div>
  );
}
