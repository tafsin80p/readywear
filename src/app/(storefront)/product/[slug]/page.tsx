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

  const description = product.description 
    ? product.description.slice(0, 150) + "..."
    : `Buy ${product.name} at ReadyWear. Best quality ${product.category} in Bangladesh. Price: ৳${product.price}. Shop now!`;

  return {
    title: `${product.name} - ReadyWear`,
    description: description,
    keywords: [product.name, product.category, 'ReadyWear', 'Bangladesh fashion', 'buy online', product.sku],
    openGraph: {
      title: product.name,
      description: description,
      url: `https://readywear.com.bd/product/${product.slug}`,
      siteName: 'ReadyWear',
      images: [
        {
          url: mainImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
        ...previousImages
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description,
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

  // Generate JSON-LD Structured Data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productDoc.name,
    image: productDoc.images,
    description: productDoc.description || `Buy ${productDoc.name} at ReadyWear.`,
    sku: productDoc.sku,
    brand: {
      '@type': 'Brand',
      name: 'ReadyWear'
    },
    offers: {
      '@type': 'Offer',
      url: `https://readywear.com.bd/product/${productDoc.slug}`,
      priceCurrency: 'BDT',
      price: productDoc.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: productDoc.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 bg-gray-50/50 pb-24">
        <ProductDetails product={product} relatedProducts={relatedProducts} />
      </main>
    </>
  );
}
