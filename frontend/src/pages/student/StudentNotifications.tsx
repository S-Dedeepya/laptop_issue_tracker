import { useEffect } from "react";
import { useNotificationStore } from "@/store/notification.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StudentNotifications() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with your laptop requests and issues
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Recent updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    !notification.isRead
                      ? "bg-blue-50 border-blue-200"
                      : "bg-background"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Bell
                      className={`h-5 w-5 ${
                        !notification.isRead
                          ? "text-blue-600"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-sm ${
                        !notification.isRead ? "font-medium" : ""
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(notification.createdAt),
                        "MMM dd, yyyy hh:mm a"
                      )}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
