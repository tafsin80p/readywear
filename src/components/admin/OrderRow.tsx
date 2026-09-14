"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function OrderRow({ order, formattedDate }: { order: any, formattedDate: string }) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Pending</span>
          </div>
        );
      case 'processing':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/50">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            <span className="text-xs font-semibold">Processing</span>
          </div>
        );
      case 'shipped':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/50">
            <Truck className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Shipped</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Delivered</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200/50">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Cancelled</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200/50">
            <span className="text-xs font-semibold capitalize">{status}</span>
          </div>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            Paid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Refunded
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Unpaid
          </span>
        );
    }
  };

  const handleRowClick = () => {
    router.push(`/admin/orders/${order._id}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {order.userId?.image ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-sm">
              <Image src={order.userId.image} alt={order.customerInfo.firstName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
              {order.customerInfo.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">{order.customerInfo.firstName} {order.customerInfo.lastName || ''}</span>
            <span className="text-xs text-gray-500 mt-0.5">{order.customerInfo.phone}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          #{order.orderId}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
            <Image 
              src={order.items[0]?.image || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image"} 
              alt="Product" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[150px]" title={order.items[0]?.title}>
              {order.items[0]?.title}
            </span>
            {order.items.length > 1 && (
              <span className="text-[10px] text-gray-500 font-medium mt-0.5 bg-gray-100 w-fit px-1.5 rounded">
                +{order.items.length - 1} more
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-700">{formattedDate}</div>
      </td>
      <td className="px-6 py-4">
        <span className="font-bold text-gray-900 text-sm">৳ {order.pricing.total.toLocaleString('en-US')}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-row items-center gap-2">
          {getPaymentBadge(order.paymentStatus || 'unpaid')}
          <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">({order.paymentMethod})</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(order.status)}
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={(e) => {
            e.stopPropagation(); // prevent double navigation
            router.push(`/admin/orders/${order._id}`);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary hover:text-white hover:shadow-md transition-all"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
