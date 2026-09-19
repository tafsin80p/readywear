"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (arg1: string, arg2?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((arg1: string, arg2?: string) => {
    let message = arg1;
    let type: ToastType = "success";
    
    // Auto-detect if arguments were passed backwards like toast("error", "Message")
    if (["success", "error", "info"].includes(arg1) && arg2) {
      type = arg1 as ToastType;
      message = arg2;
    } else if (arg2 && ["success", "error", "info"].includes(arg2)) {
      type = arg2 as ToastType;
      message = arg1;
    }

    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container (Top Right) */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-4 flex items-start gap-3 w-[340px] max-w-[calc(100vw-3rem)] pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300 relative overflow-hidden group"
          >
            {/* Left Color Indicator Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              t.type === "success" ? "bg-emerald-500" : 
              t.type === "error" ? "bg-primary" : "bg-blue-500"
            }`} />

            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === "error" && <XCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
            
            <div className="flex-1 pr-6">
              <h4 className={`text-sm font-bold ${
                t.type === "success" ? "text-emerald-700" : 
                t.type === "error" ? "text-primary" : "text-blue-700"
              }`}>
                {t.type === "success" ? "Success" : t.type === "error" ? "Error" : "Info"}
              </h4>
              <p className="text-sm font-medium text-gray-600 leading-snug mt-1">{t.message}</p>
            </div>
            
            <button 
              onClick={() => removeToast(t.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Progress Bar Animation */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100 origin-left">
              <div 
                className={`h-full ${
                  t.type === "success" ? "bg-emerald-500" : 
                  t.type === "error" ? "bg-primary" : "bg-blue-500"
                }`}
                style={{ animation: "toast-progress 3.5s linear forwards" }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
