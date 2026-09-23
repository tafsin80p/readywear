import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIntegrationSettings extends Document {
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    authorizedUsers: string[];
    pendingTelegramUsers: {
      telegramId: string;
      name: string;
      username?: string;
      requestedAt: Date;
    }[];
  };
  meta: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
    testEventCode?: string;
    datasetName?: string;
    currency: string;
  };
  googleSheet: {
    enabled: boolean;
    webhookUrl: string;
    sheetUrl: string;
  };
  pathao: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    storeId: string;
    logoUrl?: string;
  };
  steadfast: {
    enabled: boolean;
    apiKey: string;
    secretKey: string;
    logoUrl?: string;
  };
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
    clientEmail?: string;
    privateKey?: string;
    propertyId?: string;
  };
  tiktok: {
    enabled: boolean;
    pixelId: string;
  };
  pushNotification: {
    enabled: boolean;
    appId: string;
    restApiKey: string;
  };
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    password?: string;
    fromEmail: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSettingsSchema: Schema<IIntegrationSettings> = new Schema(
  {
    telegram: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: "" },
      chatId: { type: String, default: "" },
      authorizedUsers: [{ type: String }],
      pendingTelegramUsers: [
        {
          telegramId: { type: String, required: true },
          name: { type: String, required: true },
          username: { type: String },
          requestedAt: { type: Date, default: Date.now }
        }
      ]
    },
    meta: {
      enabled: { type: Boolean, default: false },
      pixelId: { type: String, default: "" },
      accessToken: { type: String, default: "" },
      testEventCode: { type: String, default: "" },
      datasetName: { type: String, default: "Mehzin Offers" },
      currency: { type: String, default: "BDT" },
    },
    googleSheet: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: "" },
      sheetUrl: { type: String, default: "" },
    },
    pathao: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: "" },
      clientSecret: { type: String, default: "" },
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      storeId: { type: String, default: "" },
      logoUrl: { type: String, default: "" },
    },
    steadfast: {
      enabled: { type: Boolean, default: false },
      apiKey: { type: String, default: "" },
      secretKey: { type: String, default: "" },
      logoUrl: { type: String, default: "" },
    },
    googleAnalytics: {
      enabled: { type: Boolean, default: false },
      measurementId: { type: String, default: "" },
      clientEmail: { type: String, default: "" },
      privateKey: { type: String, default: "" },
      propertyId: { type: String, default: "" },
    },
    tiktok: {
      enabled: { type: Boolean, default: false },
      pixelId: { type: String, default: "" },
    },
    pushNotification: {
      enabled: { type: Boolean, default: false },
      appId: { type: String, default: "" },
      restApiKey: { type: String, default: "" },
    },
    smtp: {
      enabled: { type: Boolean, default: false },
      host: { type: String, default: "" },
      port: { type: Number, default: 465 },
      user: { type: String, default: "" },
      password: { type: String, default: "" },
      fromEmail: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// We need to delete the model from cache in development to ensure schema updates apply
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  delete mongoose.models.IntegrationSettings;
  if (mongoose.connection && mongoose.connection.models) {
    // @ts-ignore
    delete mongoose.connection.models.IntegrationSettings;
  }
}

const IntegrationSettings: Model<IIntegrationSettings> = 
  mongoose.models.IntegrationSettings || mongoose.model<IIntegrationSettings>("IntegrationSettings", IntegrationSettingsSchema);

export default IntegrationSettings;
