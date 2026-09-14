"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Mail, Lock, Shield, ArrowRight, Loader2, Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";

export default function AdminProfile() {
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
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
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
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast(data.message, "success");

      // Check if email or password was changed requiring logout
      if (data.requiresRelogin) {
        toast("Credentials changed. Please log in again.", "info");
        setTimeout(() => {
          signOut({ callbackUrl: "/admin/login" });
        }, 1500);
      } else {
        // If just name or image changed, try to update NextAuth session
        await update({ name: formData.name, image: formData.image });
        // Clear passwords from form
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      }
    } catch (error: any) {
      toast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your administrative account details and security preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
            <div className="h-32 bg-gradient-to-br from-[#F5426A] to-[#ff7e9a]"></div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-gray-100 bg-white shadow-lg overflow-hidden">
                <ImageUpload 
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  disabled={isLoading}
                >
                  <div className="w-full h-full bg-[#F5426A]/10 flex items-center justify-center text-[#F5426A] font-bold text-4xl uppercase relative group">
                    {formData.image ? (
                      <Image src={formData.image} alt="Profile" fill className="object-cover" />
                    ) : (
                      session?.user?.name?.charAt(0) || "A"
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </ImageUpload>
              </div>
              
              <div className="pt-14">
                <h2 className="text-xl font-extrabold text-gray-900">{session?.user?.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 mb-4">
                  <Shield className="w-4 h-4 text-[#F5426A]" />
                  <span className="font-medium">Super Admin</span>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                    <span className="text-sm font-medium text-gray-700 truncate">{session?.user?.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</span>
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="w-full lg:w-2/3 xl:w-3/4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#F5426A]" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#F5426A] transition-colors" />
                        </div>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name || ""}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#F5426A] transition-colors" />
                        </div>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#F5426A]" />
                    Security Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Current Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#F5426A] transition-colors" />
                        </div>
                        <input 
                          type="password" 
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Required to change email or password"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all placeholder:font-normal placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#F5426A] transition-colors" />
                        </div>
                        <input 
                          type="password" 
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current password"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all placeholder:font-normal placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#F5426A] hover:bg-[#F5426A]/90 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Save Changes
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
