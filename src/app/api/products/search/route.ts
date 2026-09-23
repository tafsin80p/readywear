import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({ success: true, products: [] });
    }

    await connectToDatabase();

    const searchRegex = new RegExp(query.trim(), 'i');

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
      ],
      status: 'published',
    })
      .select('name sku price oldPrice images category _id slug')
      .limit(10)
      .lean();

    // Map _id to id, and name to title, images[0] to image for compatibility with the frontend components
    const mappedProducts = products.map((p: any) => ({
      id: p._id.toString(),
      title: p.name,
      sku: p.sku,
      price: p.price,
      oldPrice: p.oldPrice,
      category: p.category,
      image: p.images && p.images.length > 0 ? p.images[0] : '',
      slug: p.slug
    }));

    return NextResponse.json({ success: true, products: mappedProducts });
  } catch (error) {
    console.error("Products search API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search products" },
      { status: 500 }
    );
  }
}
