"use client";
import { getRemoteSettings, updateRemoteSettings } from "@/actions/settings";
import { ClientSettings } from "@prisma/client";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useReducer, useState } from "react";

const DefaultSettings:ClientSettings = {
  streamer_mode:false, 
  alpha_mode:false,
  josh_mode: false
};

const SettingsContext = createContext<{
  settings:ClientSettings, 
  updateSettings:Dispatch<Partial<ClientSettings>>
}|null>(null);

export function SettingsProvider({children}:{children:ReactNode}){
  const settingsReducer = (state:ClientSettings, update:Partial<ClientSettings>)=>{
    updateRemoteSettings(update);
    return {...state, ...update};
  }
  const [settings, updateSettings] = useReducer(settingsReducer, DefaultSettings);
  useEffect(()=>{
    getRemoteSettings().then(s=>updateSettings(s));
  }, []);
  return(
    <SettingsContext.Provider value={{settings, updateSettings}}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = ()=>{
  const context = useContext(SettingsContext);
  if(!context)
    throw Error("useSettings must be used within a <SettingsProvider>");
  return context;
}