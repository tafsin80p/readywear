"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import toast from "react-hot-toast";

const toBengaliNumber = (num: number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export default function CheckoutPage() {
  // Delivery State
  const [shippingArea, setShippingArea] = useState<"inside" | "outside">("inside");
  const [addressText, setAddressText] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    note: "",
  });

  const { items: cartItems, cartTotal: subtotal, clearCart, isLoaded } = useCart();
  
  // Protect checkout page from empty cart
  useEffect(() => {
    if (isLoaded && cartItems.length === 0 && !isSuccess) {
      toast.error("Your cart is empty. Please add items to checkout.");
      router.replace("/");
    }
  }, [isLoaded, cartItems, isSuccess, router]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) return;
    
    if (!formData.firstName || !formData.phone || !addressText) {
      toast.error("অনুগ্রহ করে নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা প্রদান করুন");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderPayload = {
        customerInfo: {
          firstName: formData.firstName,
          phone: formData.phone,
          address: addressText,
          area: shippingArea,
          note: formData.note
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          attributes: item.attributes
        })),
        pricing: {
          subtotal,
          deliveryCharge,
          total
        },
        paymentMethod: "cod",
        source: typeof window !== "undefined" ? (localStorage.getItem("order_source") || "Website") : "Website"
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to create order");
      }
      
      // Mark as success so UI doesn't flash empty cart
      setIsSuccess(true);
      
      // Clear cart and redirect
      clearCart();
      router.push(`/order-success/${data.orderId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      if (!isSuccess) {
        setIsSubmitting(false);
      }
    }
  };

  // If successfully submitted, just show loading state while redirecting
  if (isSuccess) {
    return (
      <main className="flex-1 bg-[#f8fafc] py-24 flex flex-col items-center justify-center">
        <svg className="animate-spin mb-4 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium text-lg">অর্ডার কনফার্ম হচ্ছে...</p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex-1 bg-[#f8fafc] py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">আপনার কার্ট খালি</h1>
          <p className="text-gray-500 mb-8">চেকআউট করার আগে অনুগ্রহ করে কিছু প্রোডাক্ট কার্টে যোগ করুন।</p>
          <Link href="/" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25">
            শপিং করুন
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
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
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
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
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
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
                </form>
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
                          src={item.image || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.size && `সাইজ: ${item.size} `}
                          {item.color && `| রং: ${item.color}`}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-gray-600">
                            পরিমাণ: {item.quantity} টি
                          </span>
                          <span className="font-bold text-gray-900 text-sm">
                            ৳{" "}
                            {toBengaliNumber(
                              item.price * item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-gray-600">সাবটোটাল</span>
                    <span className="font-bold text-gray-900">
                      ৳ {toBengaliNumber(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span className="text-gray-600">ডেলিভারি চার্জ</span>
                    <span className="font-bold text-gray-900">
                      ৳ {toBengaliNumber(deliveryCharge)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-5 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">সর্বমোট</span>
                    <span className="text-2xl font-bold text-primary">
                      ৳ {toBengaliNumber(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }}
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold text-base py-4 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      প্রসেসিং...
                    </>
                  ) : "অর্ডার কনফার্ম করুন"}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  অর্ডার কনফার্ম করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
