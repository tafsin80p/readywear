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

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

  return (
    <Providers>
      <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden" suppressHydrationWarning>
        <AdminSidebar unreadOrdersCount={unreadOrdersCount} totalProductsCount={totalProductsCount} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </Providers>
  );
}
