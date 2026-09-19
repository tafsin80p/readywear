"use client";

import { useState, useEffect } from "react";
import { Lock, User, Phone, Mail, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isLoginModalOpen) {
      setIsLogin(true);
      setError("");
      setEmail("");
      setPassword("");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center sm:px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeLoginModal}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh] md:min-h-[600px] animate-[slide-up_0.3s_ease-out_forwards] md:animate-[scale-in_0.3s_ease-out_forwards]">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <img src="/readywear logo.png" alt="Mehzin Offers" className="h-7 w-auto mix-blend-multiply" />
          <button 
            onClick={closeLoginModal}
            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Close Button (Desktop) */}
        <button 
          onClick={closeLoginModal}
          className="hidden md:block absolute top-4 right-4 z-50 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-gray-100 transition-colors text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Branding (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden flex-col justify-end p-12">
          {/* Branded Background Gradient & Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 z-0"></div>
          
          {/* Logo in the center/top */}
          <div className="absolute top-12 left-12 z-20">
            <img src="/readywear logo.png" alt="Mehzin Offers" className="h-12 w-auto mix-blend-screen opacity-90 brightness-200" />
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl z-10"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-black/10 rounded-full blur-3xl z-10"></div>

          {/* Text Content */}
          <div className="relative z-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              {isLogin ? "আবারও স্বাগতম!" : "নতুন যাত্রা শুরু হোক!"}
            </h2>
            <p className="text-white/90 text-base max-w-sm leading-relaxed">
              {isLogin 
                ? "আপনার পছন্দের পোশাক কিনতে আজই লগইন করুন এবং উপভোগ করুন দারুণ সব অফার।"
                : "রেডিওয়্যার-এ একাউন্ট তৈরি করে আপনার শপিং এক্সপেরিয়েন্সকে করুন আরও সহজ ও সুন্দর।"}
            </p>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative overflow-y-auto">
          
          {/* Form Container with CSS Transition */}
          <div className="relative w-full min-h-[400px]">
            
            {/* Login Form */}
            <div 
              className={`transition-all duration-500 ease-in-out transform ${
                isLogin ? "opacity-100 translate-x-0 relative z-10" : "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none z-0"
              }`}
            >
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">লগইন করুন</h2>
                <p className="text-gray-500 text-sm sm:text-base">আপনার একাউন্টে প্রবেশ করতে তথ্য দিন</p>
                {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
              </div>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setIsLoading(true);
                try {
                  const res = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                  });
                  if (res?.error) {
                    setError(res.error);
                  } else {
                    toast("সফলভাবে লগইন হয়েছে!", "success");
                    closeLoginModal();
                  }
                } catch (err) {
                  setError("An unexpected error occurred");
                } finally {
                  setIsLoading(false);
                }
              }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">ইমেইল</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 block">পাসওয়ার্ড</label>
                    <button type="button" className="text-xs font-semibold text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                </button>
              </form>
            </div>

            {/* Register Form */}
            <div 
              className={`transition-all duration-500 ease-in-out transform ${
                !isLogin ? "opacity-100 translate-x-0 relative z-10" : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none z-0"
              }`}
            >
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">একাউন্ট খুলুন</h2>
                <p className="text-gray-500 text-sm sm:text-base">নতুন একাউন্ট তৈরি করতে তথ্য দিন</p>
              </div>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setIsRegistering(true);
                setError("");
                try {
                  const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: registerName,
                      email: registerEmail,
                      password: registerPassword,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    toast(data.message || "Registration failed", "error");
                  } else {
                    toast("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এখন লগইন করুন।", "success");
                    // Switch to login tab and prefill the email
                    setEmail(registerEmail);
                    setIsLogin(true);
                    setRegisterName("");
                    setRegisterEmail("");
                    setRegisterPassword("");
                  }
                } catch (error) {
                  toast("An unexpected error occurred", "error");
                } finally {
                  setIsRegistering(false);
                }
              }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">আপনার নাম</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                      placeholder="সম্পূর্ণ নাম"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">ইমেইল</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">পাসওয়ার্ড তৈরি করুন</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  disabled={isRegistering}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isRegistering ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
                </button>
              </form>
            </div>

          </div>

          {/* Toggle Button */}
          <div className="mt-8 text-center relative z-20">
            <p className="text-gray-500 text-sm">
              {isLogin ? "একাউন্ট নেই?" : "আগে থেকেই একাউন্ট আছে?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-primary hover:underline transition-all"
              >
                {isLogin ? "রেজিস্ট্রেশন করুন" : "লগইন করুন"}
              </button>
            </p>
          </div>

          {/* Social Login Separator */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">অথবা</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4 relative z-20">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.966 11.966 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
                <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1877F2]/90 transition-colors text-white">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-semibold">Facebook</span>
            </button>
          </div>

        </div>
      </div>
      
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
