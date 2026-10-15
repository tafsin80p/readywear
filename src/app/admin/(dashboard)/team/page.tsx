import React from "react";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamClient } from "@/components/admin/TeamClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin/orders");
  }

  await connectToDatabase();

  const rawMembers = await User.find(
    { role: { $in: ["admin", "staff"] } },
    { password: 0, otp: 0, otpExpiry: 0 }
  )
    .sort({ createdAt: -1 })
    .lean();

  const members = JSON.parse(JSON.stringify(rawMembers));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store operators and administrators. Staff can only manage and create orders, without delete or setting access.
          </p>
        </div>
      </div>

      <div className="px-6 pb-12">
        <TeamClient initialMembers={members} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
