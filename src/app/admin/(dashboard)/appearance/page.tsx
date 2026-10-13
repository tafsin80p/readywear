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
  Eye, 
  Calendar, 
  Check,
  Layers,
  Sparkles,
  Palette,
  Sliders,
  Share2,
  Globe,
  Store,
  Info,
  CheckCircle2,
  Volume2
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
  const [activeTab, setActiveTab] = useState<"offers" | "general" | "all">("offers");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // General Appearance state
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

  // Offer & Campaign state
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

  // Exclusive Offer Category Mode state
  const [offerCategoriesOnly, setOfferCategoriesOnly] = useState(false);
  const [offerCategorySlugs, setOfferCategorySlugs] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ slug: string; name: string; image?: string }[]>([]);

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
          if (data.settings.offerCategoriesOnly !== undefined) {
            setOfferCategoriesOnly(data.settings.offerCategoriesOnly);
          }
          if (data.settings.offerCategorySlugs) {
            setOfferCategorySlugs(data.settings.offerCategorySlugs);
          }
        }
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();

    // Fetch store categories for offer selection
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setAvailableCategories(data.categories.map((c: any) => ({
            slug: c.slug,
            name: c.name,
            image: c.image
          })));
        }
      })
      .catch(() => {});
  }, []);

  const toggleCategorySlug = (slug: string) => {
    setOfferCategorySlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const selectAllCategories = () => {
    setOfferCategorySlugs(availableCategories.map(c => c.slug));
  };

  const clearCategorySelection = () => {
    setOfferCategorySlugs([]);
  };

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
          offerCategoriesOnly,
          offerCategorySlugs,
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

  const activeOfferFeaturesCount = 
    (offerBarEnabled ? 1 : 0) + 
    (showDiscountPrice ? 1 : 0) + 
    (offerCategoriesOnly ? 1 : 0);

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 mb-24 max-w-7xl mx-auto">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              অ্যাপিয়ারেন্স ও অফার কন্ট্রোল
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Admin Settings
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            ওয়েবসাইটের ব্র্যান্ডিং, ডিজাইন এবং চলমান অফার ও ক্যাম্পেইন আলাদাভাবে পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isLoading ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সেভ করুন"}
          </button>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Tab 1: Offers & Campaigns */}
          <button
            type="button"
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "offers"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/80 text-primary"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>অফার ও ক্যাম্পেইন কন্ট্রোল</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeOfferFeaturesCount > 0 
                ? "bg-rose-100 text-rose-700" 
                : "bg-gray-200 text-gray-600"
            }`}>
              {activeOfferFeaturesCount}টি সক্রিয়
            </span>
          </button>

          {/* Tab 2: General Appearance & Branding */}
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/80 text-primary"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Palette className="w-4 h-4 text-primary" />
            <span>সাধারণ অ্যাপিয়ারেন্স ও ব্র্যান্ডিং</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-200 text-gray-600">
              মূল সেটিংস
            </span>
          </button>

          {/* Tab 3: View All */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/80 text-primary"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Sliders className="w-4 h-4 text-gray-500" />
            <span>সবগুলো দেখুন (All)</span>
          </button>
        </div>

        {/* Quick Info Indicator */}
        <div className="hidden lg:flex items-center gap-3 pr-2 text-xs font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${offerBarEnabled ? "bg-emerald-500" : "bg-gray-300"}`} />
            অফার হেডার: {offerBarEnabled ? "ON" : "OFF"}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${showDiscountPrice ? "bg-emerald-500" : "bg-gray-300"}`} />
            ডিসকাউন্ট: {showDiscountPrice ? "ON" : "OFF"}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${offerCategoriesOnly ? "bg-rose-500" : "bg-gray-300"}`} />
            এক্সক্লুসিভ ক্যাটাগরি: {offerCategoriesOnly ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION GROUP 1: OFFFER & CAMPAIGN CONTROLS                               */}
      {/* ========================================================================= */}
      {(activeTab === "offers" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Group Banner / Notice */}
          <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 border border-rose-200/70 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  অফার ও ক্যাম্পেইন স্পেশাল ফিচারসমূহ (Offer & Campaign Control)
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  পূজা, ঈদ বা যেকোনো বিশেষ অফার চলাকালীন সময় ওয়েবসাইটের ব্যানার, ছাড়ের দাম ও ক্যাটাগরি ফিল্টার এখান থেকে হ্যান্ডেল করুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 shadow-2xs">
                {activeOfferFeaturesCount === 0 ? "⚠️ বর্তমানে কোনো অফার চালু নেই" : `🔥 ${activeOfferFeaturesCount}টি ক্যাম্পেইন কন্ট্রোল সক্রিয়`}
              </span>
            </div>
          </div>

          {/* 1.1: OFFER TOP HEADER & COUNTDOWN TIMER */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-md p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                  <BadgePercent className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900">
                      ১. অফার টপ হেডার & লাইভ কাউন্টডাউন টাইমার (Offer Top Bar)
                    </h3>
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
                    ওয়েবসাইটের শীর্ষে লাইভ কাউন্টডাউন টাইমার সহ স্পেশাল অফার ব্যানার প্রদর্শন বা বন্ধ রাখুন
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
                    placeholder="যেমন: অফার চলবে ৩ দিন — সমস্ত কালেকশনে আকর্ষণীয় ছাড়"
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

          {/* 1.2: DISCOUNT PRICE ON/OFF SWITCH */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-md p-5 sm:p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900">
                      ২. ডিসকাউন্ট প্রাইস অন/অফ সুইচ (Discount Price Display)
                    </h3>
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
                    অফার চলাকালীন ডিসকাউন্ট প্রাইস দেখান অথবা সাধারণ সময়ে পণ্যের নিয়মিত রেগুলার মূল্যে বিক্রি করুন
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

          {/* 1.3: EXCLUSIVE OFFER CATEGORY FILTER */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-md p-5 sm:p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-gray-900">
                      ৩. অফার ক্যাটাগরি এক্সক্লুসিভ মোড (Offer Categories Exclusive Filter)
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        offerCategoriesOnly
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {offerCategoriesOnly ? "🔥 অফার ক্যাটাগরি মোড সক্রিয়" : "🌐 স্বাভাবিক মোড (সব ক্যাটাগরি চালু)"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    যে যে ক্যাটাগরিতে অফার চলবে শুধুমাত্র সেগুলোই ওয়েবসাইটে দেখাবে, বাকি সমস্ত ক্যাটাগরি ও প্রোডাক্ট হাইড থাকবে
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={offerCategoriesOnly}
                    onChange={(e) => setOfferCategoriesOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {offerCategoriesOnly ? "ফিল্টার সক্রিয় (ON)" : "ফিল্টার বন্ধ (OFF)"}
                </span>
              </label>
            </div>

            <div className="mt-5 space-y-4">
              {/* Category Selector */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      যেসব ক্যাটাগরিতে অফার চলবে (Select Offer Categories):
                    </label>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {offerCategorySlugs.length} টি সিলেক্টেড
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllCategories}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      সবগুলো নির্বাচন করুন
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={clearCategorySelection}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                    >
                      ক্লিয়ার করুন
                    </button>
                  </div>
                </div>

                {availableCategories.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-400 text-sm">
                    ক্যাটাগরি লোড হচ্ছে...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCategories.map((cat) => {
                      const isSelected = offerCategorySlugs.includes(cat.slug);
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => toggleCategorySlug(cat.slug)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                            isSelected
                              ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs"
                              : "bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className={`text-sm font-bold truncate ${isSelected ? "text-primary" : "text-gray-800"}`}>
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono truncate">
                              {cat.slug}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-primary text-white" : "border border-gray-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Impact / Explanation Alert Box */}
              <div className={`p-4 rounded-xl border transition-all ${
                offerCategoriesOnly
                  ? "bg-rose-50/70 border-rose-200"
                  : "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    offerCategoriesOnly ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {offerCategoriesOnly ? <Flame className="w-4 h-4 animate-pulse" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {offerCategoriesOnly ? "লাইভ স্টোরফ্রন্ট প্রভাব (Live Impact):" : "স্বাভাবিক মোড নির্দেশনা:"}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {offerCategoriesOnly ? (
                        offerCategorySlugs.length > 0 ? (
                          <>
                            <span className="font-bold text-rose-700">অফার মোড চালু আছে:</span> কাস্টমাররা ওয়েবসাইটে ভিজিট করলে হোমপেজের কালেকশন, ক্যাটাগরি মেনু, ড্রয়ার এবং সার্চবারে <strong>শুধুমাত্র নির্বাচিত {offerCategorySlugs.length}টি ক্যাটাগরির পণ্যই দেখতে পাবেন</strong>। অন্যান্য সমস্ত ক্যাটাগরি ও তাদের পণ্য সাময়িকভাবে সম্পূর্ণ হাইড থাকবে।
                          </>
                        ) : (
                          <span className="text-amber-700 font-semibold">
                            ⚠️ অফার মোড অন করা আছে কিন্তু কোনো ক্যাটাগরি সিলেক্ট করা হয়নি! অনুগ্রহ করে উপরে অন্তত ১টি ক্যাটাগরি সিলেক্ট করুন।
                          </span>
                        )
                      ) : (
                        "বর্তমানে অফার ফিল্টার বন্ধ রয়েছে। ওয়েবসাইটের সমস্ত ক্যাটাগরি ও পণ্য সাধারণ নিয়মে সবার জন্য উন্মুক্ত আছে।"
                      )}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION GROUP 2: GENERAL STORE APPEARANCE & BRANDING                      */}
      {/* ========================================================================= */}
      {(activeTab === "general" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Group Banner */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/70 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  সাধারণ স্টোর অ্যাপিয়ারেন্স ও ব্র্যান্ডিং (Store Branding & Identity)
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  ওয়েবসাইটের লোগো, থিম কালার, স্টোর নাম, এসইও বিবরণ, নোটিফিকেশন সাউন্ড এবং সোশ্যাল লিংক
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-800 shadow-2xs self-start md:self-auto">
              🎨 স্টোর স্থায়ী ডিজাইন সেটিংস
            </span>
          </div>

          {/* 2.1: LOGOS & MEDIA ASSETS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-gray-900">
                লোগো ও মিডিয়া এসেটস (Logos & Favicon)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Logo */}
              <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/80">
                <h4 className="text-sm font-bold text-gray-900 mb-1">হেডার লোগো (Header Logo)</h4>
                <p className="text-xs text-gray-500 mb-3">ওয়েবসাইটের মূল নেভিগেশন বারে প্রদর্শিত লোগো</p>
                <div className="mb-4 bg-white rounded-xl border border-dashed border-gray-300 h-36 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-2xs">
                  {headerLogo ? (
                    <Image src={headerLogo} alt="Header Logo" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-contain p-3" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-xs">লোগো আপলোড করা হয়নি</span>
                    </div>
                  )}
                </div>
                <label className="block w-full py-2.5 text-center bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors border border-gray-300 shadow-2xs">
                  <span>আপলোড হেডার লোগো</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'header')}
                  />
                </label>
              </div>

              {/* Footer Logo */}
              <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/80">
                <h4 className="text-sm font-bold text-gray-900 mb-1">ফুটার লোগো (Footer Logo)</h4>
                <p className="text-xs text-gray-500 mb-3">ওয়েবসাইটের নিচের ডার্ক ফুটারে প্রদর্শিত লোগো</p>
                <div className="mb-4 bg-gray-900 rounded-xl border border-dashed border-gray-700 h-36 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-2xs">
                  {footerLogo ? (
                    <Image src={footerLogo} alt="Footer Logo" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-contain p-3" />
                  ) : headerLogo ? (
                    <Image src={headerLogo} alt="Header Logo" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-contain p-3 opacity-50" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-xs">হেডার লোগো ডিফল্ট হিসেবে ব্যবহৃত হবে</span>
                    </div>
                  )}
                </div>
                <label className="block w-full py-2.5 text-center bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors border border-gray-300 shadow-2xs">
                  <span>আপলোড ফুটার লোগো</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'footer')}
                  />
                </label>
              </div>

              {/* Favicon */}
              <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/80">
                <h4 className="text-sm font-bold text-gray-900 mb-1">ফেভিকন (Favicon / Browser Tab Icon)</h4>
                <p className="text-xs text-gray-500 mb-3">ব্রাউজারের ট্যাবে এবং বুকমার্কে ছোট আইকন হিসেবে দেখাবে</p>
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 w-24 h-24 flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xs">
                    {favicon ? (
                      <Image src={favicon} alt="Favicon" fill sizes="96px" priority className="object-contain p-3" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-block px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors border border-gray-300 shadow-2xs">
                      <span>আপলোড ফেভিকন</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-2">স্কয়ার ইমেজ (যেমন: 512x512px) সুপারিশকৃত</p>
                  </div>
                </div>
              </div>

              {/* Social Sharing Image */}
              <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/80">
                <h4 className="text-sm font-bold text-gray-900 mb-1">সোশ্যাল শেয়ারিং ছবি (OG Image)</h4>
                <p className="text-xs text-gray-500 mb-3">ফেসবুক, হোয়াটসঅ্যাপ বা মেসেঞ্জারে ওয়েবসাইট লিংক শেয়ার করলে প্রিভিউ ছবি</p>
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 w-36 h-24 flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xs">
                    {socialImage ? (
                      <Image src={socialImage} alt="Social Image" fill sizes="144px" priority className="object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-block px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors border border-gray-300 shadow-2xs">
                      <span>আপলোড সোশ্যাল প্রিভিউ</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'social')}
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-2">1200x630px সাইজ সেরা প্রিভিউ দেয়</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2.2: BASIC STORE INFORMATION & THEME COLOR */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <Store className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-gray-900">
                স্টোর তথ্য ও ব্র্যান্ড কালার (Store Identity & Primary Color)
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    স্টোরের নাম (Store Name)
                  </label>
                  <input 
                    type="text" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Mehzin Offers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    ট্যাগলাইন / ব্রাউজার টাইটেল (Store Tagline)
                  </label>
                  <input 
                    type="text" 
                    value={storeTagline}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Premium E-commerce in Bangladesh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  স্টোর বিবরণ / এসইও মেটা ডেসক্রিপশন (Store Description / SEO)
                </label>
                <textarea 
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none font-medium"
                  placeholder="আপনার শপ সম্পর্কিত সংক্ষিপ্ত বিবরণ..."
                />
              </div>

              {/* Theme Primary Color */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  ওয়েবসাইটের প্রাইমারি ব্র্যান্ড কালার (Primary Brand Color)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl border border-gray-200 bg-transparent cursor-pointer shadow-2xs"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase font-mono font-bold"
                    placeholder="#F52D68"
                  />
                  <span className="text-xs text-gray-500">
                    হেডার, বাটন ও হাইলাইট অ্যাকসেন্টের মূল কালার
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2.3: SOCIAL MEDIA LINKS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-gray-900">
                সোশ্যাল মিডিয়া ও কন্টাক্ট লিঙ্ক (Social Media & Messaging Links)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Facebook Page URL</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp Link / Number</label>
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  placeholder="https://wa.me/8801700000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Messenger URL</label>
                <input
                  type="url"
                  value={messengerUrl}
                  onChange={(e) => setMessengerUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  placeholder="https://m.me/..."
                />
              </div>
            </div>
          </div>

          {/* 2.4: NOTIFICATION SOUND */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-gray-900">
                অ্যাডমিন অর্ডার নোটিফিকেশন সাউন্ড (Order Alert Tone)
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 w-20 h-20 flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xs">
                {notificationTone ? (
                  <div className="flex flex-col items-center justify-center text-primary">
                    <Music className="w-7 h-7 mb-1" />
                    <span className="text-[9px] font-black tracking-wider">CUSTOM</span>
                  </div>
                ) : (
                  <Music className="w-6 h-6 text-gray-300" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  নতুন অর্ডার আসার সাথে সাথে অ্যাডমিন প্যানেলে এই অডিও টোনটি প্লে হবে। খালি রাখলে ডিফল্ট বেল সাউন্ড বাজবে।
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors border border-gray-200 shadow-2xs">
                    <span>কাস্টম অডিও আপলোড (MP3/WAV)</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'tone')}
                    />
                  </label>
                  {notificationTone && (
                    <button 
                      type="button"
                      onClick={() => new Audio(notificationTone).play()} 
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      প্লে করে শুনুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating Bottom Save Banner for convenience */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-gray-200 shadow-xl flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 font-medium">
          <Info className="w-4 h-4 text-primary" />
          <span>পরিবর্তন সম্পন্ন হলে সেভ করুন</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? "সংরক্ষণ হচ্ছে..." : "Save Changes"}
        </button>
      </div>

    </div>
  );
}
