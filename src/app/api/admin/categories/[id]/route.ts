import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product"; // To check if category is in use

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    
    await connectToDatabase();
    
    // Check if updating to a slug that already exists for another category
    if (body.slug) {
      const existingCategory = await Category.findOne({ 
        slug: body.slug,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: "A category with this slug already exists" },
          { status: 400 }
        );
      }
    }
    
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    // If slug is changed, we ideally should update all products with this category slug.
    // For simplicity, we just apply the update here.
    Object.assign(category, body);
    await category.save();
    
    return NextResponse.json({ success: true, message: "Category updated", category });
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    
    // Check if any products are using this category
    const productsUsingCategory = await Product.countDocuments({ category: category.slug });
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete: ${productsUsingCategory} product(s) are using this category.` },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category", error: error.message },
      { status: 500 }
    );
  }
}
