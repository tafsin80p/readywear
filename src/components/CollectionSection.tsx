"use client";

import { ProductCard } from "./ProductCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CollectionSection({ 
  products = [], 
  initialCategories = [],
  title = "সকল পণ্য",
  subtitle = "(Full Collection)",
  description = "আমাদের সব নতুন এবং জনপ্রিয় পণ্য এখন এক জায়গায়",
  showTabs = true,
  viewAllLink = "/categories"
}: { 
  products?: any[], 
  initialCategories?: any[],
  title?: string,
  subtitle?: string,
  description?: string,
  showTabs?: boolean,
  viewAllLink?: string
}) {
  const categories = [{ slug: "all", label: "সকল পণ্য" }, ...initialCategories];
  
  // Show all provided products
  const defaultProducts = products;

  return (
    <section className="pt-4 pb-12 md:py-12 bg-white container mx-auto px-4 lg:px-8 mb-4 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            {title} {subtitle && <span className="text-gray-500 font-normal text-xl">{subtitle}</span>}
          </h2>
          {description && <p className="text-gray-500">{description}</p>}
        </div>
        
        <Link 
          href={viewAllLink}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          সব দেখুন
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Tabs as Direct Page Links */}
      {showTabs && (
        <div className="flex overflow-x-auto pb-6 mb-2 gap-3 px-4 -mx-4 lg:px-0 lg:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.slug === 'all' ? '/categories' : `/category/${category.slug}`}
              className="shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] md:text-sm font-bold transition-all duration-300 bg-white border border-gray-200 text-gray-700 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:border-primary hover:text-primary hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] active:scale-95 flex items-center justify-center"
            >
              {category.label}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {defaultProducts.map((product, index) => (
          <ProductCard key={product._id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  );
}
