import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'order' | 'product' | 'category' | 'customer' | 'setting' | 'other';
  link: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['order', 'product', 'category', 'customer', 'setting', 'other'],
      default: 'other'
    },
    link: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Add index for faster querying of unread/recent notifications
NotificationSchema.index({ isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
