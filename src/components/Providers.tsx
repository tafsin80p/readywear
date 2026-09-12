"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SearchProvider } from "@/context/SearchContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SearchProvider>
  );
}
