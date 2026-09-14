"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Mail, Lock, Shield, ArrowRight, Loader2, Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";

export default function AccountProfile() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    image: "",
  });

  // Sync form data when session is loaded
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        image: session?.user?.image || "",
      }));
    }
  }, [session, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast("success", "Profile updated successfully!");

      if (data.requiresRelogin) {
        toast("success", "Security details updated. Please log in again.");
        setTimeout(() => {
          signOut({ callbackUrl: "/" });
        }, 1500);
      } else {
        await update({ name: formData.name, image: formData.image });
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      }
    } catch (error: any) {
      toast("error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F5426A]/5 to-[#F5426A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        {/* Avatar Upload */}
        <div className="relative shrink-0 z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-50">
            <ImageUpload 
              onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
              disabled={isLoading}
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5426A]/10 to-[#F5426A]/20 text-[#F5426A] font-bold text-5xl uppercase relative group cursor-pointer">
                {formData.image ? (
                  <Image src={formData.image} alt="Profile" fill className="object-cover" />
                ) : (
                  session?.user?.name?.charAt(0) || "U"
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </ImageUpload>
          </div>
        </div>

        {/* User Info Header */}
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4" /> Account Active
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{session?.user?.name || "Customer"}</h1>
          <p className="text-gray-500">{session?.user?.email}</p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#F5426A]" />
            Account Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">Update your personal information and security settings.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
          
          {/* Personal Info Grid */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Security Grid */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter to change password"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gray-900 hover:bg-[#F5426A] text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 min-w-[220px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Save Changes
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
