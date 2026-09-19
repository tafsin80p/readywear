import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { activityLogService } from "@/lib/services/activityLogService";

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// GET single product
export async function GET(
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
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Fetch product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) single product
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    
    await connectToDatabase();
    
    // Check if updating to a slug that already exists for another product
    if (body.slug) {
      const existingProduct = await Product.findOne({ 
        slug: body.slug,
        _id: { $ne: id }
      });
      
      if (existingProduct) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 400 }
        );
      }
    }
    
    // Check SKU uniqueness
    if (body.sku) {
      const existingSku = await Product.findOne({ 
        sku: body.sku,
        _id: { $ne: id }
      });
      
      if (existingSku) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 400 }
        );
      }
    }
    
    // Find and update the product. Note: pre('save') hooks don't run on findByIdAndUpdate by default
    // unless you pass runValidators, but for complex hooks it's better to fetch, update, and save.
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Apply updates
    Object.assign(product, body);
    await product.save();
    
    // Log Activity
    activityLogService.logActivity({
      title: "Product Updated",
      message: `${product.name} (SKU: ${product.sku}) has been updated.`,
      type: "product",
      link: `/admin/products/edit/${product._id}`,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Update product error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate key error. Product name, slug, or SKU might already exist." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE single product
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Log Activity
    activityLogService.logActivity({
      title: "Product Deleted",
      message: `${deletedProduct.name} (SKU: ${deletedProduct.sku}) has been deleted.`,
      type: "product",
      link: `/admin/products`,
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error.message },
      { status: 500 }
    );
  }
}
