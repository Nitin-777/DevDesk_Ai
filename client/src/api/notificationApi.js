import api from "./axios";

export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await api.patch(
    `/notifications/${notificationId}/read`
  );
  return data.notification;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};