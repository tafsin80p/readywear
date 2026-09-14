'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';


export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const numberRef = useRef<HTMLHeadingElement>(null);
  const graphicsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Setup initial state
      gsap.set([textRef.current, numberRef.current, ".fade-up"], {
        y: 40,
        opacity: 0,
      });

      // Animate in
      const tl = gsap.timeline();
      
      tl.to(numberRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      })
      .to(textRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.4")
      .to(".fade-up", {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      }, "-=0.3");

      // Continuous floating animation for background elements
      gsap.to(".floating-circle", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        rotation: "random(-15, 15)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2,
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div ref={containerRef} className="min-h-[70vh] flex items-center justify-center relative overflow-hidden bg-background px-4 py-20">
          {/* Background Graphic Elements */}
          <div ref={graphicsRef} className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden">
            <div className="floating-circle absolute w-64 h-64 rounded-full bg-primary/20 blur-3xl -top-20 -left-20"></div>
            <div className="floating-circle absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl bottom-10 right-10"></div>
            <div className="floating-circle absolute w-72 h-72 rounded-full bg-pink-300/20 blur-3xl top-1/2 left-1/3 transform -translate-y-1/2"></div>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center max-w-2xl">
            <h1 ref={numberRef} className="text-8xl md:text-9xl font-black text-primary mb-4 tracking-tighter">
              404
            </h1>
            
            <h2 ref={textRef} className="text-2xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              Looks like you're lost
            </h2>
            
            <p className="fade-up text-zinc-600 text-lg mb-10 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <div className="fade-up flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href="/" 
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-95 group w-full sm:w-auto"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Back to Home</span>
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-foreground font-medium rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95 group w-full sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
