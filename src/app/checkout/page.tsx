"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { products } from "@/data/mock";

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export default function CheckoutPage() {
  // Delivery State
  const [shippingArea, setShippingArea] = useState<"inside" | "outside">("inside");
  const [addressText, setAddressText] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  // Mock cart items
  const cartItems = [
    { product: products[0], quantity: 1, size: "M", color: "লাল" },
    { product: products[1], quantity: 2, size: "L", color: "নীল" },
  ];

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  
  useEffect(() => {
    if (!addressText || addressText.trim().length < 3) return;

    const timeoutId = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&countrycodes=bd&format=json&addressdetails=1`);
        const data = await res.json();
        
        let foundDhaka = false;
        if (data && data.length > 0) {
          foundDhaka = data.some((item: any) => {
            if (item.address) {
              const city = (item.address.city || "").toLowerCase();
              const district = (item.address.state_district || item.address.county || "").toLowerCase();
              
              return city.includes("dhaka") || city.includes("ঢাকা") || 
                     district.includes("dhaka") || district.includes("ঢাকা");
            }
            
            // Fallback just in case addressdetails fails but we want to exclude "division"
            const name = (item.display_name || "").toLowerCase();
            return (name.includes("dhaka") || name.includes("ঢাকা")) && !name.includes("division") && !name.includes("বিভাগ");
          });
        }
        
        if (foundDhaka) {
          setShippingArea("inside");
        } else {
          setShippingArea("outside");
        }
      } catch (error) {
        console.error("Error detecting location:", error);
      } finally {
        setIsDetecting(false);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [addressText]);

  const deliveryCharge = shippingArea === "inside" ? 80 : 150;
  const total = subtotal + deliveryCharge;

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#f8fafc] py-10 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              চেকআউট
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              অর্ডার কনফার্ম করতে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
            {/* Left Column: Form Details */}
            <div className="flex-1 space-y-8">
              {/* Delivery Information */}
              <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  ডেলিভারি তথ্য
                </h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700 block"
                      >
                        নাম <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                        placeholder="আপনার সম্পূর্ণ নাম"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 block"
                      >
                        মোবাইল নাম্বার <span className="text-primary">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
                        placeholder="01XXXXXXXXX"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      সম্পূর্ণ ঠিকানা <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 resize-none"
                      placeholder="বাসা নাম্বার, রাস্তা, এলাকা, জেলা"
                      required
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Shipping Area */}
              <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  ডেলিভারি এরিয়া
                  {isDetecting && <span className="text-sm font-normal text-primary animate-pulse">(লোকেশন চেক করা হচ্ছে...)</span>}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors relative ${shippingArea === "inside" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="shippingArea"
                      value="inside"
                      checked={shippingArea === "inside"}
                      onChange={() => setShippingArea("inside")}
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary accent-primary"
                    />
                    <div className="ml-4 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        ঢাকার ভেতরে
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        ৳ ৮০
                      </span>
                    </div>
                    {shippingArea === "inside" && (
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 hidden sm:block"></div>
                    )}
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors relative ${shippingArea === "outside" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="shippingArea"
                      value="outside"
                      checked={shippingArea === "outside"}
                      onChange={() => setShippingArea("outside")}
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary accent-primary"
                    />
                    <div className="ml-4 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        ঢাকার বাইরে
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        ৳ ১৫০
                      </span>
                    </div>
                    {shippingArea === "outside" && (
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 hidden sm:block"></div>
                    )}
                  </label>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  পেমেন্ট পদ্ধতি
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer transition-colors relative">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      defaultChecked
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary accent-primary"
                    />
                    <div className="ml-4 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        ক্যাশ অন ডেলিভারি (Cash on Delivery)
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                      </span>
                    </div>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 hidden sm:block"></div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[420px]">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  অর্ডারের সারসংক্ষেপ
                </h2>

                <div className="space-y-5 mb-6">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {item.product.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          সাইজ: {item.size} | রং: {item.color}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-gray-600">
                            পরিমাণ: {toBengaliNumber(item.quantity)}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">
                            ৳{" "}
                            {toBengaliNumber(
                              item.product.price * item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">সাবটোটাল</span>
                    <span className="font-medium text-gray-900">
                      ৳ {toBengaliNumber(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ডেলিভারি চার্জ</span>
                    <span className="font-medium text-gray-900">
                      ৳ {toBengaliNumber(deliveryCharge)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-5 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">সর্বমোট</span>
                    <span className="text-xl font-bold text-primary">
                      ৳ {toBengaliNumber(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = '/order-success'}
                  className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold text-base py-4 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
                >
                  অর্ডার কনফার্ম করুন
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  অর্ডার কনফার্ম করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
