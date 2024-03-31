"use client";
import { LogEvents } from '@/utils/classes/LogReader';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { EventEmitter } from 'events';
import { MindnightSession } from '@prisma/client';
import { useServerEvents } from '../ServerEventsProvider';
import { database } from '@/utils/database/database';

export type ServerEvents = LogEvents; //add new events here

export type ServerEventPacket = {
  type: keyof ServerEvents,
  payload: any
}

// const serverEvents = new EventEmitter<ServerEvents>();

const MindnightSessionContext = createContext<{mindnightSession:MindnightSession|null}>({ mindnightSession:null });

type Props = {
  children: React.ReactNode
}
/**
 * This component exists to bring the LogEvents available on server-side to client.
 * @param param0 
 * @returns 
 */
export function MindnightSessionProvider({ children }:Props) {
  const [ mindnightSession, setMindnightSession ] = useState<MindnightSession|null>(null);
  const {serverEvents} = useServerEvents();
  useEffect(()=>{
    serverEvents.on('MindnightSessionUpdate', newMindnightSession=>{
      setMindnightSession(newMindnightSession);
    })
  }, []);
  return (
    <MindnightSessionContext.Provider value={{ mindnightSession }}>
      {children}
    </MindnightSessionContext.Provider>
  );
};

export const useMindnightSession = () => {
  let context = useContext(MindnightSessionContext);
  if(!context) throw Error('useMindnightSession hook must be used in as a child component of <MindnightSessionProvider>');
  return context;
};