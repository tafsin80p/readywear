import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { notFound } from "next/navigation";

const toBengaliNumber = (num: number | string) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();
  const order = await Order.findById(id).lean() as any;
  
  if (!order) {
    notFound();
  }

  const { items, pricing, orderId, createdAt, paymentMethod } = order;

  // Format date to Bengali
  const dateObj = new Date(createdAt);
  const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
  const formattedDate = `${toBengaliNumber(dateObj.getDate())} ${months[dateObj.getMonth()]}, ${toBengaliNumber(dateObj.getFullYear())}`;

  return (
    <>
      <style>{`
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 4;
          stroke-miterlimit: 10;
          stroke: var(--primary);
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 4;
          stroke: var(--primary);
          fill: none;
          animation: stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        .checkmark-wrapper {
          animation: scale 0.4s ease-in-out 0.9s both;
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.15, 1.15, 1); }
        }
      `}</style>
      
      <main className="flex-1 bg-[#f8fafc] py-12 sm:py-20 min-h-[calc(100vh-200px)] flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch max-w-6xl mx-auto">
            
            {/* Left: Animation, Success Message & Actions */}
            <div className="flex-1 flex flex-col justify-center items-center text-center bg-white rounded-3xl p-10 sm:p-14 shadow-sm border border-gray-100">
              
              <div className="checkmark-wrapper mb-8 relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute inset-0 bg-white rounded-full shadow-[0_10px_40px_rgba(245,45,104,0.15)]"></div>
                <svg className="w-28 h-28 relative z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="22" />
                  <path className="checkmark-check" d="M16 27 l7 7 l14 -14" />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                অর্ডারটি সফল হয়েছে!
              </h1>
              <p className="text-gray-500 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
                ধন্যবাদ! আপনার অর্ডারটি সফলভাবে রিসিভ করা হয়েছে। খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                <Link 
                  href="/" 
                  className="w-full sm:flex-1 py-3.5 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Home className="w-5 h-5" />
                  হোম পেজ
                </Link>
                <Link 
                  href="/category/saree" 
                  className="w-full sm:flex-1 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-base"
                >
                  শপিং করুন
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right: Consolidated Order Details */}
            <div className="flex-1 lg:max-w-md">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden flex flex-col">
                
                {/* Meta Header */}
                <div className="bg-gray-50/80 border-b border-gray-100 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">অর্ডারের বিস্তারিত</h2>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">অর্ডার নম্বর</p>
                      <p className="text-sm font-bold text-primary">#{toBengaliNumber(orderId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">তারিখ</p>
                      <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 font-medium mb-1">পেমেন্ট মেথড</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 sm:p-8 flex-1">
                  <div className="space-y-5">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
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
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-600">
                              পরিমাণ: {item.quantity} টি
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              ৳ {toBengaliNumber(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-6 sm:p-8 bg-gray-50/50 border-t border-gray-100 mt-auto">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">সাবটোটাল</span>
                      <span className="font-medium text-gray-900">৳ {toBengaliNumber(pricing.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ডেলিভারি চার্জ</span>
                      <span className="font-medium text-gray-900">৳ {toBengaliNumber(pricing.deliveryCharge)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="font-bold text-gray-900">সর্বমোট</span>
                    <span className="text-xl font-bold text-primary">৳ {toBengaliNumber(pricing.total)}</span>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}
