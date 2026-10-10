import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: "Email, OTP, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Check OTP
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    // Check OTP Expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ success: false, message: "OTP has expired" }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return NextResponse.json({ success: true, message: "Password has been reset successfully" });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ success: false, message: error.message || "An error occurred" }, { status: 500 });
  }
}
