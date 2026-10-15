"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Printer, ChevronDown, Trash2, Send, Package, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "@/context/ConfirmContext";

interface Option {
  value: string;
  label: string;
}

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  disabled 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: Option[];
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between min-w-[100px] sm:w-36 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg p-2 font-medium shadow-sm transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-primary/20 border-primary' : 'focus:ring-2 focus:ring-primary/20'}
        `}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50
                ${value === option.value ? 'bg-primary/5 text-primary font-semibold' : 'text-gray-700 font-medium'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface OrderStatusUpdaterProps {
  orderId: string; // This is the MongoDB _id
  currentStatus: string;
  currentPaymentStatus: string;
  verificationStatus?: string;
  courierStatus?: "unassigned" | "dispatched";
  dispatchedTo?: "pathao" | "steadfast" | undefined;
  consignmentId?: string;
  canDelete?: boolean;
}

export function OrderStatusUpdater({ 
  orderId, 
  currentStatus, 
  currentPaymentStatus, 
  verificationStatus = "pending_verification",
  courierStatus = "unassigned",
  dispatchedTo,
  consignmentId,
  canDelete = true
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<"pathao" | "steadfast">("steadfast");

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnRestock, setReturnRestock] = useState(true);
  const [returnRefund, setReturnRefund] = useState(currentPaymentStatus !== 'refunded');
  const [returnReason, setReturnReason] = useState("Customer Return");
  const [returnNotes, setReturnNotes] = useState("");

  // Check if anything actually changed
  const hasChanges = status !== currentStatus || paymentStatus !== currentPaymentStatus;

  const executeUpdate = async (payload: any) => {
    setIsUpdating(true);
    const loadingToast = toast.loading("Updating order...");
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      toast.success(
        payload.status === 'returned'
          ? (payload.restockInventory ? "Order marked as Returned & stock restocked!" : "Order marked as Returned!")
          : "Order updated successfully!",
        { id: loadingToast }
      );
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update order", { id: loadingToast });
      
      // Revert local state on error
      setStatus(currentStatus);
      setPaymentStatus(currentPaymentStatus);
    } finally {
      setIsUpdating(false);
      setShowReturnModal(false);
    }
  };

  const handleUpdate = async () => {
    if (!hasChanges) return;
    
    // If updating to returned, open return modal for detailed options
    if (status === 'returned' && currentStatus !== 'returned') {
      setShowReturnModal(true);
      return;
    }

    await executeUpdate({ status, paymentStatus });
  };

  const handleConfirmReturn = async () => {
    await executeUpdate({
      status: 'returned',
      paymentStatus: returnRefund ? 'refunded' : paymentStatus,
      restockInventory: returnRestock,
      returnReason,
      returnNotes,
    });
  };

  const handleDelete = async () => {
    if (!(await confirm({
      title: "Delete Order",
      message: "Are you sure you want to delete this order? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger"
    }))) {
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading("Deleting order...");
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      toast.success("Order deleted successfully!", { id: loadingToast });
      router.push("/admin/orders");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete order", { id: loadingToast });
      setIsUpdating(false);
    }
  };

  const handleVerification = async (action: 'confirm' | 'fake') => {
    if (!(await confirm({
      title: action === 'confirm' ? "Confirm Order" : "Mark as Fake",
      message: `Are you sure you want to ${action === 'confirm' ? 'confirm' : 'mark this order as fake'}?`,
      confirmText: action === 'confirm' ? "Yes, Confirm" : "Mark as Fake",
      variant: action === 'confirm' ? "info" : "warning"
    }))) {
      return;
    }
    
    setIsUpdating(true);
    const loadingToast = toast.loading(`${action === 'confirm' ? 'Confirming' : 'Marking fake'}...`);
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify order");

      toast.success(`Order ${action === 'confirm' ? 'confirmed' : 'marked fake'} successfully!`, { id: loadingToast });
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to verify order", { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDispatch = async () => {
    setIsUpdating(true);
    const loadingToast = toast.loading(`Dispatching to ${selectedCourier}...`);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier: selectedCourier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to dispatch order");
      
      toast.success(data.message || "Order dispatched successfully!", { id: loadingToast });
      setShowDispatchModal(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to dispatch order", { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full xl:w-auto">
      
      {/* Actions: Verification Actions, Delete, Print */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Verification Actions */}
        {verificationStatus === 'pending_verification' && (
          <div className="flex items-center gap-2">
             <button 
               onClick={() => handleVerification('confirm')}
               disabled={isUpdating}
               className="px-2 sm:px-3 py-1.5 bg-green-50 text-green-700 text-[10px] sm:text-xs font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
             >
               Confirm
             </button>
             <button 
               onClick={() => handleVerification('fake')}
               disabled={isUpdating}
               className="px-2 sm:px-3 py-1.5 bg-red-50 text-red-700 text-[10px] sm:text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
             >
               Fake
             </button>
          </div>
        )}

        {verificationStatus === 'confirmed' && (
          <span className="px-2 sm:px-3 py-1.5 bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold rounded-lg border border-green-200 whitespace-nowrap">
            Verified
          </span>
        )}
        
        {verificationStatus === 'fake' && (
          <span className="px-2 sm:px-3 py-1.5 bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold rounded-lg border border-red-200 whitespace-nowrap">
            Marked Fake
          </span>
        )}

        {/* Courier Dispatch Actions */}
        {courierStatus === 'unassigned' && verificationStatus === 'confirmed' && (
          <button 
            onClick={() => setShowDispatchModal(true)}
            disabled={isUpdating}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white text-[10px] sm:text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md disabled:opacity-50"
            title="Dispatch to Courier"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dispatch</span>
          </button>
        )}

        {courierStatus === 'dispatched' && (
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-sm font-semibold rounded-lg shadow-sm whitespace-nowrap">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <span>
              Dispatched via <span className="capitalize">{dispatchedTo}</span>
            </span>
            {consignmentId && (
              <span className="bg-white px-2 py-0.5 rounded text-blue-800 border border-blue-100 font-mono ml-1">
                {consignmentId}
              </span>
            )}
          </div>
        )}

        {/* Delete Button (Admin Only) */}
        {canDelete && (
          <button 
            onClick={handleDelete}
            disabled={isUpdating}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-red-200 text-red-600 text-[10px] sm:text-sm font-semibold rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm disabled:opacity-50"
            title="Delete Order"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}

        {/* Invoice Button */}
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 text-gray-700 text-[10px] sm:text-sm font-semibold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          title="Print Invoice"
        >
          <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Invoice</span>
        </button>
      </div>

      {/* Status Dropdowns & Update Button */}
      <div className="flex flex-row items-center gap-2 flex-wrap sm:flex-nowrap pb-1 sm:pb-0">
        <CustomSelect
          value={status}
          onChange={setStatus}
          disabled={isUpdating}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'returned', label: 'Returned' },
          ]}
        />

        <CustomSelect
          value={paymentStatus}
          onChange={setPaymentStatus}
          disabled={isUpdating}
          options={[
            { value: 'unpaid', label: 'Unpaid' },
            { value: 'paid', label: 'Paid' },
            { value: 'refunded', label: 'Refunded' },
          ]}
        />

        <button
          onClick={handleUpdate}
          disabled={isUpdating || !hasChanges}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-bold rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0 ${
            hasChanges && !isUpdating
              ? "bg-primary text-white hover:bg-primary/90 hover:shadow" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUpdating ? (
            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
          Update
        </button>
      </div>

      {/* Return & Restock Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-orange-50 text-orange-600">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">প্রোডাক্ট রিটার্ন ও রিস্টক</h3>
                  <p className="text-gray-500 font-medium text-xs mt-0.5">রিটার্ন ও ইনভেন্টরি সমন্বয় নিশ্চিত করুন</p>
                </div>
              </div>

              <div className="space-y-3.5 my-4">
                {/* Restock Toggle */}
                <label className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="checkbox"
                    checked={returnRestock}
                    onChange={(e) => setReturnRestock(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">ইনভেন্টরিতে স্টক যোগ করুন (Restock)</span>
                    <span className="text-xs text-gray-500 mt-0.5">পণ্যটি পুনরায় বিক্রয়যোগ্য হলে চেক রাখুন (স্টক স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে)।</span>
                  </div>
                </label>

                {/* Refund Toggle */}
                <label className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="checkbox"
                    checked={returnRefund}
                    onChange={(e) => setReturnRefund(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">পেমেন্ট রিফান্ডেড (Refunded) করুন</span>
                    <span className="text-xs text-gray-500 mt-0.5">কাস্টমারকে টাকা ফেরত দেওয়া হলে বা রিফান্ড রেকর্ড রাখতে চেক রাখুন।</span>
                  </div>
                </label>

                {/* Return Reason */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">রিটার্নের কারণ (Return Reason)</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Customer Return">কাস্টমার ফেরত দিয়েছেন (Customer Return)</option>
                    <option value="Wrong Size / Fit">সাইজ সমস্যা (Wrong Size / Fit)</option>
                    <option value="Color / Design Mismatch">রং বা ডিজাইন পছন্দ হয়নি (Color/Design Mismatch)</option>
                    <option value="Damaged / Defective">ত্রুটিপূর্ণ / ড্যামেজ প্রোডাক্ট (Damaged / Defective)</option>
                    <option value="Customer Refused Delivery">ডেলিভারি রিসিভ করেনি (Customer Refused)</option>
                  </select>
                </div>

                {/* Return Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: কাস্টমার কুরিয়ার চার্জ দিয়ে ফেরত পাঠিয়েছে..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setShowReturnModal(false);
                    setStatus(currentStatus);
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleConfirmReturn}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? "প্রসেসিং..." : "কনফার্ম ও আপডেট"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-500">
                  <Send className="w-6 h-6" />
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold text-gray-900 leading-none">Dispatch Order</h3>
                  <p className="text-gray-500 font-medium text-sm mt-1">Select your preferred courier service.</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <label 
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedCourier === 'steadfast' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="courier" 
                    value="steadfast" 
                    checked={selectedCourier === 'steadfast'}
                    onChange={() => setSelectedCourier('steadfast')}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3 flex flex-col">
                    <span className="font-bold text-gray-900">Steadfast Courier</span>
                    <span className="text-xs text-gray-500">Standard delivery</span>
                  </div>
                </label>
                
                <label 
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedCourier === 'pathao' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="courier" 
                    value="pathao" 
                    checked={selectedCourier === 'pathao'}
                    onChange={() => setSelectedCourier('pathao')}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3 flex flex-col">
                    <span className="font-bold text-gray-900">Pathao Courier</span>
                    <span className="text-xs text-gray-500">Requires Zone mapped to Dhaka</span>
                  </div>
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isUpdating ? 'Dispatching...' : 'Dispatch Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
