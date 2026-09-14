'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(".error-element", {
        y: 30,
        opacity: 0,
      });

      // Icon animation
      gsap.set(".icon-container", { scale: 0.5, opacity: 0, rotation: -20 });

      const tl = gsap.timeline();
      
      tl.to(".icon-container", {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        ease: "back.out(1.5)",
      })
      .to(".error-element", {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      }, "-=0.2");
      
      // Floating animation for the icon container
      gsap.to(".icon-container", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.6,
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div ref={containerRef} className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-background py-20">
          <div className="max-w-md w-full text-center flex flex-col items-center">
            
            <div className="icon-container w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75 duration-1000"></div>
              <AlertTriangle className="w-12 h-12 text-primary relative z-10" />
            </div>
            
            <h1 className="error-element text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              Oops! Something went wrong
            </h1>
            
            <p className="error-element text-zinc-500 mb-8 max-w-sm mx-auto leading-relaxed">
              We encountered an unexpected error while trying to process your request. Our team has been notified.
            </p>
            
            <div className="error-element flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => reset()}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto group"
              >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
                <span>Try Again</span>
              </button>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-foreground font-medium rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95 w-full sm:w-auto group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Go Home</span>
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="error-element mt-12 p-4 bg-zinc-50 rounded-lg text-left w-full overflow-hidden border border-zinc-200">
                <p className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider font-semibold">Error Details (Dev Only)</p>
                <p className="text-sm font-mono text-red-600 break-words line-clamp-4">
                  {error.message || "Unknown error occurred"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
