import { SettingsProvider } from "@/components/SettingsProvider";
import { FC } from "react";

// export function suspense<P extends React.JSX.IntrinsicAttributes>(Component:FC<P>, fallback:ReactNode){
export function provideSettings<P extends {}>(Component:FC<P>){
  return (props:P) => (
    <SettingsProvider>
      <Component {...props} />
    </SettingsProvider>
  )
};