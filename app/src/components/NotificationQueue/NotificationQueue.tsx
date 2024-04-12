"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Notification, { NotificationProps } from "@/components/Notification";
import { setNotify } from "./notificationService";

// Define a type for the notification queue item
interface QueueItem {
  key: number;
  notification: React.ReactElement<NotificationProps>;
}

// Create a context for the notifications
const NotificationContext = createContext<{
  notifications: QueueItem[];
  pushNotification: (notification: React.ReactElement<NotificationProps>) => void;
}>({
  notifications: [],
  pushNotification: () => {},
});

// Provider component
export const NotificationProvider = ({ children }:{children:React.ReactNode}) => {
  const [notificationQueue, setNotificationQueue] = useState<QueueItem[]>([]);

  const popNotification = useCallback(
    () =>
      setNotificationQueue((prevQueue) => {
        return prevQueue.slice(1);
      }),
    []
  );

  const pushNotification = useCallback((notification: React.ReactElement<NotificationProps>) => {
    setNotificationQueue((prevQueue) => {
      let key = prevQueue.length;
      return [...prevQueue, { key, notification }];
    });
  }, []);

  useEffect(() => {
    setNotify(pushNotification);
  }, [pushNotification]);

  const handleNotificationClose = useCallback((key: number) => {
    setNotificationQueue((prevQueue) => {
      return prevQueue.filter((item) => item.key !== key);
    });
  }, []);

  // Generate snackbars from the notification queue
  const renderableNotifications = notificationQueue.map(({ key, notification }) => {
    return (
      <Notification
        open={true}
        {...notification.props}
        className={`notification ${notification.props.className}`}
        key={key}
        onClose={(evt) => handleNotificationClose(key)}
        ClickAwayListenerProps={{
          onClickAway: (evt) => {
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            evt.preventDefault();
            const element = evt.target as Element;
            if (!element.closest(".notification")) {
              //only pop when not clicking an existing notif
              popNotification();
            }
            return false;
          },
        }}
      >
        {notification.props.children}
      </Notification>
    );
  });

  return (
    <NotificationContext.Provider value={{ notifications: notificationQueue, pushNotification }}>
      {renderableNotifications}
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotificationQueue = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationQueue must be used within a NotificationProvider");
  }
  return context;
};
