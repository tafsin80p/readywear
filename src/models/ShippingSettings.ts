import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShippingSettings extends Document {
  zones: {
    insideDhaka: {
      enabled: boolean;
      rate: number;
      estimatedDays: string;
    };
    outsideDhaka: {
      enabled: boolean;
      rate: number;
      estimatedDays: string;
    };
  };
  freeShipping: {
    enabled: boolean;
    minAmount: number;
  };
  storePickup: {
    enabled: boolean;
    instructions: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShippingSettingsSchema: Schema<IShippingSettings> = new Schema(
  {
    zones: {
      insideDhaka: {
        enabled: { type: Boolean, default: true },
        rate: { type: Number, default: 60 },
        estimatedDays: { type: String, default: "1-2 Business Days" },
      },
      outsideDhaka: {
        enabled: { type: Boolean, default: true },
        rate: { type: Number, default: 120 },
        estimatedDays: { type: String, default: "3-5 Business Days" },
      },
    },
    freeShipping: {
      enabled: { type: Boolean, default: false },
      minAmount: { type: Number, default: 2000 },
    },
    storePickup: {
      enabled: { type: Boolean, default: false },
      instructions: { type: String, default: "Pickup your order from our flagship store during business hours." },
    },
  },
  { timestamps: true }
);

// We need to delete the model from cache in development to ensure schema updates apply
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  delete mongoose.models.ShippingSettings;
  if (mongoose.connection && mongoose.connection.models) {
    // @ts-ignore
    delete mongoose.connection.models.ShippingSettings;
  }
}

const ShippingSettings: Model<IShippingSettings> = 
  mongoose.models.ShippingSettings || mongoose.model<IShippingSettings>("ShippingSettings", ShippingSettingsSchema);

export default ShippingSettings;
