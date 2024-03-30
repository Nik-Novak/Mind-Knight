import Notification, { NotificationProps } from "@/components/Notification";

type pushNotificationFunc = (notification: React.ReactElement<NotificationProps>) => void;

let notificationService: pushNotificationFunc| null = null;

// notificationService.js
export const setNotify = (pushNotification: pushNotificationFunc) => {
  notificationService = pushNotification;
};

export const notify = (message: string, options?:Omit<NotificationProps, 'children'>) => {
  if (notificationService) {
    notificationService(<Notification {...options}>{message}</Notification>);
  } else {
    throw Error('NotificationProvider is not mounted.')
  }
};
