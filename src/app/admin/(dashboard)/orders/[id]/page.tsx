import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, User, Calendar, CreditCard, ShoppingBag, Hash, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const formatDate = (date: Date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();
  const order = await Order.findById(id).populate('userId', 'image name').lean() as any;
  
  if (!order) {
    notFound();
  }

  // Mark order as read if it isn't already (handles both false and missing/undefined)
  if (!order.isRead) {
    await Order.findByIdAndUpdate(id, { isRead: true });
    // Note: since this is a Server Component, Next.js will cache the initial unread state on the client navigation if not careful, 
    // but the layout will refresh on the next navigation or refresh.
  }

  return (
    <div className="w-full flex flex-col bg-gray-50/50 min-h-screen">
      
      {/* Admin Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Order #{order.orderId}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center">
          <OrderStatusUpdater 
            orderId={order._id.toString()} 
            currentStatus={order.status} 
            currentPaymentStatus={order.paymentStatus || 'unpaid'} 
          />
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Info - Left (Takes up 2/3) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Order Progress Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">Delivery Progress</h2>
              
              {order.status === 'cancelled' ? (
                <div className="flex flex-col items-center justify-center py-6 text-red-500 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="w-10 h-10 mb-2" />
                  <p className="font-bold text-lg">Order Cancelled</p>
                  <p className="text-sm text-red-400 mt-1">This order has been cancelled and will not be delivered.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-in-out"
                      style={{ 
                        width: order.status === 'pending' ? '0%' : 
                               order.status === 'processing' ? '33%' : 
                               order.status === 'shipped' ? '66%' : 
                               '100%' 
                      }}
                    />
                  </div>
                  
                  <div className="relative flex justify-between">
                    {[
                      { id: 'pending', label: 'Order Placed', icon: ShoppingBag, completed: true },
                      { id: 'processing', label: 'Processing', icon: Package, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
                      { id: 'shipped', label: 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(order.status) },
                      { id: 'delivered', label: 'Delivered', icon: CheckCircle2, completed: order.status === 'delivered' },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-24">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${
                            step.completed ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-semibold text-center ${
                            step.completed ? 'text-gray-900' : 'text-gray-400'
                          }`}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Ordered Items Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Products ({order.items.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-gray-500">
                      <th className="px-5 py-3 font-medium whitespace-nowrap">Item</th>
                      <th className="px-5 py-3 font-medium whitespace-nowrap">Details</th>
                      <th className="px-5 py-3 font-medium whitespace-nowrap">Cost</th>
                      <th className="px-5 py-3 font-medium whitespace-nowrap text-center">Qty</th>
                      <th className="px-5 py-3 font-medium whitespace-nowrap text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-16 bg-gray-100 border border-gray-200 shrink-0">
                              <Image 
                                src={item.image || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image"} 
                                alt={item.title} 
                                fill 
                                className="object-cover" 
                              />
                            </div>
                            <span className="font-semibold text-gray-900 max-w-[200px] truncate" title={item.title}>
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {item.size && <div className="text-xs">Size: <span className="font-medium text-gray-900">{item.size}</span></div>}
                          {item.color && <div className="text-xs mt-1">Color: <span className="font-medium text-gray-900">{item.color}</span></div>}
                          {item.productId && <div className="text-[10px] text-gray-400 mt-1 uppercase">ID: {item.productId.substring(0, 8)}</div>}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">
                          ৳ {item.price.toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="bg-gray-100 text-gray-800 font-semibold px-2 py-0.5 rounded text-xs">
                            x{item.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-gray-900">
                          ৳ {(item.price * item.quantity).toLocaleString('en-US')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col items-end">
              <div className="w-full sm:w-1/2 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">৳ {order.pricing.subtotal.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-medium text-gray-900">৳ {order.pricing.deliveryCharge.toLocaleString('en-US')}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-900 uppercase">Grand Total</span>
                    <span className="font-black text-primary text-lg">৳ {order.pricing.total.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Sidebar - Right (Takes up 1/3) */}
          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Customer Details</h2>
              </div>
              <div className="p-5 space-y-4 text-sm">
                
                <div className="flex items-start gap-3">
                  {order.userId?.image ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-200">
                      <Image src={order.userId.image} alt={order.customerInfo.firstName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {order.customerInfo.firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{order.customerInfo.firstName} {order.customerInfo.lastName || ''}</p>
                    <p className="text-gray-500 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customerInfo.phone}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{order.customerInfo.address}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded">
                        {order.customerInfo.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Payment & Other Info */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Payment Info</h2>
              </div>
              <div className="p-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Method</p>
                  <p className="font-semibold text-gray-900 uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Customer Note */}
            {order.customerInfo.note && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-amber-200/50 bg-amber-100/50">
                  <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Customer Note</h2>
                </div>
                <div className="p-5 text-sm text-amber-900 italic">
                  "{order.customerInfo.note}"
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
