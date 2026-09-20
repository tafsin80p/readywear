import { MetadataRoute } from 'next'
import connectToDatabase from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let settings = null;
  try {
    await connectToDatabase();
    settings = await StoreSettings.findOne().lean();
  } catch (error) {
    console.error("Failed to fetch store settings for manifest", error);
  }
  
  const storeName = settings?.storeName || "Mehzin Offers";
  const storeDescription = settings?.storeDescription || "Mehzin Offers - Premium E-commerce in Bangladesh";
  const iconUrl = settings?.favicon || settings?.headerLogo || "/favicon.ico";

  return {
    name: storeName,
    short_name: storeName.split(' ')[0],
    description: storeDescription,
    start_url: '/',
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
  }
}
