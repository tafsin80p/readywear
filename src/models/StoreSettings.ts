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
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema: Schema<IStoreSettings> = new Schema(
  {
    headerLogo: { type: String, default: "" },
    footerLogo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    storeName: { type: String, default: "ReadyWear" },
    storeTagline: { type: String, default: "Premium E-commerce in Bangladesh" },
    storeDescription: { type: String, default: "Premium E-commerce in Bangladesh" },
    primaryColor: { type: String, default: "#F5426A" },
    notificationTone: { type: String, default: "" }
  },
  { timestamps: true }
);

if (mongoose.models.StoreSettings) {
  delete mongoose.models.StoreSettings;
}
const StoreSettings: Model<IStoreSettings> = mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
