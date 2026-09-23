"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => {});

  const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
    const formattedOpts = typeof opts === "string" ? { message: opts } : opts;
    setOptions({
      title: formattedOpts.title || "Are you sure?",
      message: formattedOpts.message,
      confirmText: formattedOpts.confirmText || "Confirm",
      cancelText: formattedOpts.cancelText || "Cancel",
      variant: formattedOpts.variant || "danger",
    });
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  options.variant === 'danger' ? 'bg-red-50 text-red-500' :
                  options.variant === 'warning' ? 'bg-amber-50 text-amber-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  {options.variant === 'danger' ? <AlertCircle className="w-6 h-6" /> :
                   options.variant === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                   <Info className="w-6 h-6" />}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold text-gray-900 leading-none">{options.title}</h3>
                </div>
              </div>
              <p className="text-gray-500 font-medium text-[15px] pl-16 -mt-2 mb-6 leading-relaxed">
                {options.message}
              </p>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {options.cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm ${
                    options.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                    options.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
                    'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                  }`}
                >
                  {options.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
