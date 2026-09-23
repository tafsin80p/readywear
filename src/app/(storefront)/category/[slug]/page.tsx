import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { CategorySidebar } from "@/components/CategorySidebar";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60; // Cache for 60 seconds (ISR)

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const activeSlug = resolvedParams.slug;
  
  await connectToDatabase();
  const activeCategoryObj = await Category.findOne({ slug: activeSlug }).lean();

  if (!activeCategoryObj) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: activeCategoryObj.name,
    description: `Shop the best ${activeCategoryObj.name} collection at Mehzin Offers. Premium quality clothing in Bangladesh.`,
    openGraph: {
      title: `${activeCategoryObj.name} Collection | Mehzin Offers`,
      description: `Shop the best ${activeCategoryObj.name} collection at Mehzin Offers.`,
    },
  };
}

export default async function CategoryShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const activeSlug = resolvedParams.slug;
  
  await connectToDatabase();
  const activeCategoryObj = await Category.findOne({ slug: activeSlug }).lean();
  
  if (!activeCategoryObj) {
    notFound();
  }
  
  const activeCategoryLabel = activeCategoryObj.name;
  
  // Fetch products that belong to this category by slug (limited for performance)
  const productsDocs = await Product.find({ category: activeCategoryObj.slug, status: 'published' })
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();
    
  const totalCount = await Product.countDocuments({ category: activeCategoryObj.slug, status: 'published' });
  
  const filteredProducts = JSON.parse(JSON.stringify(productsDocs));

  // Fetch subcategories
  const subCategoriesDocs = await Category.find({ 
    parentCategory: activeCategoryObj.slug,
    isActive: true
  }).lean();
  const subCategories = JSON.parse(JSON.stringify(subCategoriesDocs));

  // Fetch ALL categories for the sidebar
  const allCategoriesDocs = await Category.find({ isActive: true }).lean();
  const allCategories = JSON.parse(JSON.stringify(allCategoriesDocs));

  return (
    <>
      <main className="flex-1 bg-gray-50/30 pb-24 pt-4 md:pt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <CategorySidebar categories={allCategories} activeSlug={activeSlug} />

            {/* Product Grid */}
            <div className="flex-1 mt-4 md:mt-0">
              <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hidden md:flex">
                <h1 className="text-xl font-bold text-gray-900">{activeCategoryLabel}</h1>
                <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{totalCount} টি পণ্য</span>
              </div>
              
              <div className="mb-4 flex justify-between items-center md:hidden">
                <h1 className="text-lg font-bold text-gray-900">{activeCategoryLabel}</h1>
                <span className="text-xs font-medium text-gray-500">{totalCount} টি পণ্য</span>
              </div>
              
              {/* Removed duplicate Subcategories Tabs since they are now in the sidebar */}
              
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                  {filteredProducts.map((product: any, index: number) => (
                    <ProductCard key={product._id} product={product} priority={index < 2} />
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
