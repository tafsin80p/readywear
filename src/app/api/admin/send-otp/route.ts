import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import IntegrationSettings from "@/models/IntegrationSettings";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiry to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Fetch SMTP settings
    const settings = await IntegrationSettings.findOne();
    if (!settings || !settings.smtp || !settings.smtp.enabled || !settings.smtp.host) {
      return NextResponse.json({ success: false, message: "SMTP is not configured. Please contact support." }, { status: 500 });
    }

    const { host, port, user: smtpUser, password: smtpPassword, fromEmail } = settings.smtp;

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: user.email,
      subject: "Mehzin Offers Admin Login OTP",
      text: `Your Admin Login OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Mehzin Offers Admin Portal</h2>
          <p style="color: #555; font-size: 16px;">Hello ${user.name},</p>
          <p style="color: #555; font-size: 16px;">You are trying to log into the Mehzin Offers admin dashboard. Use the following OTP to complete your login:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a2b4b;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 14px; text-align: center;">This OTP is valid for 10 minutes. If you did not request this, please secure your account immediately.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ success: false, message: error.message || "An error occurred" }, { status: 500 });
  }
}
