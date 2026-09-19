import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import { Types } from "mongoose";
import { activityLogService } from "@/lib/services/activityLogService";

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// Static fallback categories to seed if DB is empty
const STATIC_CATEGORIES = [
  { slug: "saree", name: "শাড়ি (Saree)" },
  { slug: "dress", name: "ড্রেস (Dress)" },
  { slug: "baby-dress", name: "বেবি ড্রেস (Baby Dress)" },
  { slug: "panjabi", name: "পাঞ্জাবি (Panjabi)" },
  { slug: "combo-offer", name: "কম্বো অফার (Combo Offer)" },
];

export async function GET() {
  try {
    await connectToDatabase();
    let categories = await Category.find({}).sort({ createdAt: -1 }).lean();

    // Auto-seed logic: if completely empty, insert the static ones
    if (categories.length === 0) {
      await Category.insertMany(STATIC_CATEGORIES);
      categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, image } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: "Name and slug are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const newCategory = new Category({ name, slug, image });
    const savedCategory = await newCategory.save();

    // Log Activity
    activityLogService.logActivity({
      title: "New Category Added",
      message: `${savedCategory.name} category has been created.`,
      type: "category",
      link: `/admin/categories`,
    });

    return NextResponse.json(
      { success: true, message: "Category created successfully", category: savedCategory },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category", error: error.message },
      { status: 500 }
    );
  }
}
