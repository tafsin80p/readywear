"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function PromoMarquee() {
  const textRef1 = useRef<HTMLDivElement>(null);
  const textRef2 = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!textRef1.current || !textRef2.current) return;

    gsap.to([textRef1.current, textRef2.current], {
      xPercent: -100,
      repeat: -1,
      duration: 25,
      ease: "linear",
    });
  }, { dependencies: [] });

  return (
    <div className="w-full bg-primary text-white py-4 overflow-hidden flex whitespace-nowrap mt-4 text-base font-medium leading-relaxed">
      <div ref={textRef1} className="flex gap-20 min-w-full px-10 shrink-0 items-center justify-around">
        <span className="pb-[2px]">আজকের অফার!</span>
        <span className="pb-[2px]">|</span>
        <span className="pb-[2px]">5000 টাকার বেশি অর্ডারে পাচ্ছেন 10% ছাড়</span>
        <span className="pb-[2px]">|</span>
        <span className="pb-[2px]">ফ্রি ডেলিভারি সারা দেশে</span>
        <span className="pb-[2px]">|</span>
        <span className="pb-[2px]">অরিজিনাল পণ্যে 100% নিশ্চয়তা</span>
      </div>
      <div ref={textRef2} className="flex gap-20 min-w-full px-10 shrink-0 items-center justify-around" aria-hidden="true">
        <span className="pb-[2px]">আজকের অফার!</span>
        <span className="pb-[2px]">|</span>
        <span className="pb-[2px]">5000 টাকার বেশি অর্ডারে পাচ্ছেন 10% ছাড়</span>
        <span className="pb-[2px]">|</span>
        <span className="pb-[2px]">ফ্রি ডেলিভারি সারা দেশে</span>
        <span className="pb-[2px]">|</span>
        <span className="pb-[2px]">অরিজিনাল পণ্যে 100% নিশ্চয়তা</span>
      </div>
    </div>
  );
}
