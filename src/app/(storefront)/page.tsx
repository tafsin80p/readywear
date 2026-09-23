import { CollectionSection } from "@/components/CollectionSection";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function Home() {
  await connectToDatabase();
  const productsDocs = await Product.find({ status: 'published' }).sort({ createdAt: -1 }).limit(10).lean();
  const categoryDocs = await Category.find({ isActive: true }).lean();
  
  // Serialize Mongoose documents to plain JS objects for Client Components
  const products = JSON.parse(JSON.stringify(productsDocs));
  
  // Map categories to use 'label' for compatibility
  const categories = JSON.parse(JSON.stringify(categoryDocs)).map((cat: any) => ({
    ...cat,
    label: cat.name
  }));

  return (
    <>
      <main className="flex-1 bg-gray-50/30">
        <h1 className="sr-only">Mehzin Offers - Premium E-commerce in Bangladesh</h1>
        
        <div className="pt-2 pb-8 md:py-8 bg-gray-50/50">
          <CollectionSection products={products} initialCategories={categories} />
        </div>
      </main>
    </>
  );
}
