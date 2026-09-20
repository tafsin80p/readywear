import Notification from "@/models/Notification";
import { oneSignalService } from "./oneSignalService";
import connectToDatabase from "@/lib/mongodb";

type ActivityType = 'order' | 'product' | 'category' | 'customer' | 'setting' | 'other';

interface ActivityLogParams {
  title: string;
  message: string;
  type: ActivityType;
  link: string;
  sendPush?: boolean;
}

export const activityLogService = {
  /**
   * Logs an activity to the Notification collection.
   * Optionally sends a push notification via oneSignalService.
   */
  logActivity: async ({ title, message, type, link, sendPush = true }: ActivityLogParams) => {
    try {
      await connectToDatabase();
      
      // Save to database
      const newNotification = await Notification.create({
        title,
        message,
        type,
        link,
        isRead: false
      });

      // Send push notification if requested
      if (sendPush) {
        try {
          await oneSignalService.sendAdminNotification(title, message, link, type);
        } catch (err) {
          console.error("Failed to send push notification from activity log", err);
        }
      }

      return { success: true, notification: newNotification };
    } catch (error) {
      console.error("Failed to log activity:", error);
      return { success: false, error };
    }
  }
};
