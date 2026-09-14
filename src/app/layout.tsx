import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";


const bengaliFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://readywear.com.bd'),
  title: {
    default: "ReadyWear - Premium E-commerce in Bangladesh",
    template: "%s | ReadyWear"
  },
  description: "ReadyWear - স্টাইলের দেখা নতুন যাত্রা। সেরা মানের পোশাক ও প্রিমিয়াম ই-কমার্স অভিজ্ঞতা।",
  keywords: ["ReadyWear", "E-commerce", "Bangladesh", "Fashion", "Clothing", "Premium Wear", "পাঞ্জাবি", "শার্ট"],
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "/",
    siteName: "ReadyWear",
    title: "ReadyWear - Premium E-commerce in Bangladesh",
    description: "ReadyWear - স্টাইলের দেখা নতুন যাত্রা। সেরা মানের পোশাক ও প্রিমিয়াম ই-কমার্স অভিজ্ঞতা।",
    images: [
      {
        url: "/icon.jpg",
        width: 800,
        height: 600,
        alt: "ReadyWear Logo",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadyWear - Premium E-commerce in Bangladesh",
    description: "ReadyWear - স্টাইলের দেখা নতুন যাত্রা।",
    images: ["/icon.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${bengaliFont.variable} antialiased font-sans`} suppressHydrationWarning>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
