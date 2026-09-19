import ReportsClient from "@/components/admin/ReportsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports & Analytics | Mehzin Offers Admin",
  description: "View sales reports and analytics for Mehzin Offers",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
