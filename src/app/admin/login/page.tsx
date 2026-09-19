"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AdminLogin() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("admin@mehzin.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  useGSAP(() => {
    // Left side image overlay animation
    gsap.fromTo(
      ".login-overlay",
      { x: "-100%" },
      { x: 0, duration: 1.2, ease: "power3.inOut" }
    );
    
    // Right side form entrance
    gsap.fromTo(
      ".login-element",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
    );
  }, { scope: containerRef });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full flex flex-col md:flex-row bg-white">
        
        {/* Left Side: Brand Imagery */}
        <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden min-h-screen">
          <div className="absolute inset-0 z-0">
             <Image 
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop" 
                alt="Fashion Store" 
                fill 
                className="object-cover opacity-40 mix-blend-multiply"
             />
          </div>
          <div className="login-overlay absolute inset-0 bg-gradient-to-tr from-[#1a2b4b]/80 to-primary/80 z-10"></div>
          
          <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary font-black text-xl">R</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight">Mehzin Offers</span>
            </div>

            <div>
              <h2 className="text-4xl font-black mb-4 leading-tight">Welcome to your<br/>Command Center.</h2>
              <p className="text-white/80 font-medium">Manage your inventory, track orders, and boost your sales from one powerful dashboard.</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium text-white/60">
              <ShieldCheck className="w-4 h-4" />
              Secure Admin Portal
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-8">
            
            <div className="text-center md:text-left">
              <h2 className="login-element text-3xl font-extrabold text-[#1a2b4b] tracking-tight mb-2">Admin Sign In</h2>
              <p className="login-element text-gray-500 font-medium text-sm">Enter your credentials to access the dashboard.</p>
              {error && <p className="login-element text-red-500 font-medium text-sm mt-2">{error}</p>}
            </div>

            <form onSubmit={handleLogin} className="space-y-6 mt-8">
              <div className="login-element space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="login-element space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="login-element w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
          </div>
      </div>
    </div>
  );
}
