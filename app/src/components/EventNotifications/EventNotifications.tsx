"use client";

import { useEffect } from "react";
import { useNotificationQueue } from "../NotificationQueue";
import { ServerEvents, useServerEvents } from "../ServerEventsProvider";
import Notification from "../Notification";

export default function EventNotifications(){
  const { pushNotification } = useNotificationQueue();
  const { serverEvents } = useServerEvents();
  useEffect(()=>{
    let onPlayerInfo = ({Nickname, Steamid}:ServerEvents['PlayerInfo'][0])=>{
      console.log('NOTIFY');
      pushNotification(<Notification>Welcome back {Nickname}!</Notification>)
    }
    serverEvents.on('PlayerInfo', onPlayerInfo);
    return ()=>{serverEvents.removeListener('PlayerInfo', onPlayerInfo)};
  }, []);
  return null;
}