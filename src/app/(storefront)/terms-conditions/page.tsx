import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "শর্তাবলী | Terms & Conditions",
  description: "ReadyWear-এর সাধারণ শর্তাবলী ও নিয়মকানুন।",
};

export default function TermsConditionsPage() {
  const policies = [
    "ReadyWear থেকে কেনাকাটা করার মাধ্যমে আপনি আমাদের সমস্ত শর্তাবলীতে সম্মত হচ্ছেন বলে ধরে নেওয়া হবে।",
    "আমরা যেকোনো সময় আমাদের ওয়েবসাইটের তথ্য, মূল্য, অফার বা শর্তাবলী পরিবর্তন করার সম্পূর্ণ অধিকার রাখি।",
    "ওয়েবসাইটে অর্ডার কনফার্ম হওয়া মানেই প্রোডাক্টটি আপনি নিশ্চিতভাবে পাবেন তার চূড়ান্ত নিশ্চয়তা নয়; স্টক না থাকলে বা অন্য কোনো কারণে অর্ডার বাতিল হতে পারে।",
    "আমাদের ওয়েবসাইটের কোনো কন্টেন্ট (ছবি, টেক্সট, লোগো) পূর্বানুমতি ছাড়া অন্য কোথাও কমার্শিয়াল বা নন-কমার্শিয়াল উদ্দেশ্যে ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।",
    "ওয়েবসাইটে দেওয়া ছবির কালার এবং বাস্তবের প্রোডাক্টের কালারে ডিভাইসের স্ক্রিন সেটিংস বা লাইটিংয়ের কারণে সামান্য তারতম্য হতে পারে।"
  ];

  return (
    <main className="flex-1 bg-gray-50/50 py-8 md:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">শর্তাবলী</span>
        </div>

        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4">
            নীতিমালা
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            শর্তাবলী (Terms & Conditions)
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
            আমাদের ওয়েবসাইট ব্যবহার করার জন্য এবং কেনাকাটা করার জন্য কিছু সাধারণ নিয়ম ও শর্তাবলী নিচে দেওয়া হলো।
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
