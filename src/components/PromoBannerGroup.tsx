import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBannerGroup() {
  return (
    <section className="py-8 container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Banner 1 */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-64 group bg-gradient-to-r from-pink-400 to-primary">
          <div className="absolute right-0 top-0 bottom-0 w-1/2">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
              alt="Summer Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient overlay to blend image into background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent" />
          </div>
          <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-[60%] z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight uppercase">
              Summer<br/>Collection
            </h3>
            <p className="text-white/90 text-sm mb-4">গরমের স্টাইলে থাকুন সবসময়</p>
            <Link 
              href="#"
              className="bg-white text-primary px-5 py-2 rounded-full text-sm font-medium w-max hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              এখনই দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Banner 2 */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-64 group bg-gray-900">
          <div className="absolute right-0 top-0 bottom-0 w-1/2">
            <Image
              src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"
              alt="Men's Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent" />
          </div>
          <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-[65%] z-10">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
              পুরুষদের জন্য স্পেশাল কালেকশন
            </h3>
            <p className="text-gray-300 text-sm mb-4">ক্যাজুয়াল থেকে ফরমাল - সবই আছে</p>
            <Link 
              href="#"
              className="bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-medium w-max hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Banner 3 */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-64 group bg-[#f3eddf]">
          <div className="absolute right-0 top-0 bottom-0 w-1/2">
            <Image
              src="https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop"
              alt="Accessories"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f3eddf] to-transparent" />
          </div>
          <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-[60%] z-10">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
              অ্যাক্সেসরিজ কালেকশন
            </h3>
            <p className="text-gray-600 text-sm mb-4">আপনার স্টাইলের ছোট ছোট যত্নে অংশ</p>
            <Link 
              href="#"
              className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium w-max hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              সব দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
