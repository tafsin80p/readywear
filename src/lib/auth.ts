import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        isOtpLogin: { label: "Is OTP Login", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email required");
        }

        const mongoose = await import("mongoose");
        const connectToDatabase = (await import("@/lib/mongodb")).default;
        const User = (await import("@/models/User")).default;
        const bcrypt = await import("bcryptjs");

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // If it's an admin login attempt through the new UI
        if (credentials.isOtpLogin === "true") {
          if (!credentials.otp) {
            throw new Error("OTP is required");
          }

          if (user.role !== "admin") {
            throw new Error("Unauthorized");
          }

          if (!user.otp || user.otp !== credentials.otp) {
            throw new Error("Invalid OTP");
          }

          if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            throw new Error("OTP has expired");
          }

          // Clear OTP after successful login
          user.otp = null;
          user.otpExpiry = null;
          await user.save();
        } else {
          // Standard password login (for non-admins, or if OTP is not strictly enforced globally yet)
          // To strictly enforce OTP for all admins, we can check role here:
          if (user.role === "admin" && !credentials.password && !credentials.otp) {
             throw new Error("Admins must use OTP login");
          }

          if (credentials.password) {
            const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

            if (!isPasswordMatch) {
              throw new Error("Invalid email or password");
            }
          } else {
             throw new Error("Password required");
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // We use a modal on the home page
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.picture = user.image; // NextAuth standard for image is picture
      }
      // Handle session updates (e.g., when user changes their name or image)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
};
