"use client";
import { LogEvents } from '@/utils/classes/LogReader';
import React, { createContext, useContext, useEffect } from 'react';
import { EventEmitter } from 'events';
import { Game, MindnightSession } from '@prisma/client';
import { useStore } from '@/zustand/store';

type SessionEvents = {
  MindnightSessionUpdate: [MindnightSession|null]
}

type GameEvents = {
  GameUpdate: [Game|undefined]
}


export type ServerEvents = LogEvents & SessionEvents & GameEvents; //add new events here

export type ServerEventPacket = {
  type: keyof ServerEvents,
  payload: any
}

const serverEvents = new EventEmitter<ServerEvents>();

const ServerEventsContext = createContext({ serverEvents });

type Props = {
  children: React.ReactNode
}
/**
 * This component exists to bring the LogEvents available on server-side to client.
 * @param param0 
 * @returns 
 */
export function ServerEventsProvider({ children }:Props) {
  const { game, setGame } = useStore();
  useEffect(()=>{
    if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS) throw Error('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS (connection to server ws for log events)');
    // console.log('Client WS');
    const ws = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
    ws.onopen = ()=>console.log('Connected to server WS');
    ws.onmessage = (e)=>{
      let packet = JSON.parse(e.data) as ServerEventPacket;
      // console.log('WSPAcket', packet);
      serverEvents.emit(packet.type, packet.payload);
    }

    serverEvents.on('GameUpdate', game=>{
      console.log('HERE1', game);
      setGame(game);
    });
  }, []);
  
  return (
    <ServerEventsContext.Provider value={{ serverEvents }}>
      {children}
    </ServerEventsContext.Provider>
  );
};

export const useServerEvents = () => {
  let context = useContext(ServerEventsContext);
  if(!context) throw Error('useServerEvents must be used in a child component of <ServerEventsProvider>');
  return context;
};