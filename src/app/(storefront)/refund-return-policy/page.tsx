import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিটার্ন এবং রিফান্ড পলিসি | Return & Refund Policy",
  description: "Mehzin Offers-এর রিটার্ন এবং রিফান্ড নীতিমালা।",
};

export default function RefundPolicyPage() {
  const policies = [
    "পণ্য রিসিভ করার সময় অবশ্যই ডেলিভারি ম্যানের সামনে চেক করে রিসিভ করতে হবে।",
    "প্রোডাক্টে কোনো ত্রুটি থাকলে বা ভুল প্রোডাক্ট পেলে সাথে সাথে ডেলিভারি ম্যানকে ফেরত দিন এবং আমাদের জানান।",
    "ডেলিভারি ম্যান চলে আসার পর কোনো অভিযোগ বা রিটার্ন গ্রহণযোগ্য হবে না।",
    "সাইজ বা কালার এক্সচেঞ্জ করতে চাইলে ডেলিভারি চার্জ প্রদান করে এক্সচেঞ্জ করতে পারবেন (স্টক থাকা সাপেক্ষে)।",
    "রিফান্ডের ক্ষেত্রে, প্রোডাক্ট আমাদের কাছে অক্ষত অবস্থায় ফেরত আসার পর চেক করে ৩-৫ কার্যদিবসের মধ্যে আপনার দেওয়া মাধ্যমে (বিকাশ/নগদ/ব্যাংক) টাকা ফেরত দেওয়া হবে।"
  ];

  return (
    <main className="flex-1 bg-gray-50/50 py-8 md:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">রিটার্ন ও রিফান্ড পলিসি</span>
        </div>

        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4">
            নীতিমালা
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            রিটার্ন এবং রিফান্ড পলিসি
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
            আমরা চাই আমাদের প্রতিটি গ্রাহক তাদের কেনাকাটায় ১০০% সন্তুষ্ট থাকুন। 
            তবে যেকোনো অনাকাঙ্ক্ষিত পরিস্থিতি এড়াতে আমাদের রিটার্ন এবং রিফান্ড পলিসি নিচে দেওয়া হলো।
          </p>
        </div>

        <div className="h-px w-full bg-gray-200 mb-10"></div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="flex flex-col gap-6">
            {policies.map((policy, index) => {
              const bengaliNumerals = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];
              
              return (
                <div key={index} className="flex gap-4 items-start group">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {bengaliNumerals[index]}
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-2">
                    {policy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/categories" 
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-primary transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            শপিং চালিয়ে যান
          </Link>
        </div>
      </div>
    </main>
  );
}
