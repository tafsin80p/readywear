import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Only logged in users can upload
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file, folder, type } = await request.json();

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Build the folder path
    // Default: "readywear"
    // Product: "readywear/products/{product-slug}/featured" or "readywear/products/{product-slug}/gallery"
    const uploadFolder = folder || "readywear";

    // Upload to Cloudinary
    const uploadOptions: any = {
      folder: uploadFolder,
      resource_type: "auto",
    };

    // If it's explicitly not an audio file, we force webp optimization
    if (type !== "audio") {
      uploadOptions.format = "webp";
    } else {
      uploadOptions.resource_type = "video"; // Cloudinary uses video for audio
    }

    const uploadResponse = await cloudinary.uploader.upload(file, uploadOptions);

    return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
