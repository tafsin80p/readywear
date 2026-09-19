"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    subtitle: "নতুন কালেকশন",
    title1: "স্টাইলের দেখা",
    title2: "নতুন যাত্রা",
    desc: "প্রিমিয়াম কোয়ালিটির পোশাক, আপনার প্রতিদিনের সঙ্গী",
    cta: "এখনই শপ করুন",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop",
    subtitle: "শীতের আয়োজন",
    title1: "উষ্ণতায় ঘেরা",
    title2: "শীতের পোশাক",
    desc: "ফ্যাশনেবল জ্যাকেট এবং হুডি",
    cta: "কালেকশন দেখুন",
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // Initial animation for the first slide
    gsap.fromTo(
      contentRefs.current[current],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, { dependencies: [current] });

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100 mt-4 max-w-[1920px] mx-auto">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          ref={(el) => { slideRefs.current[index] = el; }}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title1}
            fill
            className="object-cover object-center"
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-8 md:px-16 lg:px-24">
              <div 
                ref={(el) => { contentRefs.current[index] = el; }}
                className="max-w-xl"
              >
                <p className="text-gray-600 font-medium mb-2">{slide.subtitle}</p>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-4">
                  {slide.title1} <br />
                  <span className="text-primary">{slide.title2}</span>
                </h1>
                <p className="text-gray-600 text-lg mb-8">{slide.desc}</p>
                <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-full font-medium flex items-center gap-2 transition-transform hover:scale-105">
                  {slide.cta}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg backdrop-blur-sm transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg backdrop-blur-sm transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === current ? "bg-primary w-8" : "bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
