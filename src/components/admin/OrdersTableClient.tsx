"use client";

import React, { useState } from "react";
import { OrderRow } from "./OrderRow";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/context/ConfirmContext";

export function OrdersTableClient({ orders }: { orders: any[] }) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    if (!(await confirm({
      title: "Delete Orders",
      message: `Are you sure you want to move ${selectedOrders.length} orders to trash?`,
      confirmText: "Yes, Delete",
      variant: "danger"
    }))) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting orders...");
    try {
      const res = await fetch("/api/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadingToast });
        setSelectedOrders([]);
        router.refresh(); // Refresh page to remove deleted items
      } else {
        toast.error(data.message || "Failed to delete", { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="w-full">
      {selectedOrders.length > 0 && (
        <div className="bg-red-50 px-6 py-3 flex items-center justify-between border-y border-red-100">
          <span className="text-sm font-medium text-red-800">
            {selectedOrders.length} order(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
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
              <th className="px-6 py-4 whitespace-nowrap">Customer Info</th>
              <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
              <th className="px-6 py-4 whitespace-nowrap">Product</th>
              <th className="px-6 py-4 whitespace-nowrap">Date</th>
              <th className="px-6 py-4 whitespace-nowrap">Total Bill</th>
              <th className="px-6 py-4 whitespace-nowrap">Payment</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 whitespace-nowrap">Verification & Meta</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center text-gray-500">
                  No active orders found.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <OrderRow 
                  key={order._id.toString()}
                  order={order}
                  formattedDate={formatDate(order.createdAt)}
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
