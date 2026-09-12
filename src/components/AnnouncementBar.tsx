import { Truck, ShieldCheck, Star } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="hidden md:block w-full bg-primary text-white py-2.5 px-2 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-6 lg:gap-16">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>সারা দেশে হোম ডেলিভারি</span>
        </div>
        <span className="opacity-50 hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>নিরাপদ পেমেন্ট</span>
        </div>
        <span className="opacity-50 hidden md:inline">|</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="pb-[2px]">100% অরিজিনাল পণ্য</span>
        </div>
      </div>
    </div>
  );
}
