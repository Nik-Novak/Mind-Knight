import {LogEventsProvider} from "@/components/LogEventsProvider";
import { FC } from "react";

// export function suspense<P extends React.JSX.IntrinsicAttributes>(Component:FC<P>, fallback:ReactNode){
export function provideLogEvents<P extends {}>(Component:FC<P>){
  return (props:P) => (
    <LogEventsProvider>
      <Component {...props} />
    </LogEventsProvider>
  )
};