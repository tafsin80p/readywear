"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Image as ImageIcon, 
  Loader2, 
  Music, 
  BadgePercent, 
  Tag, 
  Gift, 
  Flame, 
  ShoppingBag, 
  Eye, 
  Calendar, 
  Check
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const COLOR_PRESETS = [
  {
    name: "ওয়েবসাইট কালার (Brand Primary - ডিফল্ট)",
    value: "bg-primary",
    className: "bg-primary",
  },
  {
    name: "উৎসবমুখর লাল ও রোজ (Festive Rose)",
    value: "bg-gradient-to-r from-rose-600 to-pink-600",
    className: "bg-gradient-to-r from-rose-600 to-pink-600",
  },
  {
    name: "গাঢ় লাল ও রুবি (Deep Ruby)",
    value: "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500",
    className: "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500",
  },
  {
    name: "রয়্যাল পার্পল (Royal Purple & Rose)",
    value: "bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500",
    className: "bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500",
  },
  {
    name: "লাক্সারি ডার্ক (Luxury Dark)",
    value: "bg-gradient-to-r from-slate-900 via-neutral-900 to-amber-950",
    className: "bg-gradient-to-r from-slate-900 via-neutral-900 to-amber-950",
  },
];

export default function AppearanceSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [headerLogo, setHeaderLogo] = useState("");
  const [footerLogo, setFooterLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [storeName, setStoreName] = useState("Mehzin Offers");
  const [storeTagline, setStoreTagline] = useState("Premium E-commerce in Bangladesh");
  const [storeDescription, setStoreDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#f52d68");
  const [notificationTone, setNotificationTone] = useState("");
  const [socialImage, setSocialImage] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [messengerUrl, setMessengerUrl] = useState("");

  // Offer Top Header state
  const [offerBarEnabled, setOfferBarEnabled] = useState(false);
  const [offerBarTitle, setOfferBarTitle] = useState("পূজার সেল অফার!");
  const [offerBarSubtitle, setOfferBarSubtitle] = useState("অফার চলবে ৩ দিন — সমস্ত কালেকশনে আকর্ষণীয় ছাড়");
  const [offerBarBadgeText, setOfferBarBadgeText] = useState("পূজা স্পেশাল");
  const [offerBarEndDate, setOfferBarEndDate] = useState("");
  const [offerBarButtonText, setOfferBarButtonText] = useState("অফার দেখুন");
  const [offerBarButtonLink, setOfferBarButtonLink] = useState("/categories");
  const [offerBarBgGradient, setOfferBarBgGradient] = useState("bg-primary");
  const [offerBarAutoFallbackOnExpire, setOfferBarAutoFallbackOnExpire] = useState(true);

  // Discount Price toggle state
  const [showDiscountPrice, setShowDiscountPrice] = useState(true);

  // Live timer for admin preview
  const [previewTime, setPreviewTime] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      if (!offerBarEndDate) {
        setPreviewTime((prev) => {
          let s = prev.seconds - 1;
          let m = prev.minutes;
          let h = prev.hours;
          let d = prev.days;
          if (s < 0) {
            s = 59;
            m -= 1;
          }
          if (m < 0) {
            m = 59;
            h -= 1;
          }
          if (h < 0) {
            h = 23;
            d = Math.max(0, d - 1);
          }
          return { days: d, hours: h, minutes: m, seconds: s };
        });
        return;
      }

      const diff = new Date(offerBarEndDate).getTime() - Date.now();
      if (diff > 0) {
        setPreviewTime({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [offerBarEndDate]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/appearance");
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.headerLogo) setHeaderLogo(data.settings.headerLogo);
          if (data.settings.footerLogo) setFooterLogo(data.settings.footerLogo);
          if (data.settings.favicon) setFavicon(data.settings.favicon);
          if (data.settings.storeName) setStoreName(data.settings.storeName);
          if (data.settings.storeTagline) setStoreTagline(data.settings.storeTagline);
          if (data.settings.storeDescription) setStoreDescription(data.settings.storeDescription);
          if (data.settings.primaryColor) setPrimaryColor(data.settings.primaryColor);
          if (data.settings.notificationTone) setNotificationTone(data.settings.notificationTone);
          if (data.settings.socialImage) setSocialImage(data.settings.socialImage);
          if (data.settings.facebookUrl) setFacebookUrl(data.settings.facebookUrl);
          if (data.settings.instagramUrl) setInstagramUrl(data.settings.instagramUrl);
          if (data.settings.youtubeUrl) setYoutubeUrl(data.settings.youtubeUrl);
          if (data.settings.whatsappUrl) setWhatsappUrl(data.settings.whatsappUrl);
          if (data.settings.messengerUrl) setMessengerUrl(data.settings.messengerUrl);

          // Offer bar settings
          if (data.settings.offerBarEnabled !== undefined) setOfferBarEnabled(data.settings.offerBarEnabled);
          if (data.settings.offerBarTitle) setOfferBarTitle(data.settings.offerBarTitle);
          if (data.settings.offerBarSubtitle) setOfferBarSubtitle(data.settings.offerBarSubtitle);
          if (data.settings.offerBarBadgeText) setOfferBarBadgeText(data.settings.offerBarBadgeText);
          if (data.settings.offerBarEndDate) setOfferBarEndDate(data.settings.offerBarEndDate);
          if (data.settings.offerBarButtonText) setOfferBarButtonText(data.settings.offerBarButtonText);
          if (data.settings.offerBarButtonLink) setOfferBarButtonLink(data.settings.offerBarButtonLink);
          if (data.settings.offerBarBgGradient) setOfferBarBgGradient(data.settings.offerBarBgGradient);
          if (data.settings.offerBarAutoFallbackOnExpire !== undefined) {
            setOfferBarAutoFallbackOnExpire(data.settings.offerBarAutoFallbackOnExpire);
          }
          if (data.settings.showDiscountPrice !== undefined) {
            setShowDiscountPrice(data.settings.showDiscountPrice);
          }
        }
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const setPresetCountdown = (days: number) => {
    const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    const hours = String(target.getHours()).padStart(2, "0");
    const minutes = String(target.getMinutes()).padStart(2, "0");
    setOfferBarEndDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    toast.success(`কাউন্টডাউন ${days} দিনের জন্য সেট করা হয়েছে`);
  };

  const handleFileUpload = async (file: File, type: 'header' | 'footer' | 'favicon' | 'tone' | 'social') => {
    try {
      if (type === 'tone') {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = {
          timestamp,
          folder: "readywear/appearance",
        };
        const signRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paramsToSign })
        });
        const { signature } = await signRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "readywear/appearance");
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Audio upload failed");
        
        setNotificationTone(uploadData.secure_url);
        toast.success("Audio uploaded successfully");
        return;
      }

      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
      });

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          file: base64File, 
          folder: "readywear/appearance",
          type: 'image'
        }),
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
      
      const url = uploadData.url;
      if (type === 'header') setHeaderLogo(url);
      else if (type === 'footer') setFooterLogo(url);
      else if (type === 'favicon') setFavicon(url);
      else if (type === 'social') setSocialImage(url);
      
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headerLogo,
          footerLogo,
          favicon,
          storeName,
          storeTagline,
          storeDescription,
          primaryColor,
          notificationTone,
          socialImage,
          facebookUrl,
          instagramUrl,
          youtubeUrl,
          whatsappUrl,
          messengerUrl,
          offerBarEnabled,
          offerBarTitle,
          offerBarSubtitle,
          offerBarBadgeText,
          offerBarEndDate,
          offerBarButtonText,
          offerBarButtonLink,
          offerBarBgGradient,
          offerBarAutoFallbackOnExpire,
          showDiscountPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Appearance settings updated successfully");
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 mb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Appearance & Promotion Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website's logos, branding, and promotional top headers</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">

        {/* ========================================================================= */}
        {/* 1. OFFER TOP HEADER & COUNTDOWN TIMER SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-md p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                <BadgePercent className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900">
                    পূজার সেল অফার & কাউন্টডাউন হেডার (Offer Top Header)
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      offerBarEnabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {offerBarEnabled ? "সক্রিয় (Active)" : "বন্ধ (Regular Header)"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  ওয়েবসাইটের শীর্ষে লাইভ কাউন্টডাউন টাইমার সহ অফার ব্যানার প্রদর্শন বা বন্ধ রাখুন
                </p>
              </div>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={offerBarEnabled}
                  onChange={(e) => setOfferBarEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {offerBarEnabled ? "অফার ব্যানার চালু" : "অফার ব্যানার বন্ধ"}
              </span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="mt-6 space-y-6 relative z-10">
            {/* Title, Subtitle, Badge in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  অফারের শিরোনাম (Offer Title)
                </label>
                <input
                  type="text"
                  value={offerBarTitle}
                  onChange={(e) => setOfferBarTitle(e.target.value)}
                  placeholder="যেমন: পূজার সেল অফার!"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  বিস্তারিত / সাবটাইটেল (Subtitle)
                </label>
                <input
                  type="text"
                  value={offerBarSubtitle}
                  onChange={(e) => setOfferBarSubtitle(e.target.value)}
                  placeholder="যেমন: অফার চলবে ৩ দিন — আকর্ষণীয় ছাড়"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  হাইলাইট ব্যাজ (Badge Text)
                </label>
                <input
                  type="text"
                  value={offerBarBadgeText}
                  onChange={(e) => setOfferBarBadgeText(e.target.value)}
                  placeholder="যেমন: পূজা স্পেশাল"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                />
              </div>
            </div>

            {/* Countdown Configuration */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-rose-50/50 to-orange-50/40 rounded-xl border border-rose-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Tag className="w-4 h-4 text-primary" />
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      কাউন্টডাউন শেষ হওয়ার তারিখ ও সময় (End Date & Time)
                    </label>
                  </div>
                  <input
                    type="datetime-local"
                    value={offerBarEndDate}
                    onChange={(e) => setOfferBarEndDate(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium shadow-xs"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    এই সময় পর্যন্ত লাইভ টাইমারটি সেকেন্ড গুনে গুনে চলবে।
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    দ্রুত সময় নির্ধারণ (Quick Presets):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPresetCountdown(1)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-gray-700 hover:text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                    >
                      +১ দিন (24h)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCountdown(2)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-gray-700 hover:text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                    >
                      +২ দিন (48h)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCountdown(3)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg shadow-sm shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                    >
                      ⭐ +৩ দিন (৩ দিনের সেল)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCountdown(5)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-gray-700 hover:text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                    >
                      +৫ দিন
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetCountdown(7)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-gray-700 hover:text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                    >
                      +৭ দিন (১ সপ্তাহ)
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto Fallback Checkbox */}
              <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoFallbackCheckbox"
                  checked={offerBarAutoFallbackOnExpire}
                  onChange={(e) => setOfferBarAutoFallbackOnExpire(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="autoFallbackCheckbox" className="text-xs sm:text-sm text-gray-700 font-medium cursor-pointer">
                  অফারের সময় শেষ হয়ে গেলে স্বয়ংক্রিয়ভাবে নিয়মিত হেডারে (হোম ডেলিভারি, নিরাপদ পেমেন্ট) ফিরে যাবে
                </label>
              </div>
            </div>

            {/* Button text & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  বাটন টেক্সট (Button Text)
                </label>
                <input
                  type="text"
                  value={offerBarButtonText}
                  onChange={(e) => setOfferBarButtonText(e.target.value)}
                  placeholder="যেমন: অফার দেখুন"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  বাটন লিঙ্ক (Button Link)
                </label>
                <input
                  type="text"
                  value={offerBarButtonLink}
                  onChange={(e) => setOfferBarButtonLink(e.target.value)}
                  placeholder="যেমন: /categories বা /products"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                />
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                ব্যানারের কালার স্টাইল (Color Preset)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {COLOR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setOfferBarBgGradient(preset.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-20 relative overflow-hidden group ${
                      offerBarBgGradient === preset.value
                        ? "border-primary ring-2 ring-primary/20 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-full h-5 rounded-md ${preset.className} shadow-2xs mb-1.5 flex items-center justify-end px-1`}>
                      {offerBarBgGradient === preset.value && (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Interactive Live Preview */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    লাইভ প্রিভিউ (Live Preview - স্টোরে যেমন দেখাবে)
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {offerBarEnabled ? "✨ অফার ব্যানার সক্রিয়" : "🛡️ নিয়মিত হেডার সক্রিয়"}
                </span>
              </div>

              {/* Preview Window Box */}
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                {offerBarEnabled ? (
                  <div className={`w-full ${offerBarBgGradient === "bg-primary" || !offerBarBgGradient ? "bg-primary" : (offerBarBgGradient.startsWith("from-") ? `bg-gradient-to-r ${offerBarBgGradient}` : offerBarBgGradient)} text-white py-2.5 px-4 shadow-inner`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {offerBarBadgeText && (
                          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase">
                            <BadgePercent className="w-3.5 h-3.5 text-white animate-pulse" />
                            <span>{offerBarBadgeText}</span>
                          </span>
                        )}
                        <Flame className="w-4 h-4 text-amber-200 fill-amber-300 animate-pulse" />
                        <span className="font-bold text-xs sm:text-sm drop-shadow-xs">{offerBarTitle}</span>
                        {offerBarSubtitle && (
                          <>
                            <span className="text-white/40 hidden sm:inline">•</span>
                            <span className="text-white/95 font-medium hidden md:inline text-xs sm:text-sm">
                              {offerBarSubtitle}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Countdown preview */}
                        <div className="flex items-center gap-1 text-white">
                          <Tag className="w-3.5 h-3.5 text-white/90 hidden xs:inline" />
                          <div className="flex flex-col items-center bg-white/20 px-1.5 py-0.5 rounded border border-white/25 min-w-[26px]">
                            <span className="font-mono text-xs font-black leading-none text-white">{pad(previewTime.days)}</span>
                            <span className="text-[8px] text-white/90 font-medium leading-none mt-0.5">দিন</span>
                          </div>
                          <span className="text-white/70 font-mono font-bold leading-none text-xs">:</span>
                          <div className="flex flex-col items-center bg-white/20 px-1.5 py-0.5 rounded border border-white/25 min-w-[26px]">
                            <span className="font-mono text-xs font-black leading-none text-white">{pad(previewTime.hours)}</span>
                            <span className="text-[8px] text-white/90 font-medium leading-none mt-0.5">ঘণ্টা</span>
                          </div>
                          <span className="text-white/70 font-mono font-bold leading-none text-xs">:</span>
                          <div className="flex flex-col items-center bg-white/20 px-1.5 py-0.5 rounded border border-white/25 min-w-[26px]">
                            <span className="font-mono text-xs font-black leading-none text-white">{pad(previewTime.minutes)}</span>
                            <span className="text-[8px] text-white/90 font-medium leading-none mt-0.5">মি</span>
                          </div>
                          <span className="text-white/70 font-mono font-bold leading-none text-xs">:</span>
                          <div className="flex flex-col items-center bg-white/20 px-1.5 py-0.5 rounded border border-white/25 min-w-[26px]">
                            <span className="font-mono text-xs font-black leading-none text-amber-200 animate-pulse">{pad(previewTime.seconds)}</span>
                            <span className="text-[8px] text-white/90 font-medium leading-none mt-0.5">সে</span>
                          </div>
                        </div>

                        {offerBarButtonText && (
                          <div className="inline-flex items-center gap-1.5 bg-white text-primary px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
                            <Gift className="w-3 h-3 text-primary" />
                            <span>{offerBarButtonText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-primary text-white py-2 px-3 text-xs font-medium">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <BadgePercent className="w-3.5 h-3.5" />
                        <span>বিশেষ অফার ও আকর্ষণীয় ছাড়</span>
                      </div>
                      <span className="opacity-40">|</span>
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5" />
                        <span>সারা দেশে হোম ডেলিভারি</span>
                      </div>
                      <span className="opacity-40">|</span>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>১০০% অরিজিনাল ব্র্যান্ড পণ্য</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DISCOUNT PRICE ON/OFF SWITCH SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-md p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900">
                    ডিসকাউন্ট প্রাইস অন/অফ সুইচ (Discount Price Toggle)
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      showDiscountPrice
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {showDiscountPrice ? "🏷️ ডিসকাউন্ট প্রাইস চালু" : "🛡️ রেগুলার প্রাইস মোড (ছাড় বন্ধ)"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  অফার চলাকালীন ডিসকাউন্ট প্রাইস দেখান অথবা সাধারণ সময়ে রেগুলার প্রাইসে বিক্রি করুন
                </p>
              </div>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showDiscountPrice}
                  onChange={(e) => setShowDiscountPrice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {showDiscountPrice ? "ডিসকাউন্ট সক্রিয় (ON)" : "ডিসকাউন্ট বন্ধ (OFF)"}
              </span>
            </label>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explanation box */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  কার্যপ্রণালী (How it works):
                </h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓ চালু থাকলে (ON):</span>
                    <span>অফার চলাকালীন সময়ে ওয়েবসাইটে সব প্রোডাক্টে ছাড়ের মূল্য (Discount Price), মূল দাম কাটা দাগ (<s>৳১,৫০০</s>) এবং % ছাড় ব্যাজ প্রদর্শিত হবে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">✗ বন্ধ রাখলে (OFF):</span>
                    <span>কোনো ছাড়ের ব্যাজ বা কাটা দাগ থাকবে না। সরাসরি প্রতিটি পণ্যের মূল রেগুলার প্রাইস (যেমন: ৳১,৫০০) প্রদর্শিত হবে এবং কার্ট/অর্ডারেও রেগুলার প্রাইস হিসাব হবে।</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Live Pricing Preview Box */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                প্রোডাক্ট কার্ডে যেভাবে দাম দেখাবে (Live Preview):
              </span>
              
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-0.5">প্রোডাক্টের নাম (নমুনা ড্রেস)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">
                      {showDiscountPrice ? "৳ ১,২০০" : "৳ ১,৫০০"}
                    </span>
                    {showDiscountPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳ ১,৫০০
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {showDiscountPrice ? (
                    <span className="bg-primary text-white text-[11px] font-bold px-2 py-1 rounded shadow-2xs">
                      ২০% ছাড়
                    </span>
                  ) : (
                    <span className="bg-emerald-500/90 text-white text-[11px] font-bold px-2 py-1 rounded shadow-2xs">
                      ইন স্টক
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BASIC STORE INFO */}
        {/* ========================================================================= */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="Mehzin Offers"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Store Tagline (Browser Tab)</label>
              <input 
                type="text" 
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="Premium E-commerce in Bangladesh"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Store Description (SEO)</label>
              <textarea 
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook URL</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp URL</label>
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Messenger URL</label>
                <input
                  type="url"
                  value={messengerUrl}
                  onChange={(e) => setMessengerUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://m.me/..."
                />
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color (Hex)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 bg-transparent cursor-pointer"
                />
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase font-mono"
                  placeholder="#F5426A"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LOGOS & MEDIA ASSETS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Header Logo */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Header Logo</h3>
            <div className="mb-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 h-40 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              {headerLogo ? (
                <Image src={headerLogo} alt="Header Logo" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-contain p-4" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
              )}
            </div>
            <label className="block w-full py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl cursor-pointer transition-colors">
              <span>Upload Header Logo</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'header')}
              />
            </label>
          </div>

          {/* Footer Logo */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Footer Logo (Optional)</h3>
            <div className="mb-4 bg-gray-900 rounded-xl border border-dashed border-gray-700 h-40 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              {footerLogo ? (
                <Image src={footerLogo} alt="Footer Logo" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-contain p-4" />
              ) : headerLogo ? (
                <Image src={headerLogo} alt="Header Logo" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-contain p-4 opacity-50" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
              )}
            </div>
            <label className="block w-full py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl cursor-pointer transition-colors">
              <span>Upload Footer Logo</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'footer')}
              />
            </label>
          </div>

          {/* Favicon */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="font-bold text-gray-900 mb-4">Favicon (Browser Tab Icon)</h3>
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 w-24 h-24 flex items-center justify-center relative overflow-hidden shrink-0">
                {favicon ? (
                  <Image src={favicon} alt="Favicon" fill sizes="160px" priority className="object-contain p-4" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-4">
                  Upload a square image (e.g., 512x512px) to be used as your website's favicon. This image appears on browser tabs and bookmarks.
                </p>
                <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl cursor-pointer transition-colors">
                  <span>Upload Favicon</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                  />
                </label>
              </div>
            </div>
          </div>
            
          {/* Social Sharing Image */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="font-bold text-gray-900 mb-4">Social Sharing Image (OG Image)</h3>
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 w-48 h-24 flex items-center justify-center relative overflow-hidden shrink-0">
                {socialImage ? (
                  <Image src={socialImage} alt="Social Image" fill sizes="192px" priority className="object-contain p-2" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-4">
                  Upload an image (recommended size: 1200x630px) to be displayed when your website link is shared on Facebook, WhatsApp, Telegram, etc.
                </p>
                <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl cursor-pointer transition-colors">
                  <span>Upload Social Image</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'social')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Notification Tone */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="font-bold text-gray-900 mb-4">Notification Tone (MP3/WAV)</h3>
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 w-24 h-24 flex items-center justify-center relative overflow-hidden shrink-0">
                {notificationTone ? (
                  <div className="flex flex-col items-center justify-center text-primary">
                    <Music className="w-8 h-8 mb-2" />
                    <span className="text-[10px] font-bold">AUDIO SET</span>
                  </div>
                ) : (
                  <Music className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-4">
                  Upload an audio file (e.g., MP3 or WAV) to be played when new orders or important notifications arrive in the admin panel. 
                  Leave blank to use the default chime.
                </p>
                <div className="flex items-center gap-3">
                  <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl cursor-pointer transition-colors">
                    <span>Upload Audio</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'tone')}
                    />
                  </label>
                  {notificationTone && (
                    <button 
                      onClick={() => new Audio(notificationTone).play()} 
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm rounded-xl transition-colors"
                    >
                      Play Preview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
