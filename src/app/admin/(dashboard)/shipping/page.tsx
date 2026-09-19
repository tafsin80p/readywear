import ShippingClient from "@/components/admin/ShippingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Configuration | Mehzin Offers Admin",
  description: "Manage shipping zones and rates for Mehzin Offers",
};

export default function ShippingPage() {
  return <ShippingClient />;
}
