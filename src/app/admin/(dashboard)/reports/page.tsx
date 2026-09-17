import ReportsClient from "@/components/admin/ReportsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports & Analytics | ReadyWear Admin",
  description: "View sales reports and store analytics",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
