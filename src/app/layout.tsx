import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { MobileNavbar } from "@/components/MobileNavbar";
import { Providers } from "@/components/Providers";
import { CartSidebar } from "@/components/CartSidebar";
import { LoginModal } from "@/components/LoginModal";
import { SearchModal } from "@/components/SearchModal";

const bengaliFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: "ReadyWear - Premium E-commerce",
  description: "স্টাইলের দেখা নতুন যাত্রা",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={`${bengaliFont.variable} antialiased font-sans min-h-full flex flex-col pb-16 md:pb-0`} suppressHydrationWarning>
        <Providers>
          {children}
          <MobileNavbar />
          <CartSidebar />
          <LoginModal />
          <SearchModal />
        </Providers>
      </body>
    </html>
  );
}
