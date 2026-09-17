import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি | Privacy Policy",
  description: "ReadyWear-এর প্রাইভেসি পলিসি বা গোপনীয়তা নীতিমালা।",
};

export default function PrivacyPolicyPage() {
  const policies = [
    "আমরা আপনার নাম, মোবাইল নম্বর, ঠিকানা, ই-মেইল এবং অর্ডার সংক্রান্ত প্রয়োজনীয় তথ্য সংগ্রহ করতে পারি।",
    "সংগৃহীত তথ্য শুধুমাত্র অর্ডার প্রক্রিয়াকরণ, ডেলিভারি, গ্রাহকসেবা এবং আপডেট প্রদানের জন্য ব্যবহার করা হবে।",
    "আপনার অনুমতি ছাড়া, আইনগত কারণ ব্যতীত কোনো ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা প্রকাশ করা হবে না।",
    "আপনার ঠিকানায় পণ্য পৌঁছে দেওয়ার স্বার্থে প্রয়োজনীয় তথ্য (নাম, ঠিকানা, নম্বর) কুরিয়ার সার্ভিসের সাথে শেয়ার করা হবে।",
    "আপনার অনুমতি ছাড়া আপনার দেওয়া ছবি, ভিডিও বা রিভিউ আমাদের প্রচারমূলক কাজে ব্যবহার করা হবে না।",
    "প্রয়োজন হলে আপনি যেকোনো সময় আপনার তথ্য সংশোধনের অনুরোধ করতে পারবেন।",
    "প্রয়োজনে ReadyWear কোনো পূর্ব ঘোষণা ছাড়াই এই নীতিমালা পরিবর্তনের সম্পূর্ণ অধিকার সংরক্ষণ করে।"
  ];

  return (
    <main className="flex-1 bg-gray-50/50 py-8 md:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">প্রাইভেসি পলিসি</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4">
            নীতিমালা
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            প্রাইভেসি পলিসি
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
            ReadyWear আপনার ব্যক্তিগত তথ্যের গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়। 
            আপনার তথ্য শুধুমাত্র আপনার শপিং অভিজ্ঞতা আরও সুন্দর ও নিরাপদ করার উদ্দেশ্যে ব্যবহার করা হয়।
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-200 mb-10"></div>

        {/* Policy Points */}
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

        {/* Footer Action */}
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
