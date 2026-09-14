"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1.5 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numberRef = useRef({ val: 0 });

  useEffect(() => {
    gsap.to(numberRef.current, {
      val: value,
      duration: duration,
      ease: "power3.out",
      onUpdate: () => {
        setDisplayValue(Math.floor(numberRef.current.val));
      },
    });
  }, [value, duration]);

  const formatted = displayValue.toLocaleString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
