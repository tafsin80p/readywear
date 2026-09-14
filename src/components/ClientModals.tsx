"use client";

import dynamic from "next/dynamic";

const CartSidebar = dynamic(() => import("./CartSidebar").then(mod => mod.CartSidebar), { ssr: false });
const LoginModal = dynamic(() => import("./LoginModal").then(mod => mod.LoginModal), { ssr: false });
const SearchModal = dynamic(() => import("./SearchModal").then(mod => mod.SearchModal), { ssr: false });

export function ClientModals() {
  return (
    <>
      <CartSidebar />
      <LoginModal />
      <SearchModal />
    </>
  );
}
