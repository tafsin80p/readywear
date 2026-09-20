import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";
import { Providers } from "@/components/Providers";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Viewport } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  await connectToDatabase();
  const unreadOrdersCount = await Order.countDocuments({ 
    $or: [
      { isRead: false },
      { isRead: { $exists: false } }
    ]
  });
  
  const totalProductsCount = await Product.countDocuments();
  
  const mongoose = (await import("mongoose")).default;
  let settings = null;
  try {
    settings = await mongoose.connection.db?.collection('storesettings').findOne();
  } catch (e) {
    console.error("Failed to fetch store settings for admin layout", e);
  }

  return (
    <Providers>
      <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden" suppressHydrationWarning>
        <AdminSidebar unreadOrdersCount={unreadOrdersCount} totalProductsCount={totalProductsCount} logo={settings?.headerLogo || "/readywear logo.png"} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <AdminHeader logo={settings?.headerLogo || "/readywear logo.png"} />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </Providers>
  );
}
