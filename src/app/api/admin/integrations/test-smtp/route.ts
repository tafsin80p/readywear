import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { host, port, user, password, fromEmail } = await req.json();

    if (!host || !port || !user || !password || !fromEmail) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass: password,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: fromEmail,
      to: session.user.email || fromEmail,
      subject: "Mehzin Offers SMTP Test",
      text: "If you received this email, your SMTP configuration is successfully working on Mehzin Offers!",
    });

    return NextResponse.json({ success: true, message: "Test email sent successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to connect to SMTP server" }, { status: 500 });
  }
}
