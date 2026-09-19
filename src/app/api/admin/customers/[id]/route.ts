import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";
import { activityLogService } from "@/lib/services/activityLogService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    if (body.isBanned === undefined) {
      return NextResponse.json({ message: "Invalid update fields" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Log Activity
    activityLogService.logActivity({
      title: "Customer Updated",
      message: `${updatedUser.name}'s profile has been updated.`,
      type: "customer",
      link: `/admin/customers/${updatedUser._id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedUser
    });
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Log Activity
    activityLogService.logActivity({
      title: "Customer Deleted",
      message: `${user.name}'s profile was removed from the system.`,
      type: "customer",
      link: `/admin/customers`,
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully"
    });
  } catch (error: any) {
    console.error("User delete error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
