"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart, Minus, Plus, ChevronRight, Truck, ShieldCheck, RefreshCw, Check } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/context/CartContext";

interface Product {
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
  specifications?: { label: string; value: string }[];
}

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export function ProductDetails({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("red");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (isAdded) return;
    
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const isOutOfStock = product.inStock === false;

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
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left: Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnails (Mocked) */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full md:w-20 lg:w-24 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[0, 1, 2, 3].map((index) => (
                <button 
                  key={index} 
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-[3/4] md:w-full w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-primary shadow-sm shadow-primary/20' : 'border-transparent hover:border-gray-200'}`}
                >
                  <Image src={product.image} alt={`Thumbnail ${index + 1}`} fill className={`object-cover object-top transition-opacity ${activeImageIndex === index ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} sizes="(max-width: 768px) 25vw, 15vw" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
              {/* Note: In a real app with multiple images, we would use product.images[activeImageIndex] here */}
              <Image
                src={product.image}
                alt={product.title}
                width={800}
                height={1200}
                priority
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-sm shadow-md shadow-primary/20 z-10">
                  {toBengaliNumber(product.discount)}% ছাড়
                </div>
              )}
              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur text-gray-500 hover:text-primary rounded-full flex items-center justify-center shadow-sm transition-colors z-10">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.title}</h1>
              {product.sku && (
                <p className="text-sm font-medium text-gray-500 mb-4">SKU: {product.sku}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-bold text-amber-800">{toBengaliNumber(product.rating)}</span>
                </div>
                <span className="text-sm text-gray-500 underline cursor-pointer">{toBengaliNumber(product.reviews)} রিভিউ</span>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
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
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    ৳{toBengaliNumber(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {/* Color Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">কালার নির্বাচন করুন</h3>
                  <span className="text-sm text-gray-500">{colors.find(c => c.id === selectedColor)?.name}</span>
                </div>
                <div className="flex gap-3">
                  {colors.map(color => (
                    <button 
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full ${color.class} ring-offset-2 transition-all ${selectedColor === color.id ? 'ring-2 ring-primary scale-110' : 'ring-1 ring-gray-200 hover:scale-105'}`}
                      aria-label={`Select ${color.name}`}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">সাইজ</h3>
                  <button className="text-sm text-primary underline font-medium">সাইজ গাইড</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-11 px-4 rounded-lg font-semibold text-sm transition-all border ${
                        selectedSize === size 
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">পরিমাণ</h3>
                <div className={`flex items-center w-32 h-12 bg-gray-50 border border-gray-200 rounded-lg ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-semibold text-gray-900 flex items-center justify-center h-full pt-0.5">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                    disabled={isOutOfStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                disabled={isAdded || isOutOfStock}
                className={`flex-1 transition-all duration-300 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] border-2
                  ${isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isAdded
                      ? 'bg-emerald-500 text-white border-emerald-500 scale-95'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-900 active:scale-95'
                  }`}
              >
                {isOutOfStock ? (
                  <>
                    স্টক শেষ
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" />
                    যোগ হয়েছে
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    কার্টে রাখুন
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  addToCart(product, quantity, selectedSize, selectedColor);
                  router.push('/checkout');
                }}
                disabled={isOutOfStock}
                className={`flex-1 transition-all duration-300 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'}`}
              >
                {isOutOfStock ? 'স্টক শেষ' : 'এখনি কিনুন'}
              </button>
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600">দেশব্যাপী ডেলিভারি</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600">৭ দিনের রিটার্ন</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-600">১০০% অরিজিনাল</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section (Simplified) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          {product.category} ডিটেইলস
        </h2>

        <div className="space-y-8">
          {/* Main Description */}
          <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
            <p>আমাদের {product.title} তৈরি করা হয়েছে প্রিমিয়াম কোয়ালিটির ফেব্রিক দিয়ে, যা আপনাকে দিবে সর্বোচ্চ আরাম ও স্টাইলিশ লুক। এর অনন্য ডিজাইন এবং নিঁখুত ফিনিশিং আপনাকে যেকোনো অনুষ্ঠানে আকর্ষণীয় করে তুলবে।</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>উচ্চ মানের ম্যাটেরিয়াল গ্যারান্টি</li>
              <li>দীর্ঘস্থায়ী রঙ এবং ফেব্রিক</li>
              <li>আরামদায়ক ফিটিং</li>
            </ul>
          </div>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-left text-[15px]">
                <tbody className="divide-y divide-gray-100">
                  {product.specifications.map((spec, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="w-1/3 py-4 px-4 sm:px-6 font-bold text-[#4B4B68] bg-[#F8F9FB] border-r border-gray-100 align-top">
                        {spec.label}
                      </td>
                      <td className="w-2/3 py-4 px-4 sm:px-6 text-gray-700 align-top leading-relaxed">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Important Info */}
          <div className="pt-6 border-t border-gray-100 space-y-4 text-gray-600 leading-relaxed text-[14px]">
            <p><strong>ডেলিভারি সময়:</strong> ঢাকার ভিতরে ২-৩ দিন, ঢাকার বাইরে ৩-৫ দিন।</p>
            <p><strong>রিটার্ন পলিসি:</strong> পণ্য হাতে পাওয়ার পর কোনো ত্রুটি পেলে ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জ করতে পারবেন।</p>
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
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
