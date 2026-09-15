"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Printer, ChevronDown, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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
        className={`flex items-center justify-between w-36 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2 font-medium shadow-sm transition-all
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
}

export function OrderStatusUpdater({ orderId, currentStatus, currentPaymentStatus, verificationStatus = "pending_verification" }: OrderStatusUpdaterProps) {
  const router = useRouter();
  
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if anything actually changed
  const hasChanges = status !== currentStatus || paymentStatus !== currentPaymentStatus;

  const handleUpdate = async () => {
    if (!hasChanges) return;
    
    setIsUpdating(true);
    const loadingToast = toast.loading("Updating order...");
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      toast.success("Order updated successfully!", { id: loadingToast });
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update order", { id: loadingToast });
      
      // Revert local state on error
      setStatus(currentStatus);
      setPaymentStatus(currentPaymentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
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
    if (!window.confirm(`Are you sure you want to ${action === 'confirm' ? 'confirm' : 'mark this order as fake'}?`)) {
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

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      
      {/* Verification Actions */}
      {verificationStatus === 'pending_verification' && (
        <div className="flex items-center gap-2 mr-2">
           <button 
             onClick={() => handleVerification('confirm')}
             disabled={isUpdating}
             className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50"
           >
             Confirm Order
           </button>
           <button 
             onClick={() => handleVerification('fake')}
             disabled={isUpdating}
             className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50"
           >
             Mark Fake
           </button>
        </div>
      )}

      {verificationStatus === 'confirmed' && (
        <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-lg mr-2 border border-green-200">
          Verified & Confirmed
        </span>
      )}
      
      {verificationStatus === 'fake' && (
        <span className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold rounded-lg mr-2 border border-red-200">
          Marked Fake
        </span>
      )}

      {/* Delete Button */}
      <button 
        onClick={handleDelete}
        disabled={isUpdating}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      {/* Invoice Button */}
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Invoice</span>
      </button>

      <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase hidden lg:block">Delivery:</label>
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
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase hidden lg:block">Payment:</label>
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
      </div>

      <button
        onClick={handleUpdate}
        disabled={isUpdating || !hasChanges}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${
          hasChanges && !isUpdating
            ? "bg-primary text-white hover:bg-primary/90 hover:shadow" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isUpdating ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <Save className="w-4 h-4" />
        )}
        Update Status
      </button>
    </div>
  );
}
