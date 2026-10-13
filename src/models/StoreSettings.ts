import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreSettings extends Document {
  headerLogo?: string;
  footerLogo?: string;
  favicon?: string;
  storeName?: string;
  storeTagline?: string;
  storeDescription?: string;
  primaryColor?: string;
  notificationTone?: string;
  socialImage?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  messengerUrl?: string;

  // Offer Top Header / Countdown Banner
  offerBarEnabled?: boolean;
  offerBarTitle?: string;
  offerBarSubtitle?: string;
  offerBarBadgeText?: string;
  offerBarEndDate?: string;
  offerBarButtonText?: string;
  offerBarButtonLink?: string;
  offerBarBgGradient?: string;
  offerBarAutoFallbackOnExpire?: boolean;

  // Discount Price / Offer Price Toggle
  showDiscountPrice?: boolean;

  // Exclusive Offer Category Mode (Hide other categories & products during offer)
  offerCategoriesOnly?: boolean;
  offerCategorySlugs?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema: Schema<IStoreSettings> = new Schema(
  {
    headerLogo: { type: String, default: "" },
    footerLogo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    storeName: { type: String, default: "Mehzin Offers" },
    storeTagline: { type: String, default: "Premium E-commerce in Bangladesh" },
    storeDescription: { type: String, default: "Premium E-commerce in Bangladesh" },
    primaryColor: { type: String, default: "#F5426A" },
    notificationTone: { type: String, default: "" },
    socialImage: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    whatsappUrl: { type: String, default: "" },
    messengerUrl: { type: String, default: "" },

    // Offer Top Header / Countdown Banner
    offerBarEnabled: { type: Boolean, default: false },
    offerBarTitle: { type: String, default: "পূজার সেল অফার!" },
    offerBarSubtitle: { type: String, default: "অফার চলবে ৩ দিন — সমস্ত পোশাকে আকর্ষণীয় ছাড়" },
    offerBarBadgeText: { type: String, default: "পূজা স্পেশাল" },
    offerBarEndDate: { type: String, default: "" },
    offerBarButtonText: { type: String, default: "অফার দেখুন" },
    offerBarButtonLink: { type: String, default: "/categories" },
    offerBarBgGradient: { type: String, default: "bg-primary" },
    offerBarAutoFallbackOnExpire: { type: Boolean, default: true },

    // Discount Price / Offer Price Toggle
    showDiscountPrice: { type: Boolean, default: true },

    // Exclusive Offer Category Mode
    offerCategoriesOnly: { type: Boolean, default: false },
    offerCategorySlugs: { type: [String], default: [] }
  },
  { timestamps: true }
);

if (mongoose.models.StoreSettings) {
  delete mongoose.models.StoreSettings;
}
const StoreSettings: Model<IStoreSettings> = mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
