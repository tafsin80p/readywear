"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SearchProvider } from "@/context/SearchContext";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let source = "";

      if (urlParams.get("fbclid")) source = "Facebook";
      else if (urlParams.get("ttclid")) source = "TikTok";
      else if (urlParams.get("igshid")) source = "Instagram";
      else if (urlParams.get("utm_source")) {
        const utmSource = urlParams.get("utm_source");
        if (utmSource?.toLowerCase().includes("facebook") || utmSource?.toLowerCase().includes("fb")) source = "Facebook";
        else if (utmSource?.toLowerCase().includes("tiktok")) source = "TikTok";
        else if (utmSource?.toLowerCase().includes("instagram") || utmSource?.toLowerCase().includes("ig")) source = "Instagram";
        else source = utmSource || "";
      }

      if (source) {
        localStorage.setItem("order_source", source);
      }
    } catch (error) {
      console.error("Error saving source", error);
    }
  }, []);

  return (
    <SessionProvider>
      <SearchProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </SearchProvider>
    </SessionProvider>
  );
}
