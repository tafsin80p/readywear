import React from "react";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { ArrowLeft, Mail, Calendar, Phone, MapPin, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const formatDate = (date: Date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  
  const user = await User.findById(id).lean();
  
  if (!user) {
    notFound();
  }

  const rawOrders = await Order.find({ userId: id }).sort({ createdAt: -1 }).lean();
  const orders = JSON.parse(JSON.stringify(rawOrders));

  const totalSpent = orders
    .filter((o: any) => o.status !== "cancelled")
    .reduce((sum: number, order: any) => sum + order.pricing.total, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
        <div>
          <Link href="/admin/customers" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Customers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-6 h-fit shadow-sm">
          <div className="flex flex-col items-center text-center">
            {user.image ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-50 shadow-sm">
                <Image src={user.image} alt={user.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-4 border-4 border-primary/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="inline-flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4" />
              Joined {formatDate(user.createdAt)}
            </div>
            
            <div className="flex gap-4 mt-6 w-full pt-6 border-t border-gray-100">
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-px bg-gray-100"></div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-xl font-bold text-primary">৳ {totalSpent.toLocaleString('en-US')}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            {/* Find the most recent address used by this customer */}
            {orders.length > 0 && orders[0].customerInfo && (
              <>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Last Phone Used</p>
                    <p className="text-sm font-medium text-gray-900">{orders[0].customerInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Last Delivery Address</p>
                    <p className="text-sm font-medium text-gray-900">{orders[0].customerInfo.address}</p>
                    <p className="text-xs text-gray-500 capitalize">{orders[0].customerInfo.area} Dhaka</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="col-span-1 xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900">Order History</h3>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {orders.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  This customer hasn't placed any orders yet.
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <Link href={`/admin/orders/${order._id}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                          Order #{order.orderId}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                          ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'}`}
                        >
                          {order.status}
                        </span>
                        <span className="font-bold text-gray-900">৳ {order.pricing.total.toLocaleString('en-US')}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        Items Ordered ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 border border-gray-200">
                              <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-gray-500">
                                {item.size && <span>Size: <span className="font-medium text-gray-700">{item.size}</span></span>}
                                {item.color && <span>Color: <span className="font-medium text-gray-700">{item.color}</span></span>}
                                <span>Qty: <span className="font-medium text-gray-700">{item.quantity}</span></span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 pr-2">
                              <p className="text-sm font-bold text-gray-900">৳ {(item.price * item.quantity).toLocaleString('en-US')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
