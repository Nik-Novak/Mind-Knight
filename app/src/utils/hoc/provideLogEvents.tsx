import {ServerEventsProvider} from "@/components/ServerEventsProvider";
import { FC } from "react";

// export function suspense<P extends React.JSX.IntrinsicAttributes>(Component:FC<P>, fallback:ReactNode){
export function provideLogEvents<P extends {}>(Component:FC<P>){
  return (props:P) => (
    <ServerEventsProvider>
      <Component {...props} />
    </ServerEventsProvider>
  )
};