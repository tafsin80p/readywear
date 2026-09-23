import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { activityLogService } from "@/lib/services/activityLogService";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return false;
  }
  return true;
}

// GET all products
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Fetch products, sorted by newest first
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST a new product
export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await req.json();
    
    // Check if slug or SKU already exists
    const existingProduct = await Product.findOne({
      $or: [{ slug: body.slug }, { sku: body.sku }]
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Product with this slug or SKU already exists" },
        { status: 400 }
      );
    }

    // Create the product
    const product = new Product(body);
    const savedProduct = await product.save();

    // Log Activity
    activityLogService.logActivity({
      title: "New Product Added",
      message: `${savedProduct.name} (SKU: ${savedProduct.sku}) has been added.`,
      type: "product",
      link: `/admin/products/edit/${savedProduct._id}`,
    });

    // Clear the Next.js cache so the new product shows up instantly on the storefront
    revalidatePath('/');
    revalidatePath('/categories');

    return NextResponse.json(
      { message: "Product created successfully", product: savedProduct },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
