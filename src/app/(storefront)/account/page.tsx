"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountIndex() {
  const router = useRouter();

  useEffect(() => {
    // On desktop, redirect to overview. On mobile, this route is handled by the layout's sidebar menu.
    if (window.innerWidth >= 768) {
      router.replace("/account/overview");
    }
  }, [router]);

  return (
    <div className="hidden md:flex min-h-[400px] items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
