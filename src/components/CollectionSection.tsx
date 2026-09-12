"use client";

import { products, categoryData } from "@/data/mock";
import { ProductCard } from "./ProductCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CollectionSection() {
  const categories = [{ slug: "all", label: "সকল পণ্য" }, ...categoryData];
  
  // On the home page, we will show some default products (e.g., first 10)
  const defaultProducts = products.slice(0, 10);

  return (
    <section className="py-12 bg-white container mx-auto px-4 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            সকল পণ্য <span className="text-gray-400 font-normal text-xl">(Full Collection)</span>
          </h2>
          <p className="text-gray-500">আমাদের সব নতুন এবং জনপ্রিয় পণ্য এখন এক জায়গায়</p>
        </div>
        
        <Link 
          href="/categories"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          সব পণ্য দেখুন
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Tabs as Direct Page Links */}
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={category.slug === 'all' ? '/categories' : `/category/${category.slug}`}
            className={`shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200`}
          >
            {category.label}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {defaultProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
