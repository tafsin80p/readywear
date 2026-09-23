"use client";

import { useState } from "react";
import { Search, MapPin, Truck, PackageCheck, Package, Clock, Phone, Hash, ChevronRight, Check, XCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";


// Helper for Bengali numerals
const toBengaliNumber = (num: number | string) => {
  if (num === undefined || num === null) return "০";
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

// Date formatter
const formatDate = (dateString: string) => {
  if (!dateString) return "অপেক্ষমান";
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  }).format(new Date(dateString));
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) return;
    
    setIsSearching(true);
    setShowResult(false);
    setErrorMsg("");
    
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      if (data.success) {
        setOrderData(data.data);
        setShowResult(true);
      } else {
        setErrorMsg(data.message || "কোনো তথ্য পাওয়া যায়নি");
      }
    } catch (error) {
      setErrorMsg("সার্ভার এরর, কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setIsSearching(false);
    }
  };

  // Determine current step based on status
  const getStepNumber = (status: string) => {
    switch(status) {
      case "pending": return 1;
      case "processing": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      default: return 1;
    }
  };

  const currentStep = orderData ? getStepNumber(orderData.status) : 1; 
  const isCancelled = orderData?.status === "cancelled";

  const steps = [
    { id: 1, title: "অর্ডার প্লেসড", date: orderData?.createdAt ? formatDate(orderData.createdAt) : "অপেক্ষমান", icon: Package, description: "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে" },
    { id: 2, title: "প্রসেসিং", date: currentStep >= 2 ? formatDate(orderData?.updatedAt) : "অপেক্ষমান", icon: Clock, description: "অর্ডারটি প্যাক করা হচ্ছে" },
    { id: 3, title: "কুরিয়ারে হস্তান্তর/শিপড", date: currentStep >= 3 ? formatDate(orderData?.updatedAt) : "অপেক্ষমান", icon: Truck, description: "আপনার প্যাকেজটি কুরিয়ারে দেওয়া হয়েছে" },
    { id: 4, title: "ডেলিভারড", date: currentStep >= 4 ? formatDate(orderData?.updatedAt) : "অপেক্ষমান", icon: PackageCheck, description: "অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে" },
  ];

  return (
    <>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50/50 pb-20 md:pb-32">
        {/* Hero Header */}
        <div className="pt-8 pb-12">
          <div className="container mx-auto px-4 text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">আপনার অর্ডার ট্র্যাক করুন</h1>
            <p className="text-gray-500 text-sm md:text-base">আপনার অর্ডার আইডি এবং ফোন নাম্বার দিয়ে সর্বশেষ অবস্থা জানুন</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 relative z-10">
          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.03] border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">অর্ডার আইডি</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="যেমন: MZO-0025"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all text-[15px]"
                  required
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">ফোন নাম্বার</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="আপনার ফোন নাম্বার"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all text-[15px]"
                  required
                />
              </div>
            </div>
            <div className="md:pt-6">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full md:w-auto h-[52px] bg-primary hover:bg-primary/90 text-white px-8 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>খোঁজা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>ট্র্যাক করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
              <XCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {showResult && orderData && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-500">
            {/* Courier Alert Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">কুরিয়ার ইনফরমেশন</p>
                  <h3 className="text-lg font-bold text-gray-900">Steadfast Courier</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <span>ট্র্যাকিং কোড: <strong className="text-gray-900">SF-{orderId || '1025'}</strong></span>
                  </div>
                </div>
              </div>
              <a href="#" className="bg-white text-blue-600 border border-blue-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
                কুরিয়ার ট্র্যাকিং দেখুন
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline (Left Column) */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                
                {isCancelled ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">অর্ডারটি বাতিল করা হয়েছে</h3>
                    <p className="text-gray-500 max-w-sm">আপনার অর্ডারটি কোনো কারণে বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4 flex items-center justify-between">
                      অর্ডার স্ট্যাটাস
                      <span className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                        orderData.status === 'delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {steps[currentStep-1].title}
                      </span>
                    </h3>
                    
                    <div className="relative">
                      {/* Vertical Line */}
                      <div className="absolute top-8 bottom-8 left-[23px] w-0.5 bg-gray-100" />
                      
                      <div className="space-y-8 relative">
                        {steps.map((step, idx) => {
                          const isCompleted = step.id <= currentStep;
                          const isCurrent = step.id === currentStep;
                          
                          return (
                            <div key={step.id} className="flex gap-6 relative">
                              {/* Step Icon Indicator */}
                              <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-[3px] transition-colors duration-500
                                ${isCompleted ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-400'}
                                ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                              `}>
                                {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                              </div>
                              
                              {/* Step Content */}
                              <div className={`pt-1 pb-2 flex-1 ${!isCompleted ? 'opacity-50' : ''}`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                                  <h4 className={`font-bold text-[15px] ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {step.title}
                                  </h4>
                                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded w-fit">
                                    {step.date}
                                  </span>
                                </div>
                                <p className="text-[13px] text-gray-500 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Order Details (Right Column) */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit sticky top-28">
                <h3 className="font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">অর্ডার সামারি</h3>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {orderData.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="relative w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[13px] text-gray-900 line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          পরিমাণ: {toBengaliNumber(item.quantity)}
                          {item.size && ` | সাইজ: ${item.size}`}
                          {item.color && ` | রঙ: ${item.color}`}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">৳ {toBengaliNumber(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>সাবটোটাল</span>
                    <span>৳ {toBengaliNumber(orderData.pricing?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>৳ {toBengaliNumber(orderData.pricing?.deliveryCharge || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-100">
                    <span>সর্বমোট</span>
                    <span className="text-primary">৳ {toBengaliNumber(orderData.pricing?.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
);
}
