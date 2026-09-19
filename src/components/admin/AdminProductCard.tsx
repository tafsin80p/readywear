"use client";

import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

interface AdminProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    oldPrice?: number;
    discount?: string;
    rating: number;
    reviews: number;
    image: string;
  };
}

export function AdminProductCard({ product }: AdminProductCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-4">
        {product.discount && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
            {product.discount}
          </div>
        )}
        <button className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full text-gray-400 hover:text-primary shadow-sm transition-colors opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4" />
        </button>
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wider">{product.category}</p>
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-primary">৳ {product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">৳ {product.oldPrice.toLocaleString()}</span>
          )}
          {product.discount && (
            <span className="text-[11px] font-bold text-primary">{product.discount}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-[11px] font-medium">
          <span className="text-yellow-400">★</span>
          <span className="text-gray-900">{product.rating}</span>
          <span className="text-gray-400">({product.reviews})</span>
        </div>
      </div>

      {/* Button */}
      <button className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-pink-200">
        <ShoppingCart className="w-3.5 h-3.5" />
        Add to Cart
      </button>
    </div>
  );
}
