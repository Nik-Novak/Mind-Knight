"use client";
import React, { createContext, useContext, useEffect } from 'react';
import { EventEmitter } from 'events';
import { Game, MindnightSession } from '@prisma/client';
import { useStore } from '@/zustand/store';
import { dateTimeReviver } from '@/utils/functions/general';
import { ServerEventPacket, ServerEvents } from '@/types/events';
import { useRouter } from 'next/navigation';

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
  const setGame = useStore(state=>state.setGame);
  useEffect(()=>{
    if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS) throw Error('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS (connection to server ws for log events)');
    // console.log('Client WS');
    const ws = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
    ws.onopen = (t)=>{
      console.log('Connected to server WS');
      let packet:ServerEventPacket<'ClientInit'> = {
        type: 'ClientInit',
        payload:[]
      }
      ws.send(JSON.stringify(packet)); //request init latest gamedata and session, etc.
    }
    ws.onmessage = <T extends keyof ServerEvents>(e:MessageEvent<any>)=>{
      let packet = JSON.parse(e.data, dateTimeReviver) as ServerEventPacket<T>;
      //TODO: fix typing
      //@ts-expect-error
      serverEvents.emit(packet.type, ...packet.payload);
    }

    serverEvents.on('GameUpdate', (game)=>{
      if(window.location.pathname !== '/clip' && window.location.pathname !== '/rewind')
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