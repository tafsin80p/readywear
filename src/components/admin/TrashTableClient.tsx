"use client";

import React, { useState } from "react";
import { OrderRow } from "./OrderRow";
import { Trash2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/context/ConfirmContext";

export function TrashTableClient({ orders }: { orders: any[] }) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(o => o._id.toString()));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAction = async (action: 'restore' | 'delete') => {
    if (selectedOrders.length === 0) return;
    
    if (action === 'delete') {
      if (!(await confirm({
        title: "Permanent Delete",
        message: `Are you sure you want to PERMANENTLY delete ${selectedOrders.length} orders? This action cannot be undone.`,
        confirmText: "Yes, Delete Permanently",
        variant: "danger"
      }))) return;
    } else {
      if (!(await confirm({
        title: "Restore Orders",
        message: `Restore ${selectedOrders.length} orders to active list?`,
        confirmText: "Yes, Restore",
        variant: "info"
      }))) return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading(action === 'delete' ? "Deleting permanently..." : "Restoring orders...");
    
    const endpoint = action === 'delete' ? "/api/orders/bulk-trash-delete" : "/api/orders/bulk-trash-restore";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadingToast });
        setSelectedOrders([]);
        router.refresh(); // Refresh page to reflect changes
      } else {
        toast.error(data.message || `Failed to ${action}`, { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="w-full">
      {selectedOrders.length > 0 && (
        <div className="bg-red-50 px-6 py-3 flex items-center justify-between border-y border-red-100">
          <span className="text-sm font-medium text-red-800">
            {selectedOrders.length} order(s) selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => handleBulkAction('restore')}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Restore
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Permanently
            </button>
          </div>
        </div>
      )}
      <div className="w-full bg-white border-y border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <th className="px-6 py-4 whitespace-nowrap w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4 whitespace-nowrap">Deleted At</th>
              <th className="px-6 py-4 whitespace-nowrap">Customer Info</th>
              <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
              <th className="px-6 py-4 whitespace-nowrap">Product</th>
              <th className="px-6 py-4 whitespace-nowrap">Total Bill</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 whitespace-nowrap">Verification & Meta</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center text-gray-500">
                  Trash is empty.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <OrderRow 
                  key={order._id.toString()}
                  order={order}
                  formattedDate={formatDate(order.deletedAt || order.createdAt)}
                  isSelected={selectedOrders.includes(order._id.toString())}
                  onSelect={() => handleSelectOrder(order._id.toString())}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
