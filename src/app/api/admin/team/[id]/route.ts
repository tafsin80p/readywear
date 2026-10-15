import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, role, password } = body;

    await connectToDatabase();
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    if (name?.trim()) userToUpdate.name = name.trim();
    if (role && ["admin", "staff"].includes(role)) {
      // Prevent super admin from demoting themselves if they are the only admin
      if (session.user.id === id && role !== "admin") {
        return NextResponse.json({ success: false, message: "You cannot demote yourself from admin" }, { status: 400 });
      }
      userToUpdate.role = role;
    }
    if (password && password.length >= 6) {
      userToUpdate.password = await bcrypt.hash(password, 10);
    }

    await userToUpdate.save();

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      member: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        createdAt: userToUpdate.createdAt
      }
    });
  } catch (error: any) {
    console.error("Error updating member:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;

    // Disallow deleting self
    if (session.user.id === id) {
      return NextResponse.json({ success: false, message: "You cannot delete your own account" }, { status: 400 });
    }

    await connectToDatabase();
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: `Member ${userToDelete.name} has been removed` });
  } catch (error: any) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to delete member" }, { status: 500 });
  }
}
