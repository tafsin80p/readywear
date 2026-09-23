import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { activityLogService } from "@/lib/services/activityLogService";
import { revalidatePath } from "next/cache";

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    
    const product = await Product.findById(id).lean();
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Create new product data based on the original
    const duplicateData: any = { ...product };
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.__v;
    
    // Modify for duplicate
    duplicateData.name = `${duplicateData.name} copy`;
    duplicateData.status = "draft";
    
    // Ensure unique SKU and Slug by appending a short random string
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    duplicateData.sku = `${duplicateData.sku}-copy-${randomSuffix}`;
    duplicateData.slug = `${duplicateData.slug}-copy-${randomSuffix}`;
    
    const newProduct = new Product(duplicateData);
    await newProduct.save();
    
    // Log Activity
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await activityLogService.logActivity(
        session.user.id,
        'create',
        'Product',
        newProduct._id.toString(),
        `Duplicated product: ${newProduct.name}`,
        req
      );
    }
    
    revalidatePath("/");
    revalidatePath("/(storefront)", "layout");
    
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Duplicate product error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate product", details: error.message },
      { status: 500 }
    );
  }
}
