import { categoryData, products } from "@/data/mock";
import { ProductCard } from "@/components/ProductCard";

import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ShopPage() {
  const activeSlug = "all";
  const activeCategoryLabel = "সকল পণ্য";

  const categories = [{ slug: "all", label: "সকল পণ্য" }, ...categoryData];
  const filteredProducts = products;

  return (
    <>
      <main className="flex-1 bg-gray-50/30 pb-24 pt-4 md:pt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-28">
                <h3 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-100 pb-2">ক্যাটাগরি সমূহ</h3>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat.slug}>
                      <Link
                        href={cat.slug === 'all' ? '/categories' : `/category/${cat.slug}`}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          activeSlug === cat.slug ? "bg-primary/10 text-primary font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Mobile Horizontal Tabs */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sticky top-[72px] z-30 bg-gray-50/90 backdrop-blur-md pt-2">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={cat.slug === 'all' ? '/categories' : `/category/${cat.slug}`}
                  className={cn(
                    "shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors",
                    activeSlug === cat.slug ? "bg-primary text-white shadow-sm shadow-primary/20" : "bg-white text-gray-600 border border-gray-200"
                  )}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Product Grid */}
            <div className="flex-1 mt-4 md:mt-0">
              <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hidden md:flex">
                <h1 className="text-xl font-bold text-gray-900">{activeCategoryLabel}</h1>
                <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{filteredProducts.length} টি পণ্য</span>
              </div>
              
              <div className="mb-4 flex justify-between items-center md:hidden">
                <h1 className="text-lg font-bold text-gray-900">{activeCategoryLabel}</h1>
                <span className="text-xs font-medium text-gray-500">{filteredProducts.length} টি পণ্য</span>
              </div>
              
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-medium text-gray-500">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
