import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { name, email, currentPassword, newPassword, image } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already in use by another account." },
          { status: 400 }
        );
      }
      user.email = email;
    }

    let requiresRelogin = false;
    const isPasswordChanging = currentPassword && newPassword;

    // Validate current password if attempting to change password
    if (isPasswordChanging) {
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordMatch) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 }
        );
      }
    } else if (email !== user.email) {
      // If they are just changing email, we don't necessarily require current password in this flow,
      // but we will force a re-login.
      requiresRelogin = true;
    }

    // Update password if requested
    if (isPasswordChanging) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
      requiresRelogin = true;
    }

    // Always update name and image
    user.name = name;
    if (image !== undefined) {
      user.image = image;
    }

    await user.save();

    return NextResponse.json({ 
      message: "Profile updated successfully.",
      requiresRelogin
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating profile." },
      { status: 500 }
    );
  }
}
