import { products } from "@/data/mock";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { ProductDetails } from "@/components/ProductDetails";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);
  const product = products.find(p => p.id === productId);

  if (!product) {
    notFound();
  }

  // Get related products (same category, excluding this one)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1 bg-gray-50/50 pb-24">
        <ProductDetails product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  );
}
