"use client";
import { LogEvents } from '@/utils/classes/LogReader';
import React, { createContext, useContext, useEffect } from 'react';
import { EventEmitter } from 'events';

type WSPacket = {
  type: keyof LogEvents,
  payload: any
}

const logEvents = new EventEmitter<LogEvents>();

const LogEventsContext = createContext({ logEvents });

type Props = {
  children: React.ReactNode
}
/**
 * This component exists to bring the LogEvents available on server-side to client.
 * @param param0 
 * @returns 
 */
export function LogEventsProvider({ children }:Props) {
  // console.log('LOG EVENTS PROVIDER');
  useEffect(()=>{
    if(!process.env.NEXT_PUBLIC_LOGEVENTS_WS) throw Error('Must provide env NEXT_PUBLIC_LOGEVENTS_WS (connection to server ws for log events)');
    // console.log('Client WS');
    const ws = new WebSocket(process.env.NEXT_PUBLIC_LOGEVENTS_WS);
    ws.onopen = ()=>console.log('Connected to server WS');
    ws.onmessage = (e)=>{
      let packet = JSON.parse(e.data) as WSPacket;
      // console.log('WSPAcket', packet);
      logEvents.emit(packet.type, packet.payload);
    }
  }, []);
  return (
    <LogEventsContext.Provider value={{logEvents}}>
      {children}
    </LogEventsContext.Provider>
  );
};

export const useLogEvents = () => {
  let context = useContext(LogEventsContext);
  if(!context) throw Error('useLogEvents must be used in a child component of <LogEventsProvider>');
  return context;
};