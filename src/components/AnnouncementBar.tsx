"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BadgePercent, Tag, Gift, Flame, X, ShoppingBag } from "lucide-react";

export interface OfferSettingsProps {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  endDate?: string;
  buttonText?: string;
  buttonLink?: string;
  bgGradient?: string;
  autoFallback?: boolean;
}

export function AnnouncementBar({
  offerSettings,
}: {
  offerSettings?: OfferSettingsProps | null;
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const isOfferActive = Boolean(offerSettings?.enabled);
  const endDateStr = offerSettings?.endDate || "";
  const autoFallback = offerSettings?.autoFallback !== false;

  useEffect(() => {
    setMounted(true);

    try {
      if (sessionStorage.getItem("readywear_offer_bar_dismissed") === "true") {
        setIsDismissed(true);
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }, []);

  useEffect(() => {
    if (!isOfferActive) return;

    const calculateTime = () => {
      if (!endDateStr) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: false,
        });
        return;
      }

      const target = new Date(endDateStr).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [isOfferActive, endDateStr]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("readywear_offer_bar_dismissed", "true");
    } catch (e) {
      // Ignore
    }
  };

  // Regular announcement bar component - uses website primary color and offer-type icons
  const RegularAnnouncementBar = () => (
    <div className="w-full bg-primary text-white py-2 px-2 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed transition-all">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-6 lg:gap-14">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <BadgePercent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span>বিশেষ অফার ও আকর্ষণীয় ছাড়</span>
        </div>
        <span className="opacity-40 hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span>সারা দেশে হোম ডেলিভারি</span>
        </div>
        <span className="opacity-40 hidden md:inline">|</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span className="pb-[1px]">১০০% অরিজিনাল ব্র্যান্ড পণ্য</span>
        </div>
      </div>
    </div>
  );

  // If offer is disabled or dismissed, render regular announcement bar
  if (!isOfferActive || isDismissed) {
    return <RegularAnnouncementBar />;
  }

  // If offer expired and auto-fallback is enabled, render regular announcement bar
  if (timeLeft.isExpired && autoFallback) {
    return <RegularAnnouncementBar />;
  }

  // Get color background - defaults to website brand primary
  const rawBg = offerSettings?.bgGradient?.trim() || "";
  let bgClass = "bg-primary";
  if (rawBg && rawBg !== "bg-primary") {
    bgClass = rawBg.startsWith("from-") ? `bg-gradient-to-r ${rawBg}` : rawBg;
  }

  const title = offerSettings?.title || "পূজার সেল অফার!";
  const subtitle = offerSettings?.subtitle || "অফার চলবে ৩ দিন";
  const badgeText = offerSettings?.badgeText || "পূজা স্পেশাল";
  const buttonText = offerSettings?.buttonText || "অফার দেখুন";
  const buttonLink = offerSettings?.buttonLink || "/categories";

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <aside aria-label="Offer Announcement banner" className={`w-full ${bgClass} text-white shadow-xs relative z-40 transition-all border-b border-white/10`}>
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 sm:gap-x-4">
          
          {/* Left/Center Content: Offer Badge & Offer Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Offer Tag Badge */}
            {badgeText && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-xs">
                <BadgePercent className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>{badgeText}</span>
              </span>
            )}

            {/* Offer Text with Flame/Hot Deal icon */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold">
              <Flame className="w-4 h-4 text-amber-200 fill-amber-300 animate-pulse shrink-0" />
              <span className="text-white drop-shadow-xs font-bold">{title}</span>
              {subtitle && (
                <>
                  <span className="text-white/40 hidden sm:inline">•</span>
                  <span className="text-white/95 font-medium hidden md:inline text-xs sm:text-sm">
                    {subtitle}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right/Countdown & Action Area */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            
            {/* Countdown Timer with Tag/Ticket Deal Icon */}
            {mounted && endDateStr && !timeLeft.isExpired && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-white">
                <Tag className="w-3.5 h-3.5 text-white/90 hidden xs:inline shrink-0" />
                
                {/* Days */}
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/25 min-w-[26px] sm:min-w-[30px] shadow-xs">
                  <span className="font-mono text-xs sm:text-sm font-black leading-none text-white">
                    {pad(timeLeft.days)}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-white/90 font-sans font-medium leading-none mt-0.5">
                    দিন
                  </span>
                </div>
                <span className="text-white/70 font-mono font-bold leading-none text-xs sm:text-sm">:</span>

                {/* Hours */}
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/25 min-w-[26px] sm:min-w-[30px] shadow-xs">
                  <span className="font-mono text-xs sm:text-sm font-black leading-none text-white">
                    {pad(timeLeft.hours)}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-white/90 font-sans font-medium leading-none mt-0.5">
                    ঘণ্টা
                  </span>
                </div>
                <span className="text-white/70 font-mono font-bold leading-none text-xs sm:text-sm">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/25 min-w-[26px] sm:min-w-[30px] shadow-xs">
                  <span className="font-mono text-xs sm:text-sm font-black leading-none text-white">
                    {pad(timeLeft.minutes)}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-white/90 font-sans font-medium leading-none mt-0.5">
                    মি
                  </span>
                </div>
                <span className="text-white/70 font-mono font-bold leading-none text-xs sm:text-sm">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/25 min-w-[26px] sm:min-w-[30px] shadow-xs">
                  <span className="font-mono text-xs sm:text-sm font-black leading-none text-amber-200">
                    {pad(timeLeft.seconds)}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-white/90 font-sans font-medium leading-none mt-0.5">
                    সে
                  </span>
                </div>
              </div>
            )}

            {/* Action Button with Gift Box Icon */}
            {buttonText && (
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-white/90 text-primary px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0"
              >
                <Gift className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{buttonText}</span>
              </Link>
            )}

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss offer banner"
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
}
