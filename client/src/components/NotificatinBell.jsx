import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notificationApi";

const NotificationBell = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data = { unreadCount: 0, notifications: [] } } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync(notification._id);
    }

    setIsOpen(false);

    if (notification.ticket?._id) {
      navigate(`/tickets/${notification.ticket._id}`);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        <Bell size={18} />

        {data.unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
            {data.unreadCount > 99 ? "99+" : data.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Notifications
              </h2>
              <p className="text-xs text-gray-500">
                {data.unreadCount} unread
              </p>
            </div>

            {data.unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                title="Mark all as read"
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                <CheckCheck size={17} />
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {data.notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto text-gray-400" size={28} />
                <p className="mt-2 text-sm text-gray-500">
                  No notifications yet.
                </p>
              </div>
            ) : (
              data.notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                    notification.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-gray-300"
                          : "bg-blue-600"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm leading-5 text-gray-800">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;