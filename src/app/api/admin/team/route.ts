import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectToDatabase();
    const members = await User.find(
      { role: { $in: ["admin", "staff"] } },
      { password: 0, otp: 0, otpExpiry: 0 }
    ).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const assignedRole = role === "admin" ? "admin" : "staff";

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Member ${newUser.name} created successfully with role: ${assignedRole}`,
        member: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to create member" }, { status: 500 });
  }
}
