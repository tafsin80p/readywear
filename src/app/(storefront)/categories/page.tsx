import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ProductCard } from "@/components/ProductCard";
import { CategorySidebar } from "@/components/CategorySidebar";

import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function ShopPage() {
  await connectToDatabase();
  
  const categoryDocs = await Category.find({ isActive: true }).lean();
  const activeSlug = "all";
  const activeCategoryLabel = "সকল পণ্য";

  const dbCategories = JSON.parse(JSON.stringify(categoryDocs)).map((cat: any) => ({
    ...cat,
    label: cat.name
  }));
  
  const productsDocs = await Product.find({ status: 'published' }).sort({ createdAt: -1 }).lean();
  const filteredProducts = JSON.parse(JSON.stringify(productsDocs));

  return (
    <>
      <main className="flex-1 bg-gray-50/30 pb-24 pt-4 md:pt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <CategorySidebar categories={dbCategories} activeSlug={activeSlug} />

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
                  {filteredProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product as any} />
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
