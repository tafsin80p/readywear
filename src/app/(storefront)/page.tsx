import { CollectionSection } from "@/components/CollectionSection";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();
  const productsDocs = await Product.find({}).sort({ createdAt: -1 }).limit(10).lean();
  
  // Serialize Mongoose documents to plain JS objects for Client Components
  const products = JSON.parse(JSON.stringify(productsDocs));

  return (
    <>
      <main className="flex-1 bg-gray-50/30">
        <h1 className="sr-only">ReadyWear - Premium E-commerce in Bangladesh</h1>
        
        <div className="pt-2 pb-8 md:py-8 bg-gray-50/50">
          <CollectionSection products={products} />
        </div>
      </main>
    </>
  );
}
