import { MindnightSessionProvider } from "@/components/MindnightSessionProvider";
import { SessionProvider } from "next-auth/react";
import { FC } from "react";

// export function suspense<P extends React.JSX.IntrinsicAttributes>(Component:FC<P>, fallback:ReactNode){
export function provideMindnightSession<P extends {}>(Component:FC<P>){
  return (props:P) => (
    <MindnightSessionProvider>
      <Component {...props} />
    </MindnightSessionProvider>
  )
};
