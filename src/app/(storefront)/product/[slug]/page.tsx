import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import { Metadata, ResolvingMetadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  
  await connectToDatabase();
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const product = await Product.findOne({ slug: decodedSlug }).lean();

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  // Optionally access and extend parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const mainImage = product.images?.[0] || "";

  return {
    title: product.name,
    description: `Buy ${product.name} at ReadyWear. Price: ৳${product.price}. Category: ${product.category}.`,
    openGraph: {
      title: product.name,
      description: `Buy ${product.name} at ReadyWear. Price: ৳${product.price}.`,
      images: [mainImage, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Buy ${product.name} at ReadyWear. Price: ৳${product.price}.`,
      images: [mainImage],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  await connectToDatabase();
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const productDoc = await Product.findOne({ slug: decodedSlug }).lean();

  if (!productDoc) {
    notFound();
  }

  // Get related products (same category, excluding this one)
  const relatedDocs = await Product.find({ 
    category: productDoc.category,
    _id: { $ne: productDoc._id }
  }).limit(4).lean();

  // Serialize documents for Client Component
  const product = JSON.parse(JSON.stringify(productDoc));
  const relatedProducts = JSON.parse(JSON.stringify(relatedDocs));

  return (
    <>
      <main className="flex-1 bg-gray-50/50 pb-24">
        <ProductDetails product={product} relatedProducts={relatedProducts} />
      </main>
    </>
  );
}
