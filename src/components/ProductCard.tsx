"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface ProductProps {
  product: {
    _id: string;
    slug: string;
    sku?: string;
    name: string;
    category: string;
    subCategory?: string;
    price: number;
    oldPrice?: number;
    discount?: number;
    rating?: number;
    reviews?: number;
    images: string[];
    inStock?: boolean;
    stock?: number;
    attributes?: { name: string; values: { value: string; meta?: string; stock: number }[] }[];
  };
  priority?: boolean;
}

// Convert English numbers to Bengali numerals
const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num?.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]) || "০";
};

import { useCart } from "@/context/CartContext";

export function ProductCard({ product, priority = false }: ProductProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdded) return;
    
    // Auto-select first available option for each attribute
    const defaultAttributes: Record<string, string> = {};
    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attr: any) => {
        const availableValue = attr.values.find((v: any) => v.stock > 0);
        if (availableValue) {
          defaultAttributes[attr.name] = availableValue.value;
        }
      });
    }
    
    // Convert to the format expected by cart context if needed
    const cartProduct = {
      id: product._id as any, // Temporary cast until cart context is fully updated
      title: product.name,
      price: product.price,
      image: product.images[0] || "",
      category: product.category,
      oldPrice: product.oldPrice || 0,
      discount: product.discount || 0,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      sku: product.sku
    };
    
    const hasAttributes = Object.keys(defaultAttributes).length > 0;
    addToCart(cartProduct, 1, undefined, undefined, hasAttributes ? defaultAttributes : undefined);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  const isOutOfStock = product.inStock === false || product.stock === 0;
  const mainImage = product.images?.[0] || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image";
  
  return (
    <div className={`group bg-white rounded-xl border border-gray-100 p-3 shadow-sm transition-all duration-300 flex flex-col h-full ${isOutOfStock ? 'opacity-75 grayscale-[30%]' : 'hover:shadow-lg'}`}>
      {/* Image & Badges */}
      <Link href={`/product/${product.slug}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 mb-4 block group/image border border-gray-100">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          quality={100}
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover object-center group-hover/image:scale-105 transition-transform duration-500"
        />
        
        {/* Stock Status Badges */}
        {isOutOfStock ? (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
            স্টক আউট
          </div>
        ) : (
          (product.discount || 0) > 0 ? (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
              {toBengaliNumber(product.discount!)}% ছাড়
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
        <span className="text-xs text-gray-600 font-medium mb-1 bg-gray-100 self-start px-2 py-0.5 rounded">
          {product.subCategory ? `${product.category} > ${product.subCategory}` : product.category}
        </span>
        <Link href={`/product/${product.slug}`} className="block mb-2 hover:text-primary transition-colors">
          <h2 className="text-[15px] font-semibold text-gray-800 line-clamp-1">
            {product.name}
          </h2>
        </Link>
        <div className="flex items-center justify-between mb-3">
          {product.sku ? (
            <span className="text-[11px] text-gray-500">SKU: {product.sku}</span>
          ) : (
            <span className="text-[11px] text-transparent">SKU</span>
          )}
        </div>
        
        <div className="flex flex-wrap items-baseline gap-1.5 md:gap-2 mt-auto mb-3 md:mb-4">
          <span className="text-[16px] md:text-[19px] font-bold text-primary">
            ৳ {toBengaliNumber(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-[11px] md:text-[14px] text-gray-500 line-through">
              ৳{toBengaliNumber(product.oldPrice)}
            </span>
          )}
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={isAdded || isOutOfStock}
          className={`w-full transition-all duration-300 py-2 md:py-2.5 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 font-medium text-[12px] md:text-sm mt-auto border
            ${isOutOfStock
              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
              : isAdded 
                ? 'bg-emerald-500 text-white border-emerald-500 scale-95' 
                : 'bg-pink-50 hover:bg-primary text-primary hover:text-white border-primary/20 hover:border-primary active:scale-95'
            }`}
        >
          {isOutOfStock ? (
            <>স্টক শেষ</>
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
