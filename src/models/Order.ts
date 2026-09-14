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
  },
  { timestamps: true }
);

// We need to delete the model from cache in development to ensure schema updates apply
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Order;
  if (mongoose.connection && mongoose.connection.models) {
    delete mongoose.connection.models.Order;
  }
}

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
