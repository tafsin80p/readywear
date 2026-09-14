import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
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

    // Find the user by ID and include password field for verification
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    let requiresRelogin = false;
    let isEmailChanged = user.email !== email;
    let isPasswordChanging = newPassword && newPassword.length > 0;

    // If changing email or password, require current password
    if (isEmailChanged || isPasswordChanging) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to change email or password." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Incorrect current password." },
          { status: 401 }
        );
      }
    }

    // Check if new email is already taken
    if (isEmailChanged) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already in use by another account." },
          { status: 409 }
        );
      }
      user.email = email;
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

    return NextResponse.json(
      { 
        message: "Profile updated successfully.",
        requiresRelogin
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
