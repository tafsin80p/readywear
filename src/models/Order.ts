import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  attributes?: Record<string, string>;
}

export interface IOrder extends Document {
  orderId: string; // e.g. RW001
  userId?: mongoose.Types.ObjectId | any;
  customerInfo: {
    firstName: string;
    lastName?: string;
    phone: string;
    address: string;
    area: string;
    note?: string;
  };
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    total: number;
  };
  paymentMethod: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  isRead: boolean;
  
  // Verification & Integrations
  verificationStatus: "pending_verification" | "confirmed" | "fake" | "cancelled";
  telegramNotificationStatus: "pending" | "sent" | "failed";
  telegramMessageId?: string;
  telegramChatId?: string;
  telegramLastError?: string;
  
  googleSheetSyncStatus: "pending" | "sent" | "failed";
  googleSheetLastError?: string;
  
  confirmedAt?: Date;
  confirmedBy?: string;
  
  metaEventStatus: "not_sent" | "sent" | "failed";
  metaEventId?: string;
  metaEventSentAt?: Date;
  metaEventResponse?: any;
  metaEventError?: string;

  metaLeadEventStatus: "not_sent" | "sent" | "failed";
  metaLeadEventId?: string;
  metaLeadEventSentAt?: Date;

  source?: string; // Track if order came from Facebook, TikTok, Instagram, etc.

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String },
  color: { type: String },
  attributes: { type: Map, of: String },
});

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      area: { type: String, required: true, enum: ["inside", "outside"] },
      note: { type: String },
    },
    items: [OrderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryCharge: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isRead: { type: Boolean, default: false },
    
    // Verification & Integrations
    verificationStatus: {
      type: String,
      enum: ["pending_verification", "confirmed", "fake", "cancelled"],
      default: "pending_verification",
    },
    telegramNotificationStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    telegramMessageId: { type: String },
    telegramChatId: { type: String },
    telegramLastError: { type: String },
    
    googleSheetSyncStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    googleSheetLastError: { type: String },
    
    confirmedAt: { type: Date },
    confirmedBy: { type: String }, // e.g., Telegram User ID or Admin User ID
    
    metaEventStatus: {
      type: String,
      enum: ["not_sent", "sent", "failed"],
      default: "not_sent",
    },
    metaEventId: { type: String },
    metaEventSentAt: { type: Date },
    metaEventResponse: { type: Schema.Types.Mixed },
    metaEventError: { type: String },
    
    metaLeadEventStatus: {
      type: String,
      enum: ["not_sent", "sent", "failed"],
      default: "not_sent",
    },
    metaLeadEventId: { type: String },
    metaLeadEventSentAt: { type: Date },
    
    source: { type: String, default: "Website" },
  },
  {
    timestamps: true,
  }
);

// We need to delete the model from cache in development to ensure schema updates apply
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  delete mongoose.models.Order;
  if (mongoose.connection && mongoose.connection.models) {
    // @ts-ignore
    delete mongoose.connection.models.Order;
  }
}

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
