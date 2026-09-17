import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch categories with active status
    const categories = await Category.find({ isActive: true })
      .select('name slug description image parentCategory isActive isFeatured')
      .lean();
      
    // Transform to match the shape expected by frontend (label instead of name, etc)
    const transformedCategories = categories.map((cat: any) => ({
      ...cat,
      _id: cat._id.toString(),
      label: cat.name // map name to label for compatibility with older frontend mock data format
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories
    });

  } catch (error: any) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
