import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Trash2 } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  getUnreadCount,
  Notification,
} from "@/lib/userPreferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = () => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  useEffect(() => {
    refresh();
  }, [isOpen]);

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    refresh();
  };

  const handleClearAll = () => {
    clearNotifications();
    refresh();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="relative p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-all duration-300"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center pulse-dot text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 glass-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={handleMarkAllRead}
                className="p-1.5 rounded-md hover:bg-primary/15 hover:text-primary transition-all duration-200"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive transition-all duration-200"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notifications
            </div>
          ) : (
            notifications.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 border-b border-border/30 last:border-0 transition-all duration-200 hover:bg-secondary/50 ${
                  !notification.read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
              >
                {notification.mediaId && notification.mediaType ? (
                  <Link
                    to={`/${notification.mediaType}/${notification.mediaId}`}
                    onClick={() => {
                      handleMarkRead(notification.id);
                      setIsOpen(false);
                    }}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                  </Link>
                ) : (
                  <div onClick={() => handleMarkRead(notification.id)} className="cursor-pointer">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
