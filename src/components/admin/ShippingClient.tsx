"use client";

import React, { useState, useEffect, useRef } from "react";
import { Save, RefreshCw, Truck, MapPin, Gift, Store, Info } from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ShippingClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState({
    zones: {
      insideDhaka: { enabled: true, rate: 60, estimatedDays: "1-2 Business Days" },
      outsideDhaka: { enabled: true, rate: 120, estimatedDays: "3-5 Business Days" }
    },
    freeShipping: { enabled: false, minAmount: 2000 },
    storePickup: { enabled: false, instructions: "Pickup your order from our flagship store during business hours." }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useGSAP(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        ".stagger-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (data.success && data.settings) {
        // Deep merge to avoid overriding defaults if some keys are missing
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          zones: {
            ...prev.zones,
            ...data.settings.zones
          },
          freeShipping: {
            ...prev.freeShipping,
            ...data.settings.freeShipping
          },
          storePickup: {
            ...prev.storePickup,
            ...data.settings.storePickup
          }
        }));
      }
    } catch (error) {
      toast.error("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleZoneChange = (zone: 'insideDhaka' | 'outsideDhaka', field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zone]: {
          ...prev.zones[zone],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin w-6 h-6 text-primary" /></div>;
  }

  return (
    <div className="w-full p-6 space-y-6" ref={containerRef}>
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 stagger-card">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Shipping Configuration
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your delivery zones, rates, and pickup options.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 shadow-sm"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Delivery Zones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden stagger-card">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Delivery Zones & Rates</h2>
              <p className="text-xs text-gray-500">Configure standard shipping costs by area.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Inside Dhaka */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Inside Dhaka</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.zones.insideDhaka.enabled} 
                    onChange={e => handleZoneChange('insideDhaka', 'enabled', e.target.checked)} 
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rate (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                    <input 
                      type="number" 
                      value={settings.zones.insideDhaka.rate}
                      onChange={e => handleZoneChange('insideDhaka', 'rate', Number(e.target.value))}
                      disabled={!settings.zones.insideDhaka.enabled}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Est. Delivery Time</label>
                  <input 
                    type="text" 
                    value={settings.zones.insideDhaka.estimatedDays}
                    onChange={e => handleZoneChange('insideDhaka', 'estimatedDays', e.target.value)}
                    disabled={!settings.zones.insideDhaka.enabled}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="e.g. 1-2 Business Days"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Outside Dhaka */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Outside Dhaka</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.zones.outsideDhaka.enabled} 
                    onChange={e => handleZoneChange('outsideDhaka', 'enabled', e.target.checked)} 
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rate (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                    <input 
                      type="number" 
                      value={settings.zones.outsideDhaka.rate}
                      onChange={e => handleZoneChange('outsideDhaka', 'rate', Number(e.target.value))}
                      disabled={!settings.zones.outsideDhaka.enabled}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Est. Delivery Time</label>
                  <input 
                    type="text" 
                    value={settings.zones.outsideDhaka.estimatedDays}
                    onChange={e => handleZoneChange('outsideDhaka', 'estimatedDays', e.target.value)}
                    disabled={!settings.zones.outsideDhaka.enabled}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="e.g. 3-5 Business Days"
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div className="space-y-6">
          {/* Free Shipping Rules */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden stagger-card relative">
            <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-colors ${settings.freeShipping.enabled ? 'border-pink-200' : 'border-transparent'}`}></div>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${settings.freeShipping.enabled ? 'bg-pink-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Free Shipping Rules</h2>
                  <p className="text-xs text-gray-500">Automatically offer free shipping on large orders.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.freeShipping.enabled} 
                  onChange={e => setSettings({...settings, freeShipping: {...settings.freeShipping, enabled: e.target.checked}})} 
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="p-6">
              <div className="p-4 rounded-xl border border-pink-100 bg-pink-50/30 mb-4 flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  When enabled, any order subtotal equal to or greater than the minimum amount will automatically get free shipping at checkout.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Order Amount (৳)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                  <input 
                    type="number" 
                    value={settings.freeShipping.minAmount}
                    onChange={e => setSettings({...settings, freeShipping: {...settings.freeShipping, minAmount: Number(e.target.value)}})}
                    disabled={!settings.freeShipping.enabled}
                    className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Store Pickup */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden stagger-card relative">
            <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-colors ${settings.storePickup.enabled ? 'border-gray-300' : 'border-transparent'}`}></div>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${settings.storePickup.enabled ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Store Pickup</h2>
                  <p className="text-xs text-gray-500">Allow customers to pick up from store.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.storePickup.enabled} 
                  onChange={e => setSettings({...settings, storePickup: {...settings.storePickup, enabled: e.target.checked}})} 
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#111827]"></div>
              </label>
            </div>
            
            <div className="p-6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Instructions (Shown at checkout)</label>
              <textarea 
                rows={3}
                value={settings.storePickup.instructions}
                onChange={e => setSettings({...settings, storePickup: {...settings.storePickup, instructions: e.target.value}})}
                disabled={!settings.storePickup.enabled}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
