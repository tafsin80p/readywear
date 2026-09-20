import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import TikTokPixel from "@/components/TikTokPixel";
import PushNotificationManager from "@/components/PushNotificationManager";

const bengaliFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: 'swap',
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    const mongoose = (await import("mongoose")).default;
    const connectToDatabase = (await import("@/lib/mongodb")).default;
    const StoreSettings = (await import("@/models/StoreSettings")).default;
    
    await connectToDatabase();
    settings = await StoreSettings.findOne().lean();
  } catch (error) {
    console.error("Failed to fetch store settings for metadata", error);
  }

  const storeName = settings?.storeName || "Mehzin Offers";
  const storeTagline = settings?.storeTagline || "Premium E-commerce in Bangladesh";
  const storeDescription = settings?.storeDescription || "Mehzin Offers - স্টাইলের দেখা নতুন যাত্রা। সেরা মানের পোশাক ও প্রিমিয়াম ই-কমার্স অভিজ্ঞতা।";
  const favicon = settings?.favicon || "/favicon.ico";
  const ogImage = settings?.socialImage || settings?.headerLogo || "/readywear logo.png";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://readywear.com.bd'),
    title: {
      default: `${storeName} - ${storeTagline}`,
      template: `%s | ${storeName}`
    },
    description: storeDescription,
    keywords: [storeName, "E-commerce", "Bangladesh", "Fashion", "Clothing", "Premium Wear", "পাঞ্জাবি", "শার্ট"],
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: storeName,
    },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url: "/",
      siteName: storeName,
      title: `${storeName} - ${storeTagline}`,
      description: storeDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${storeName} Logo`,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeName} - ${storeTagline}`,
      description: storeDescription,
      images: [ogImage],
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let primaryColor = '#F5426A';
  let notificationTone = '';
  try {
    const mongoose = (await import("mongoose")).default;
    const connectToDatabase = (await import("@/lib/mongodb")).default;
    const StoreSettings = (await import("@/models/StoreSettings")).default;
    
    await connectToDatabase();
    const settings = await StoreSettings.findOne().lean();
    if (settings && settings.primaryColor) {
      primaryColor = settings.primaryColor;
    }
    if (settings && settings.notificationTone) {
      notificationTone = settings.notificationTone;
    }
  } catch (error) {
    console.error("Failed to fetch store settings in layout", error);
  }

  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
            }
          `
        }} />
      </head>
      <body className={`${bengaliFont.variable} antialiased font-sans`} suppressHydrationWarning>
        <GoogleAnalytics />
        <TikTokPixel />
        <PushNotificationManager toneUrl={notificationTone} />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
