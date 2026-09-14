"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart, Minus, Plus, ChevronRight, Truck, ShieldCheck, RefreshCw, Check, Banknote, Scissors, ZoomIn, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  slug: string;
  sku?: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  images: string[];
  inStock?: boolean;
  stock?: number;
  specifications?: { label: string; value: string }[];
  attributes?: { name: string; values: { value: string; meta?: string; stock: number }[] }[];
  note?: string;
  description?: string;
}

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export function ProductDetails({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const handleAddToCart = () => {
    if (isAdded) return;
    
    addToCart(product, quantity, undefined, undefined, selectedAttributes);
    setIsAdded(true);
    
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAttributeSelect = (name: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  // Auto-select first available option for each attribute
  useEffect(() => {
    if (product.attributes && product.attributes.length > 0) {
      const initial: Record<string, string> = {};
      product.attributes.forEach(attr => {
        const availableValue = attr.values.find(v => v.stock > 0);
        if (availableValue) {
          initial[attr.name] = availableValue.value;
        }
      });
      setSelectedAttributes(initial);
    }
  }, [product.attributes]);

  const isOutOfStock = product.inStock === false || product.stock === 0;

  // Filter out attributes that have no values with stock > 0
  const availableAttributes = product.attributes?.map(attr => ({
    ...attr,
    values: attr.values.filter(v => v.stock > 0)
  })).filter(attr => attr.values.length > 0) || [];

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = [
    { id: "red", class: "bg-red-500", name: "লাল" },
    { id: "blue", class: "bg-blue-600", name: "নীল" },
    { id: "black", class: "bg-black", name: "কালো" },
    { id: "green", class: "bg-emerald-500", name: "সবুজ" }
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 pt-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <Link href={`/category/${product.category === 'ড্রেস' ? 'dress' : product.category === 'শাড়ি' ? 'saree' : product.category === 'বেবি ড্রেস' ? 'baby-dress' : product.category === 'পাঞ্জাবি' ? 'panjabi' : 'combo-offer'}`} className="hover:text-primary transition-colors">{product.category}</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left: Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full md:w-20 lg:w-24 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {product.images?.map((img, index) => (
                <button 
                  key={index} 
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-[3/4] md:w-full w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-primary shadow-sm shadow-primary/20' : 'border-transparent hover:border-gray-200'}`}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} fill className={`object-cover object-top transition-opacity ${activeImageIndex === index ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} sizes="(max-width: 768px) 25vw, 15vw" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="w-full flex items-start justify-center lg:justify-start xl:justify-center">
              <div 
                className="relative w-full max-w-[500px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <Image
                  src={product.images?.[activeImageIndex] || "https://placehold.co/800x1200/f3f4f6/a1a1aa?text=No+Image"}
                  alt={product.name}
                  width={800}
                  height={1200}
                  priority
                  className={`w-full h-auto object-contain transition-transform duration-200 ease-out ${isZoomed ? 'scale-[2.5]' : 'scale-100'}`}
                  style={{
                    transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center center'
                  }}
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                
                {/* Zoom Icon */}
                <div className={`absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur text-gray-700 rounded-full flex items-center justify-center shadow-md transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  <ZoomIn className="w-5 h-5" />
                </div>
                
                {/* Discount Badge */}
                {(product.discount || 0) > 0 && (
                  <div className={`absolute top-4 left-4 bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-sm shadow-md shadow-primary/20 z-10 transition-opacity duration-300 ${isZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {toBengaliNumber(product.discount!)}% ছাড়
                  </div>
                )}
                
                {/* Wishlist Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); /* Add to wishlist logic */ }}
                  className={`absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur text-gray-500 hover:text-primary rounded-full flex items-center justify-center shadow-sm transition-all duration-300 z-10 ${isZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
            
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
              {product.sku && (
                <p className="text-sm font-medium text-gray-500 mb-4">SKU: {product.sku}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-6">

                {isOutOfStock ? (
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">স্টক আউট</span>
                ) : (
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">স্টকে আছে</span>
                )}
              </div>

              <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  ৳ {toBengaliNumber(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    ৳{toBengaliNumber(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {availableAttributes.map((attr, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{attr.name}</h3>
                    {attr.name.toLowerCase() === 'size' && (
                      <button className="text-sm text-primary underline font-medium">সাইজ গাইড</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {attr.values.map(v => {
                      const isSelected = selectedAttributes[attr.name] === v.value;
                      
                      if (v.meta) {
                        return (
                          <button
                            key={v.value}
                            onClick={() => handleAttributeSelect(attr.name, v.value)}
                            title={v.value}
                            className={`w-10 h-10 rounded-full ring-offset-2 transition-all ${isSelected ? 'ring-2 ring-primary scale-110' : 'ring-1 ring-gray-200 hover:scale-105'}`}
                            style={{ backgroundColor: v.meta }}
                            aria-label={`Select ${v.value}`}
                          />
                        );
                      }

                      return (
                        <button
                          key={v.value}
                          onClick={() => handleAttributeSelect(attr.name, v.value)}
                          className={`min-w-[3rem] h-11 px-4 rounded-lg font-semibold text-sm transition-all border ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions & Quantity */}
            <div className="flex flex-col sm:flex-row items-end gap-3 mt-auto">
              {/* Quantity */}
              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                <span className="text-sm font-semibold text-gray-900 hidden sm:block">পরিমাণ</span>
                <div className={`flex items-center w-full sm:w-[110px] h-11 bg-gray-50 border border-gray-200 rounded-lg ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 sm:w-9 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-semibold text-gray-900 flex items-center justify-center h-full pt-0.5">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 sm:w-9 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                    disabled={isOutOfStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                disabled={isAdded || isOutOfStock}
                className={`flex-1 w-full transition-all duration-300 h-11 rounded-lg flex items-center justify-center gap-2 font-bold text-[14px] border-2
                  ${isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isAdded
                      ? 'bg-emerald-500 text-white border-emerald-500 scale-95'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-900 active:scale-95'
                  }`}
              >
                {isOutOfStock ? (
                  <>স্টক শেষ</>
                ) : isAdded ? (
                  <><Check className="w-4 h-4 animate-bounce" /> যোগ হয়েছে</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> কার্টে রাখুন</>
                )}
              </button>

              {/* Buy Now */}
              <button 
                onClick={() => {
                  addToCart(product as any, quantity, undefined, undefined, selectedAttributes, false);
                  router.push('/checkout');
                }}
                disabled={isOutOfStock}
                className={`flex-1 w-full transition-all duration-300 h-11 rounded-lg flex items-center justify-center gap-2 font-bold text-[14px] ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'}`}
              >
                {isOutOfStock ? 'স্টক শেষ' : 'এখনি কিনুন'}
              </button>
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Banknote className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600">পার্শিয়াল ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600">ফাস্ট ডেলিভারি*</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Scissors className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600">রেডি টু ওয়্যার স্টিচিং</span>
              </div>
            </div>
            {/* Product Details Section (Moved inside) */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                {product.category} ডিটেইলস
              </h2>

              <div className="space-y-6">
                {/* Main Description */}
                {product.description && (
                  <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                    {product.description}
                  </div>
                )}
                
                {/* Specifications Table */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-left text-[14px]">
                      <tbody className="divide-y divide-gray-100">
                        {product.specifications.map((spec, index) => (
                          <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="w-1/3 py-3 px-4 font-bold text-[#4B4B68] bg-[#F8F9FB] border-r border-gray-100 align-top">
                              {spec.label}
                            </td>
                            <td className="w-2/3 py-3 px-4 text-gray-700 align-top leading-relaxed">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Special Note */}
                <div className="bg-red-50/70 rounded-xl border border-red-100 p-5 mt-2 shadow-sm shadow-red-500/5">
                  <h3 className="text-[15px] font-bold text-[#F5426A] mb-3">বিঃদ্রঃ</h3>
                  <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.note || `১। ডেলিভারি চার্জ সম্পর্কিত তথ্যঃ ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৮০ টাকা, ঢাকা সিটির বাইরে ডেলিভারি চার্জ ১৫০ টাকা।
২। বুকিং মানি সম্পর্কিত তথ্যঃ সারা বাংলাদেশে থানা লেভেল পর্যন্ত ক্যাশ অন ডেলিভারি, ১০০০ টাকা অগ্রিম। বাকি টাকা পণ্য বুঝে পেয়ে পরিশোধ করতে পারবেন।
৩। ছবিতে পণ্যের রঙ দেখুন; আপনার কম্পিউটার অথবা মোবাইলের রেজুলেশন ও লাইটিং এর জন্য ইমেজ ও প্রকৃত পণ্যের রঙ-এ সামান্য তারতম্য ঘটতে পারে।
৪। প্রোডাক্টের অর্ডার স্টক থাকা সাপেক্ষে ডেলিভারি করা হবে। অনিবার্য কারণে পণ্যের ডেলিভারিতে বিক্রেতা প্রতিশ্রুত ডেলিভারি সময়ের বেশী লাগতে পারে।`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            একই ক্যাটাগরির আরও পণ্য
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct._id} product={relatedProduct as any} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setIsLightboxOpen(false)}
          style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur transition-colors z-[60]"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative w-full max-w-5xl h-full max-h-screen flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <Image
              src={product.images?.[activeImageIndex] || "https://placehold.co/800x1200/f3f4f6/a1a1aa?text=No+Image"}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
