"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, ShieldBan, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CustomerActionsProps {
  customerId: string;
  isBanned: boolean;
}

export function CustomerActions({ customerId, isBanned }: CustomerActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleBan = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    
    const actionName = isBanned ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${actionName} this customer?`)) return;

    setIsProcessing(true);
    const loadingToast = toast.loading(`${isBanned ? 'Unbanning' : 'Banning'} customer...`);
    
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !isBanned })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${actionName} customer`);

      toast.success(data.message, { id: loadingToast });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);

    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;

    setIsProcessing(true);
    const loadingToast = toast.loading("Deleting customer...");
    
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete customer");

      toast.success(data.message, { id: loadingToast });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isProcessing}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
          isOpen ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        } disabled:opacity-50`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
          <button
            onClick={toggleBan}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${
              isBanned ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isBanned ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
            <span>{isBanned ? "Unban Customer" : "Ban Customer"}</span>
          </button>
          
          <div className="h-px bg-gray-100 my-1"></div>
          
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Customer</span>
          </button>
        </div>
      )}
    </div>
  );
}
