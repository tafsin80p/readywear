import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function GET() {
  let settings = null;
  try {
    await connectToDatabase();
    settings = await StoreSettings.findOne().lean();
  } catch (error) {
    console.error("Failed to fetch store settings for admin manifest", error);
  }
  
  const storeName = settings?.storeName || "Mehzin Offers";
  const iconUrl = settings?.favicon || settings?.headerLogo || "/favicon.ico";

  const manifest = {
    name: `${storeName} Admin`,
    short_name: "Admin",
    description: `Admin Dashboard for ${storeName}`,
    start_url: '/admin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  };

  return NextResponse.json(manifest);
}
