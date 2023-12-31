import { defineStore } from "pinia";
import { ref } from "vue";

interface Notification {
  id?: string;
  message: string;
  isLoading?: boolean;
  duration?: number;
}

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);

  const create = (notification: Notification) => {
    notification.id = Math.random().toString();
    notifications.value.unshift(notification);
    if (notification.duration)
      setTimeout(() => remove(notification), notification.duration);
    return notification;
  };
  const createLoading = (message: string) => {
    return create({ message, isLoading: true });
  };
  const remove = (notification: Notification) => {
    notifications.value.splice(notifications.value.indexOf(notification), 1);
  };

  return { notifications, create, createLoading, remove };
});
