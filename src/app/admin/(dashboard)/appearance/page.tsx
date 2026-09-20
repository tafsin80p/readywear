"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Loader2, Music } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

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
        }
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, []);

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
          type: type === 'tone' ? 'audio' : 'image'
        }),
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
      
      const url = uploadData.url;
      if (type === 'header') setHeaderLogo(url);
      else if (type === 'footer') setFooterLogo(url);
      else if (type === 'favicon') setFavicon(url);
      else if (type === 'social') setSocialImage(url);
      else if (type === 'tone') setNotificationTone(url);
      
      toast.success(type === 'tone' ? "Audio uploaded successfully" : "Image uploaded successfully");
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
          messengerUrl
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Appearance settings updated successfully");
        // Force reload to apply favicon immediately
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

  return (
    <div className="w-full p-6 space-y-6 mb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Appearance Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website's logos and identity</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="Mehzin Offers"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Store Tagline (Browser Tab)</label>
              <input 
                type="text" 
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="Premium E-commerce in Bangladesh"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Store Description (SEO)</label>
              <textarea 
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
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
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase"
                  placeholder="#F5426A"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logos */}
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2 mt-6">
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
