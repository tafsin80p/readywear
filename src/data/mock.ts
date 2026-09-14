export type NavLink = { label: string; href: string; isOffer?: boolean; hasDropdown?: boolean; };
export const navLinks: NavLink[] = [
  { label: "হোম", href: "/" },
  { label: "শাড়ি", href: "/category/saree" },
  { label: "ড্রেস", href: "/category/dress" },
  { label: "বেবি ড্রেস", href: "/category/baby-dress" },
  { label: "পাঞ্জাবি", href: "/category/panjabi" },
  { label: "কম্বো অফার", href: "/category/combo-offer" },
  { label: "অফার", href: "#", isOffer: true },
];

export const categoryData = [
  { slug: "saree", label: "শাড়ি", description: "ঐতিহ্যবাহী ও ট্রেন্ডি শাড়ি", image: "/Zunaira-1.webp" },
  { slug: "dress", label: "ড্রেস", description: "আকর্ষণীয় ও স্টাইলিশ ড্রেস", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" },
  { slug: "baby-dress", label: "বেবি ড্রেস", description: "ছোট সোনামণিদের জন্য কিউট ড্রেস", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop" },
  { slug: "panjabi", label: "পাঞ্জাবি", description: "স্টাইলিশ ও আরামদায়ক পাঞ্জাবি", image: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop" },
  { slug: "combo-offer", label: "কম্বো অফার", description: "সাশ্রয়ী মূল্যে সেরা কম্বো প্যাক", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop" },
];

export const categoryShortcuts = [
  { id: 1, label: "সকল পণ্য", icon: "LayoutGrid" },
  { id: 2, label: "শাড়ি", icon: "Image" },
  { id: 3, label: "ড্রেস", icon: "Dress" },
  { id: 4, label: "বেবি ড্রেস", icon: "Shirt" },
  { id: 5, label: "পাঞ্জাবি", icon: "Shirt" },
  { id: 6, label: "কম্বো অফার", icon: "ShoppingBag" },
];

export const products = [
  {
    id: 9,
    sku: "RW-1009",
    title: "জুনাইরা – কো-ওডস সেট",
    category: "ড্রেস",
    price: 1250,
    oldPrice: 1550,
    discount: 19,
    rating: 4.9,
    reviews: 145,
    image: "/Zunaira-1.webp",
    specifications: [
      { label: "কাজ", value: "ডিজিটাল প্রিন্ট এর কাজ করা" },
      { label: "ম্যাটেরিয়ালস", value: "ইম্পোর্টেড সফট সিল্ক" },
      { label: "ধরন", value: "২-পিস আকর্ষণীয় ড্রেস।" },
      { label: "সাইজ", value: "৩৪-৩৬-৩৮-৪০-৪২-৪৪-৪৬-৪৮" }
    ]
  },
  {
    id: 1,
    sku: "RW-1001",
    title: "মেহজাবিন কটন ড্রেস",
    category: "ড্রেস",
    price: 1199,
    oldPrice: 1500,
    discount: 20,
    rating: 4.8,
    reviews: 120,
    image: "/Zunaira-1.webp",
    specifications: [
      { label: "ডিটেইলস", value: "কাঠ ব্লক প্রিন্ট , এমব্রয়ডারি ও টার্সেল ওয়ার্ক" },
      { label: "ব্লাউজ পিস", value: "রেডি শাড়ি, রেডি ব্লাউজ শাড়ির সাথে এটাচ অথবা এটাচ ছাড়া দুইটা স্টাইল" },
      { label: "শাড়িটি লম্বায়", value: "১৩.৫+ হাত শাড়ি এবং বহর এ ২.৫ হাত (৪৬”) পরিমাপ এ কম বেশি হতে পারে।" },
      { label: "ডিজাইন", value: "আকর্ষণীয় ডিজাইনের রেডি-টু-ওয়্যার ব্লেন্ডেড শাড়ি" }
    ]
  },
  {
    id: 2,
    sku: "RW-1002",
    title: "কিউট প্রিন্টেড বেবি ড্রেস",
    category: "বেবি ড্রেস",
    price: 850,
    oldPrice: 1200,
    discount: 29,
    rating: 4.7,
    reviews: 86,
    inStock: false,
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    sku: "RW-1003",
    title: "জরির কাজের শাড়ি",
    category: "শাড়ি",
    price: 1499,
    oldPrice: 1999,
    discount: 25,
    rating: 4.9,
    reviews: 210,
    image: "/Zunaira-1.webp",
    specifications: [
      { label: "ডিটেইলস", value: "জরি সুতার আকর্ষণীয় কাজ ও স্টাইলিশ ডিজাইন" },
      { label: "ব্লাউজ পিস", value: "রেডি শাড়ি, রেডি ব্লাউজ শাড়ির সাথে এটাচ অথবা এটাচ ছাড়া দুইটা স্টাইল" },
      { label: "শাড়িটি লম্বায়", value: "১৩.৫+ হাত শাড়ি এবং বহর এ ২.৫ হাত (৪৬”) পরিমাপ এ কম বেশি হতে পারে।" },
      { label: "ডিজাইন", value: "আকর্ষণীয় ডিজাইনের রেডি-টু-ওয়্যার ব্লেন্ডেড শাড়ি" }
    ]
  },
  {
    id: 4,
    sku: "RW-1004",
    title: "কটন পাঞ্জাবি",
    category: "পাঞ্জাবি",
    price: 979,
    oldPrice: 1199,
    discount: 18,
    rating: 4.6,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    sku: "RW-1005",
    title: "ফ্যামিলি কম্বো প্যাক",
    category: "কম্বো অফার",
    price: 2550,
    oldPrice: 3200,
    discount: 20,
    rating: 4.8,
    reviews: 72,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    sku: "RW-1006",
    title: "বেবি বয় পাঞ্জাবি সেট",
    category: "বেবি ড্রেস",
    price: 950,
    oldPrice: 1250,
    discount: 24,
    rating: 4.5,
    reviews: 60,
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 7,
    sku: "RW-1007",
    title: "এক্সক্লুসিভ জর্জেট শাড়ি",
    category: "শাড়ি",
    price: 1899,
    oldPrice: 2500,
    discount: 24,
    rating: 4.6,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 8,
    sku: "RW-1008",
    title: "পাঞ্জাবি ও পায়জামা কম্বো",
    category: "কম্বো অফার",
    price: 1450,
    oldPrice: 1800,
    discount: 19,
    rating: 4.7,
    reviews: 38,
    inStock: false,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
  },
];

export const services = [
  { id: 1, title: "সারা দেশে ডেলিভারি", subtitle: "দ্রুত ও নিরাপদ ডেলিভারি", icon: "Truck" },
  { id: 2, title: "সিকিউর পেমেন্ট", subtitle: "বিভিন্ন পেমেন্ট অপশন", icon: "ShieldCheck" },
  { id: 3, title: "রিটার্ন পলিসি", subtitle: "সহজ রিটার্ন ও এক্সচেঞ্জ", icon: "RefreshCw" },
  { id: 4, title: "কাস্টমার সাপোর্ট", subtitle: "২৪/৭ সাপোর্ট টিম", icon: "HeadphonesIcon" },
];

export const mockOrders = [
  {
    id: "10045",
    date: "2026-09-12T10:30:00Z",
    total: 2449.00,
    status: "processing",
    items: [
      { name: "জুনাইরা – কো-ওডস সেট", quantity: 1, price: 1250, image: "/Zunaira-1.webp" },
      { name: "মেহজাবিন কটন ড্রেস", quantity: 1, price: 1199, image: "/Zunaira-1.webp" }
    ]
  },
  {
    id: "10042",
    date: "2026-08-25T14:15:00Z",
    total: 1499.00,
    status: "delivered",
    items: [
      { name: "জরির কাজের শাড়ি", quantity: 1, price: 1499, image: "/Zunaira-1.webp" }
    ]
  },
  {
    id: "10038",
    date: "2026-08-10T09:45:00Z",
    total: 850.00,
    status: "delivered",
    items: [
      { name: "কিউট প্রিন্টেড বেবি ড্রেস", quantity: 1, price: 850, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    id: "10025",
    date: "2026-07-05T16:20:00Z",
    total: 3500.00,
    status: "cancelled",
    items: [
      { name: "ফ্যামিলি কম্বো প্যাক", quantity: 1, price: 2550, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop" },
      { name: "বেবি বয় পাঞ্জাবি সেট", quantity: 1, price: 950, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=600&auto=format&fit=crop" }
    ]
  }
];
