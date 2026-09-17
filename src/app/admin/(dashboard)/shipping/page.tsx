import ShippingClient from "@/components/admin/ShippingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Configuration | ReadyWear Admin",
  description: "Manage shipping zones and rates for ReadyWear",
};

export default function ShippingPage() {
  return <ShippingClient />;
}
