"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MindnightSession } from '@prisma/client';
import { useServerEvents } from '../ServerEventsProvider';
import { redirect, useRouter } from 'next/navigation';

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
  const router = useRouter();
  useEffect(()=>{
    serverEvents.on('MindnightSessionUpdate', newMindnightSession=>{
      setMindnightSession(newMindnightSession);
      // revalidateTag(Tags.session);
      router.refresh();
    })
  }, []);

  useEffect(()=>{
    if(mindnightSession?.status === 'playing' && window.location.pathname !== '/game' && window.location.pathname !== '/clip' && window.location.pathname !== '/rewind')
      redirect('/game'); //redirect to game page
  }, [mindnightSession?.status === 'playing']); //when we first get the signal we're playing

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