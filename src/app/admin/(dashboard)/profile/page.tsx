"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Mail, Phone, Lock, Shield, ArrowRight, Loader2, Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";

export default function AdminProfile() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string>("staff");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    image: "",
  });

  // Fetch complete profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFormData(prev => ({
              ...prev,
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              image: data.user.image || "",
            }));
            if (data.user.role) {
              setRole(data.user.role);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  // Fallback sync with session if profile fetch hasn't loaded yet
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user.name || "",
        email: prev.email || session.user.email || "",
        phone: prev.phone || (session.user as any).phone || "",
        image: prev.image || session.user.image || "",
      }));
      if ((session.user as any).role) {
        setRole((session.user as any).role);
      }
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

      toast(data.message || "Profile updated successfully.", "success");

      // Check if email or password was changed requiring logout
      if (data.requiresRelogin) {
        toast("Credentials changed. Please log in again.", "info");
        setTimeout(() => {
          signOut({ callbackUrl: "/admin/login" });
        }, 1500);
      } else {
        // If just name, phone, or image changed, update NextAuth session
        await update({ 
          name: formData.name, 
          image: formData.image, 
          phone: formData.phone 
        });
        // Clear passwords from form
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      }
    } catch (error: any) {
      toast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isStaff = role === "staff";

  return (
    <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
        <p className="text-gray-500 mt-1">
          {isStaff 
            ? "Manage your staff profile details, phone number, and security preferences."
            : "Manage your administrative account details, phone number, and security preferences."}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
            <div className={`h-32 ${isStaff ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-primary to-[#ff7e9a]'}`}></div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden group">
                <ImageUpload 
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  disabled={isLoading}
                >
                  <div className={`w-full h-full ${isStaff ? 'bg-blue-50 text-blue-600' : 'bg-primary/10 text-primary'} flex items-center justify-center font-bold text-4xl uppercase relative cursor-pointer`}>
                    {formData.image ? (
                      <Image src={formData.image} alt="Profile" fill className="object-cover" />
                    ) : (
                      formData.name?.charAt(0) || "U"
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </ImageUpload>
              </div>
              
              <div className="pt-14">
                <h2 className="text-xl font-extrabold text-gray-900 truncate" title={formData.name || session?.user?.name || ""}>
                  {formData.name || session?.user?.name || "User"}
                </h2>
                
                <div className="mt-1 mb-4">
                  {isStaff ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-semibold">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Team Member</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-primary border border-pink-200/60 text-xs font-semibold">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>Super Admin</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                    <span className="text-sm font-medium text-gray-700 truncate" title={formData.email || session?.user?.email || ""}>
                      {formData.email || session?.user?.email}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formData.phone || <span className="text-gray-400 italic">Not set</span>}
                    </span>
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
                    <User className={`w-5 h-5 ${isStaff ? 'text-blue-600' : 'text-primary'}`} />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name || ""}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Phone Number</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleChange}
                          placeholder="e.g. 01700000000"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          required
                          placeholder="name@company.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Lock className={`w-5 h-5 ${isStaff ? 'text-blue-600' : 'text-primary'}`} />
                    Security Settings
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Leave password fields blank if you do not wish to change your password.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Current Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                          type="password" 
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          required={Boolean(
                            (session?.user?.email && formData.email.trim().toLowerCase() !== session.user.email.toLowerCase()) || 
                            formData.newPassword.length > 0
                          )}
                          placeholder="Required only to change email or password"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-normal placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                          type="password" 
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current password"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-normal placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
