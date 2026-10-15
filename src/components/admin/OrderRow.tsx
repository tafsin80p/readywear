"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Clock, Truck, CheckCircle, XCircle, AlertCircle, Send, CheckCircle2, ShieldAlert, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function OrderRow({ 
  order, 
  formattedDate,
  isSelected,
  onSelect
}: { 
  order: any, 
  formattedDate: string,
  isSelected?: boolean,
  onSelect?: () => void
}) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/50">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-semibold">Pending</span>
          </div>
        );
      case 'processing':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/50">
            <div className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            <span className="text-[11px] font-semibold">Processing</span>
          </div>
        );
      case 'shipped':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/50">
            <Truck className="w-3 h-3" />
            <span className="text-[11px] font-semibold">Shipped</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50">
            <CheckCircle className="w-3 h-3" />
            <span className="text-[11px] font-semibold">Delivered</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200/50">
            <XCircle className="w-3 h-3" />
            <span className="text-[11px] font-semibold">Cancelled</span>
          </div>
        );
      case 'returned':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200/50">
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px] font-semibold">Returned</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200/50">
            <span className="text-[11px] font-semibold capitalize">{status}</span>
          </div>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] 2xl:text-[11px] font-medium bg-emerald-100 text-emerald-800">
            Paid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] 2xl:text-[11px] font-medium bg-gray-100 text-gray-800">
            Refunded
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] 2xl:text-[11px] font-medium bg-amber-100 text-amber-800">
            Unpaid
          </span>
        );
    }
  };

  const getVerificationBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] 2xl:text-[11px] font-medium bg-green-100 text-green-700 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </div>
        );
      case 'fake':
        return (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] 2xl:text-[11px] font-medium bg-red-100 text-red-700 whitespace-nowrap">
            <ShieldAlert className="w-3 h-3" /> Fake
          </div>
        );
      case 'pending_verification':
      default:
        return (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] 2xl:text-[11px] font-medium bg-yellow-100 text-yellow-700 whitespace-nowrap">
            <AlertCircle className="w-3 h-3" /> Pending Verify
          </div>
        );
    }
  };

  const getMetaBadge = (status: string) => {
    if (status === 'sent') {
      return (
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] 2xl:text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">
          <div className="w-3 h-3 flex items-center justify-center font-bold text-[8px] bg-blue-600 text-white rounded-full">f</div>
          Sent
        </div>
      );
    }
    if (status === 'failed') {
      return (
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] 2xl:text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
          <div className="w-3 h-3 flex items-center justify-center font-bold text-[8px] bg-red-500 text-white rounded-full">f</div>
          Failed
        </div>
      );
    }
    return null;
  };

  const handleRowClick = () => {
    router.push(`/admin/orders/${order._id}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      className={`hover:bg-gray-50/80 transition-colors group cursor-pointer ${isSelected ? 'bg-red-50/30' : ''}`}
    >
      {onSelect && (
        <td className="px-3 2xl:px-4 py-3 w-8">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </td>
      )}
      <td className="px-3 2xl:px-4 py-3">
        <div className="flex items-center gap-2.5">
          {order.userId?.image ? (
            <div className="relative w-8 h-8 2xl:w-9 2xl:h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-sm">
              <Image src={order.userId.image} alt={order.customerInfo.firstName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs 2xl:text-sm shrink-0 border border-primary/20">
              {order.customerInfo.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 text-xs 2xl:text-sm truncate max-w-[105px] 2xl:max-w-[150px]" title={`${order.customerInfo.firstName} ${order.customerInfo.lastName || ''}`}>
              {order.customerInfo.firstName} {order.customerInfo.lastName || ''}
            </span>
            <span className="text-[11px] 2xl:text-xs text-gray-500">{order.customerInfo.phone}</span>
          </div>
        </div>
      </td>
      <td className="px-3 2xl:px-4 py-3">
        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors whitespace-nowrap">
          #{order.orderId}
        </span>
      </td>
      <td className="px-3 2xl:px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-10 2xl:w-9 2xl:h-11 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
            <Image 
              src={order.items[0]?.image || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image"} 
              alt="Product" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs 2xl:text-sm font-semibold text-gray-900 truncate max-w-[100px] 2xl:max-w-[160px]" title={order.items[0]?.title}>
              {order.items[0]?.title}
            </span>
            {order.items.length > 1 && (
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 w-fit px-1.5 rounded">
                +{order.items.length - 1} more
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 2xl:px-4 py-3 whitespace-nowrap">
        <div className="text-xs 2xl:text-sm font-medium text-gray-700">{formattedDate}</div>
      </td>
      <td className="px-3 2xl:px-4 py-3 whitespace-nowrap">
        <span className="font-bold text-gray-900 text-xs 2xl:text-sm">৳ {order.pricing.total.toLocaleString('en-US')}</span>
      </td>
      <td className="px-3 2xl:px-4 py-3 whitespace-nowrap">
        <div className="flex flex-row items-center gap-1.5">
          {getPaymentBadge(order.paymentStatus || 'unpaid')}
          <span className="text-[10px] 2xl:text-[11px] text-gray-500 uppercase tracking-wider font-semibold">({order.paymentMethod})</span>
        </div>
      </td>
      <td className="px-3 2xl:px-4 py-3">
        <div className="flex flex-col gap-1 items-start">
          {getStatusBadge(order.status)}
          {order.stockDeducted ? (
            <span className="inline-flex items-center text-[9px] 2xl:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
              ● Stock Deducted
            </span>
          ) : order.inventoryStatus === 'restocked' || order.status === 'cancelled' || order.verificationStatus === 'fake' ? (
            <span className="inline-flex items-center text-[9px] 2xl:text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 whitespace-nowrap">
              ● Restocked
            </span>
          ) : (
            <span className="inline-flex items-center text-[9px] 2xl:text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
              ● Stock Hold
            </span>
          )}
        </div>
      </td>
      <td className="px-3 2xl:px-4 py-3">
        <div className="flex flex-col gap-1 items-start">
          {getVerificationBadge(order.verificationStatus)}
          {getMetaBadge(order.metaEventStatus)}
        </div>
      </td>
      <td className="px-3 2xl:px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-[#f9fafb] z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.04)] transition-colors whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/orders/${order._id}/invoice`);
            }}
            className="inline-flex items-center justify-center w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white hover:shadow-md transition-all"
            title="View Invoice"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/orders/${order._id}`);
            }}
            className="inline-flex items-center justify-center w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary hover:text-white hover:shadow-md transition-all"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
