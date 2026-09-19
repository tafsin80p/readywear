"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Send, CheckCircle, XCircle, Copy, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Order ID", "Customer Name", "Customer Phone", "Customer Address", "Products", "Subtotal", "Shipping", "Total", "Payment Method", "Status"]);
      sheet.getRange("A1:K1").setFontWeight("bold");
    }
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.orderId || "", data.customerName || "", data.customerPhone || "",
      data.customerAddress || "", data.products || "", data.subtotal || 0,
      data.shipping || 0, data.total || 0, data.paymentMethod || "", data.status || ""
    ]);
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const range = sheet.getRange(lastRow, 1, 1, lastCol);
    
    range.setVerticalAlignment("middle");
    range.setWrap(true);
    sheet.autoResizeColumns(1, lastCol);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<'pathao' | 'steadfast' | null>(null);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setExpanded(null);
      setIsClosing(false);
    }, 200);
  };

  const [telegram, setTelegram] = useState({
    enabled: false,
    botToken: "",
    chatId: "",
    authorizedUsers: ""
  });

  const [meta, setMeta] = useState({
    enabled: false,
    pixelId: "",
    accessToken: "",
    testEventCode: "",
    datasetName: "",
    currency: "BDT"
  });

  const [googleSheet, setGoogleSheet] = useState({
    enabled: false,
    webhookUrl: "",
    sheetUrl: ""
  });

  const [googleAnalytics, setGoogleAnalytics] = useState({
    enabled: false,
    measurementId: ""
  });

  const [tiktok, setTiktok] = useState({
    enabled: false,
    pixelId: ""
  });

  const [pushNotification, setPushNotification] = useState({
    enabled: false,
    appId: "",
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    vapidKey: "",
    serviceAccountJson: ""
  });

  const [pathao, setPathao] = useState({
    enabled: false,
    clientId: "",
    clientSecret: "",
    storeId: "",
    logoUrl: ""
  });

  const [steadfast, setSteadfast] = useState({
    enabled: false,
    apiKey: "",
    secretKey: "",
    logoUrl: ""
  });

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/integrations");
      const data = await res.json();
      if (data.success && data.settings) {
        setTelegram({
          ...data.settings.telegram,
          authorizedUsers: data.settings.telegram?.authorizedUsers?.join(", ") || ""
        });
        if (data.settings.meta) setMeta(data.settings.meta);
        if (data.settings.googleAnalytics) setGoogleAnalytics(data.settings.googleAnalytics);
        if (data.settings.tiktok) setTiktok(data.settings.tiktok);
        if (data.settings.pushNotification) setPushNotification(data.settings.pushNotification);
        if (data.settings.googleSheet) setGoogleSheet(data.settings.googleSheet);
        if (data.settings.pathao) setPathao(data.settings.pathao);
        if (data.settings.steadfast) setSteadfast(data.settings.steadfast);
        setPendingUsers(data.settings.telegram?.pendingTelegramUsers || []);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (overridePayload?: any) => {
    setSaving(true);
    try {
      const payload = overridePayload || {
        telegram: {
          ...telegram,
          authorizedUsers: telegram.authorizedUsers.split(",").map(u => u.trim()).filter(Boolean)
        },
        meta,
        googleAnalytics,
        tiktok,
        pushNotification,
        googleSheet,
        pathao,
        steadfast
      };

      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        if (!overridePayload?.isLogoUpload) {
          toast.success("Settings saved successfully!");
        }
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (type: 'pathao' | 'steadfast', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(type);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64data, folder: "readywear/integrations" })
        });
        const data = await res.json();
        
        if (data.url) {
          const payload = {
            telegram: { ...telegram, authorizedUsers: telegram.authorizedUsers.split(",").map(u => u.trim()).filter(Boolean) },
            meta,
            googleAnalytics,
            googleSheet,
            pathao: { ...pathao, logoUrl: type === 'pathao' ? data.url : pathao.logoUrl },
            steadfast: { ...steadfast, logoUrl: type === 'steadfast' ? data.url : steadfast.logoUrl },
            isLogoUpload: true
          };

          if (type === 'pathao') setPathao({ ...pathao, logoUrl: data.url });
          else setSteadfast({ ...steadfast, logoUrl: data.url });

          await handleSave(payload);
          toast.success("Logo updated successfully!");
        } else {
          toast.error("Failed to upload logo");
        }
        setUploadingLogo(null);
      };
    } catch (error) {
      toast.error("Error uploading logo");
      setUploadingLogo(null);
    }
  };

  const handleToggle = (type: 'telegram' | 'meta' | 'googleAnalytics' | 'tiktok' | 'pushNotification' | 'googleSheet' | 'pathao' | 'steadfast', enabled: boolean) => {
    const payload = {
      telegram: { ...telegram, authorizedUsers: telegram.authorizedUsers.split(",").map(u => u.trim()).filter(Boolean) },
      meta,
      googleAnalytics,
      tiktok,
      pushNotification,
      googleSheet,
      pathao,
      steadfast
    };
    
    if (type === 'telegram') {
      setTelegram({ ...telegram, enabled });
      payload.telegram.enabled = enabled;
    } else if (type === 'meta') {
      setMeta({ ...meta, enabled });
      payload.meta.enabled = enabled;
    } else if (type === 'googleAnalytics') {
      setGoogleAnalytics({ ...googleAnalytics, enabled });
      payload.googleAnalytics.enabled = enabled;
    } else if (type === 'tiktok') {
      setTiktok({ ...tiktok, enabled });
      payload.tiktok.enabled = enabled;
    } else if (type === 'pushNotification') {
      setPushNotification({ ...pushNotification, enabled });
      payload.pushNotification.enabled = enabled;
    } else if (type === 'googleSheet') {
      setGoogleSheet({ ...googleSheet, enabled });
      payload.googleSheet.enabled = enabled;
    } else if (type === 'pathao') {
      setPathao({ ...pathao, enabled });
      payload.pathao.enabled = enabled;
    } else if (type === 'steadfast') {
      setSteadfast({ ...steadfast, enabled });
      payload.steadfast.enabled = enabled;
    }
    
    handleSave(payload);
  };

  const handleTestTelegram = async () => {
    if (!telegram.botToken || !telegram.chatId) {
      toast.error("Bot Token and Chat ID required to test.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/admin/integrations/test-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: telegram.botToken, chatId: telegram.chatId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Test message sent! Check your Telegram group.");
      } else {
        toast.error(data.error || "Failed to send test message");
      }
    } catch (error) {
      toast.error("Error sending test message");
    } finally {
      setTesting(false);
    }
  };

  const handleUserAction = async (telegramId: string, action: 'authorize' | 'reject') => {
    try {
      const res = await fetch("/api/admin/integrations/telegram/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId, action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${action}d successfully`);
        fetchSettings();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (e) {
      toast.error("Action failed");
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin w-6 h-6 text-primary" /></div>;
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 text-sm mt-1">Connect your store with external platforms securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
        {/* Telegram Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'telegram' ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200'}`}>
          {telegram.enabled && telegram.botToken && telegram.chatId && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.5 1.15-4.22 2.99-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .28z" fill="#0088cc"/>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Telegram Bot</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Send order notifications directly to your Telegram group.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={telegram.enabled} onChange={e => handleToggle('telegram', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0088cc]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'telegram' ? null : 'telegram')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'telegram' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>

        </div>

        {/* Meta Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'meta' ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200'}`}>
          {meta.enabled && meta.pixelId && meta.accessToken && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="#0866FF" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Meta CAPI</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Track server-side events for accurate ad tracking.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={meta.enabled} onChange={e => handleToggle('meta', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0866FF]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'meta' ? null : 'meta')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'meta' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

        {/* Google Analytics Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'googleAnalytics' ? 'border-orange-300 ring-2 ring-orange-50' : 'border-gray-200'}`}>
          {googleAnalytics.enabled && googleAnalytics.measurementId && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="#F9AB00" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V11.1h2.1v6.99h-2.1zm-4.92 0V14.1h2.1v3.99h-2.1z"/>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Google Analytics</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Track website traffic and user behavior.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={googleAnalytics.enabled} onChange={e => handleToggle('googleAnalytics', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F9AB00]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'googleAnalytics' ? null : 'googleAnalytics')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'googleAnalytics' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

        {/* TikTok Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'tiktok' ? 'border-pink-400 ring-2 ring-pink-50' : 'border-gray-200'}`}>
          {tiktok.enabled && tiktok.pixelId && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M34 10.9998C31.5 10.9998 29.5 8.99982 29.5 6.49982V4.99982H24.5V30.9998C24.5 34.2998 21.8 36.9998 18.5 36.9998C15.2 36.9998 12.5 34.2998 12.5 30.9998C12.5 27.6998 15.2 24.9998 18.5 24.9998C19 24.9998 19.5 25.0998 20 25.1998V19.9998C19.5 19.8998 19 19.8998 18.5 19.8998C12.4 19.8998 7.5 24.7998 7.5 30.8998C7.5 36.9998 12.4 41.8998 18.5 41.8998C24.6 41.8998 29.5 36.9998 29.5 30.8998V18.1998C32.1 20.3998 35.4 21.6998 39 21.6998V16.6998C36.9 16.5998 35.1 15.6998 34 14.1998V10.9998Z" fill="#000000"/>
              <path d="M34 11C35.1 12.5 36.9 13.4 39 13.5V18.5C35.4 18.5 32.1 17.2 29.5 15V11.8C29.5 11.8 30 11 34 11Z" fill="#FE2C55"/>
              <path d="M29.5 30.9001C29.5 37.0001 24.6 41.9001 18.5 41.9001C12.4 41.9001 7.5 37.0001 7.5 30.9001C7.5 24.8001 12.4 19.9001 18.5 19.9001C19 19.9001 19.5 19.9001 20 20.0001V25.2001C19.5 25.1001 19 25.0001 18.5 25.0001C15.2 25.0001 12.5 27.7001 12.5 31.0001C12.5 34.3001 15.2 37.0001 18.5 37.0001C21.8 37.0001 24.5 34.3001 24.5 31.0001V15.0001C24.5 15.0001 28.5 16.0001 29.5 16.0001V30.9001Z" fill="#25F4EE"/>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900">TikTok Pixel</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Track TikTok ad conversions and website visitors.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={tiktok.enabled} onChange={e => handleToggle('tiktok', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE2C55]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'tiktok' ? null : 'tiktok')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'tiktok' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

        {/* Push Notification Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'pushNotification' ? 'border-purple-400 ring-2 ring-purple-50' : 'border-gray-200'}`}>
          {pushNotification.enabled && pushNotification.appId && pushNotification.apiKey && pushNotification.vapidKey && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Push Notifications</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Send web push notifications to your customers.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotification.enabled} onChange={e => handleToggle('pushNotification', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'pushNotification' ? null : 'pushNotification')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'pushNotification' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

        {/* Google Sheet Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'googleSheet' ? 'border-green-400 ring-2 ring-green-50' : 'border-gray-200'}`}>
          {googleSheet.enabled && googleSheet.webhookUrl && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="#0F9D58" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <path d="M14 2v6h6" fill="#0F9D58" fillOpacity="0.5"/>
              <path d="M8 13h8v2H8v-2zm0-3h8v2H8v-2zm0 6h5v2H8v-2z" fill="#fff"/>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Google Sheets</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Automatically backup all new orders to a Google Sheet.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={googleSheet.enabled} onChange={e => handleToggle('googleSheet', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F9D58]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'googleSheet' ? null : 'googleSheet')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'googleSheet' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

        {/* Pathao Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'pathao' ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-200'}`}>
          {pathao.enabled && pathao.clientId && pathao.clientSecret && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="relative group cursor-pointer w-14 h-14">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleLogoUpload('pathao', e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploadingLogo === 'pathao'}
              />
              
              {uploadingLogo === 'pathao' ? (
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              ) : pathao.logoUrl ? (
                <img 
                  src={pathao.logoUrl} 
                  alt="Pathao" 
                  className="w-14 h-14 object-contain rounded-xl border border-gray-100 p-1.5 bg-white shadow-sm transition-opacity group-hover:opacity-50"
                />
              ) : (
                <div className="w-14 h-14 bg-red-50 text-[#ED1C24] rounded-xl flex items-center justify-center font-bold text-2xl border border-red-100 shadow-sm transition-opacity group-hover:opacity-50">P</div>
              )}
              
              {!uploadingLogo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                  <UploadCloud className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pathao</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Automate order dispatching and get live tracking updates.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pathao.enabled} onChange={e => handleToggle('pathao', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ED1C24]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'pathao' ? null : 'pathao')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'pathao' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

        {/* Steadfast Section */}
        <div className={`bg-white rounded-2xl border relative transition-all duration-300 shadow-sm ${expanded === 'steadfast' ? 'border-[#0a192f]-400 ring-2 ring-[#0a192f]-50' : 'border-gray-200'}`}>
          {steadfast.enabled && steadfast.apiKey && steadfast.secretKey && (
            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </div>
          )}
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="relative group cursor-pointer w-14 h-14">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleLogoUpload('steadfast', e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploadingLogo === 'steadfast'}
              />
              
              {uploadingLogo === 'steadfast' ? (
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              ) : steadfast.logoUrl ? (
                <img 
                  src={steadfast.logoUrl} 
                  alt="Steadfast" 
                  className="w-14 h-14 object-contain rounded-xl border border-gray-100 p-1.5 bg-white shadow-sm transition-opacity group-hover:opacity-50"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 text-[#0a192f] rounded-xl flex items-center justify-center font-bold text-2xl border border-gray-200 shadow-sm transition-opacity group-hover:opacity-50">S</div>
              )}
              
              {!uploadingLogo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                  <UploadCloud className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Steadfast</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Fast and reliable nationwide courier integration.</p>
            </div>
            
            <div className="w-full flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={steadfast.enabled} onChange={e => handleToggle('steadfast', e.target.checked)} />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0a192f]"></div>
              </label>
              <button 
                onClick={() => setExpanded(expanded === 'steadfast' ? null : 'steadfast')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                {expanded === 'steadfast' ? 'Close' : 'Configure'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Configuration Modals */}
      {expanded && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleCloseModal}>
          <div 
            className={`bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden ${isClosing ? 'animate-zoom-out' : 'animate-fade-zoom'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {expanded === 'telegram' && 'Telegram Bot Configuration'}
                {expanded === 'meta' && 'Meta CAPI Configuration'}
                {expanded === 'googleAnalytics' && 'Google Analytics Configuration'}
                {expanded === 'tiktok' && 'TikTok Pixel Configuration'}
                {expanded === 'pushNotification' && 'Push Notification Configuration'}
                {expanded === 'googleSheet' && 'Google Sheets Configuration'}
                {expanded === 'pathao' && 'Pathao Courier Configuration'}
                {expanded === 'steadfast' && 'Steadfast Courier Configuration'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {expanded === 'telegram' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
                    <input 
                      type="password" 
                      value={telegram.botToken}
                      onChange={e => setTelegram({...telegram, botToken: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0088cc]/20 focus:border-[#0088cc] transition-all outline-none bg-white"
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
                    <input 
                      type="text" 
                      value={telegram.chatId}
                      onChange={e => setTelegram({...telegram, chatId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0088cc]/20 focus:border-[#0088cc] transition-all outline-none bg-white"
                      placeholder="-100123456789"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">To find Chat ID, add your bot to a group and send a message, then use API to fetch updates.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Users (Optional)</label>
                    <input 
                      type="text" 
                      value={telegram.authorizedUsers}
                      onChange={e => setTelegram({...telegram, authorizedUsers: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0088cc]/20 focus:border-[#0088cc] transition-all outline-none bg-white"
                      placeholder="username1, username2"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">Only these users can click Confirm/Fake buttons. Leave empty to allow anyone in the chat.</p>
                  </div>
                  
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-2">
                    <button 
                      onClick={handleTestTelegram}
                      disabled={testing}
                      className="flex items-center justify-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0088cc]/20 transition-colors disabled:opacity-70"
                    >
                      {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Test Message
                    </button>
                    
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#0088cc] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#0077b3] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>

                  {pendingUsers && pendingUsers.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Pending Access Requests</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {pendingUsers.map((user) => (
                          <div key={user.telegramId} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{user.name}</p>
                              <p className="text-[11px] text-gray-500">ID: {user.telegramId} {user.username && `| @${user.username}`}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleUserAction(user.telegramId, 'authorize')}
                                className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                              >
                                Authorize
                              </button>
                              <button 
                                onClick={() => handleUserAction(user.telegramId, 'reject')}
                                className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {expanded === 'meta' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pixel ID</label>
                    <input 
                      type="text" 
                      value={meta.pixelId}
                      onChange={e => setMeta({...meta, pixelId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0866FF]/20 focus:border-[#0866FF] transition-all outline-none bg-white"
                      placeholder="123456789012345"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Your Facebook Pixel ID.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name</label>
                    <input 
                      type="text" 
                      value={meta.datasetName}
                      onChange={e => setMeta({...meta, datasetName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0866FF]/20 focus:border-[#0866FF] transition-all outline-none bg-white"
                      placeholder="e.g. ReadyWear 2024"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">The name of your Meta Dataset (appears in Telegram notifications).</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                    <input 
                      type="password" 
                      value={meta.accessToken}
                      onChange={e => setMeta({...meta, accessToken: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0866FF]/20 focus:border-[#0866FF] transition-all outline-none bg-white"
                      placeholder="EAAB..."
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Generate this in Events Manager &gt; Settings &gt; Conversions API.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Event Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input 
                      type="text" 
                      value={meta.testEventCode}
                      onChange={e => setMeta({...meta, testEventCode: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0866FF]/20 focus:border-[#0866FF] transition-all outline-none bg-white"
                      placeholder="TEST12345"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Used for testing. Get this from Events Manager &gt; Test Events.</p>
                  </div>

                  <div className="pt-2">
                    <div className="p-4 bg-[#0866FF]/5 rounded-xl border border-[#0866FF]/10 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0866FF] shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">
                        <span className="font-bold block mb-1">Deduplication & Security Active</span>
                        The Purchase event will <b>only</b> be fired when an order is verified/confirmed via Telegram or the Admin Panel.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#0866FF] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#0755d6] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}

              {expanded === 'googleAnalytics' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Measurement ID</label>
                    <input 
                      type="text" 
                      value={googleAnalytics.measurementId}
                      onChange={e => setGoogleAnalytics({...googleAnalytics, measurementId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F9AB00]/20 focus:border-[#F9AB00] transition-all outline-none bg-white"
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Your Google Analytics 4 Measurement ID.</p>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#F9AB00] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#e09900] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}

              {expanded === 'tiktok' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pixel ID</label>
                    <input 
                      type="text" 
                      value={tiktok.pixelId}
                      onChange={e => setTiktok({...tiktok, pixelId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FE2C55]/20 focus:border-[#FE2C55] transition-all outline-none bg-white"
                      placeholder="C...12345"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Your TikTok Pixel ID.</p>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#FE2C55] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#e02047] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}

              {expanded === 'pushNotification' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input 
                      type="text" 
                      value={pushNotification.apiKey}
                      onChange={e => setPushNotification({...pushNotification, apiKey: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="Enter API Key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auth Domain</label>
                    <input 
                      type="text" 
                      value={pushNotification.authDomain}
                      onChange={e => setPushNotification({...pushNotification, authDomain: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="project-id.firebaseapp.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                    <input 
                      type="text" 
                      value={pushNotification.projectId}
                      onChange={e => setPushNotification({...pushNotification, projectId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="project-id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Bucket</label>
                    <input 
                      type="text" 
                      value={pushNotification.storageBucket}
                      onChange={e => setPushNotification({...pushNotification, storageBucket: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="project-id.appspot.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Messaging Sender ID</label>
                    <input 
                      type="text" 
                      value={pushNotification.messagingSenderId}
                      onChange={e => setPushNotification({...pushNotification, messagingSenderId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                    <input 
                      type="text" 
                      value={pushNotification.appId}
                      onChange={e => setPushNotification({...pushNotification, appId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="1:1234567890:web:abcdef"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VAPID Key</label>
                    <input 
                      type="text" 
                      value={pushNotification.vapidKey}
                      onChange={e => setPushNotification({...pushNotification, vapidKey: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white"
                      placeholder="Generate in Cloud Messaging settings"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Account JSON</label>
                    <textarea 
                      value={pushNotification.serviceAccountJson}
                      onChange={e => setPushNotification({...pushNotification, serviceAccountJson: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none bg-white font-mono text-xs"
                      placeholder='{"type": "service_account", "project_id": "..."}'
                      rows={4}
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Required for sending automatic push notifications from the server. Generate in Project Settings &gt; Service Accounts.</p>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#8B5CF6] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#7c3aed] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}

              {expanded === 'googleSheet' && (
                <div className="space-y-6">
                  <div className="bg-green-50/50 p-5 rounded-xl border border-green-200">
                    <h3 className="text-sm font-bold text-green-900 mb-3">How to Setup Google Sheet</h3>
                    <ol className="text-xs text-green-800 space-y-2 list-decimal list-inside mb-4 font-medium leading-relaxed">
                      <li>Open your Google Sheet and click <b>Extensions &gt; Apps Script</b></li>
                      <li>Click the button below to copy the required code</li>
                      <li>Paste the code in Apps Script (replace any existing code) and click <b>Save</b></li>
                      <li>Click <b>Deploy &gt; New Deployment</b></li>
                      <li>Select Type: <b>Web app</b> | Execute as: <b>Me</b> | Who has access: <b>Anyone</b></li>
                      <li>Deploy and paste the generated <b>Web App URL</b> below</li>
                    </ol>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                        toast.success("Code copied to clipboard! Now paste it in Apps Script.");
                      }}
                      className="flex items-center gap-2 text-xs bg-[#0F9D58] text-white px-4 py-2 rounded-lg hover:bg-[#0b8046] transition-colors font-bold shadow-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Apps Script Code
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL (Apps Script)</label>
                      <input 
                        type="text" 
                        value={googleSheet.webhookUrl}
                        onChange={e => setGoogleSheet({...googleSheet, webhookUrl: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F9D58]/20 focus:border-[#0F9D58] transition-all outline-none bg-white"
                        placeholder="https://script.google.com/macros/s/.../exec"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheet URL</label>
                      <input 
                        type="text" 
                        value={googleSheet.sheetUrl}
                        onChange={e => setGoogleSheet({...googleSheet, sheetUrl: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F9D58]/20 focus:border-[#0F9D58] transition-all outline-none bg-white"
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      />
                      <p className="text-[11px] text-gray-500 mt-1.5 font-medium">This URL will be used for the 'Open in Google Sheet' button in Telegram.</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#0F9D58] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#0b8046] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}

              {expanded === 'pathao' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                    <input 
                      type="text" 
                      value={pathao.clientId}
                      onChange={e => setPathao({...pathao, clientId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ED1C24]/20 focus:border-[#ED1C24] transition-all outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                    <input 
                      type="password" 
                      value={pathao.clientSecret}
                      onChange={e => setPathao({...pathao, clientSecret: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ED1C24]/20 focus:border-[#ED1C24] transition-all outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
                    <input 
                      type="text" 
                      value={pathao.storeId}
                      onChange={e => setPathao({...pathao, storeId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ED1C24]/20 focus:border-[#ED1C24] transition-all outline-none bg-white"
                    />
                  </div>
                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#ED1C24] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#c9181f] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}

              {expanded === 'steadfast' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input 
                      type="text" 
                      value={steadfast.apiKey}
                      onChange={e => setSteadfast({...steadfast, apiKey: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a192f]/20 focus:border-[#0a192f] transition-all outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                    <input 
                      type="password" 
                      value={steadfast.secretKey}
                      onChange={e => setSteadfast({...steadfast, secretKey: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a192f]/20 focus:border-[#0a192f] transition-all outline-none bg-white"
                    />
                  </div>
                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#0a192f] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#112240] transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Config
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
