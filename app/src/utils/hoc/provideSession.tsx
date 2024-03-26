import { SessionProvider } from "next-auth/react";
import { FC } from "react";

// export function suspense<P extends React.JSX.IntrinsicAttributes>(Component:FC<P>, fallback:ReactNode){
export function provideSession<P extends {}>(Component:FC<P>){
  return (props:P) => (
    <SessionProvider>
      <Component {...props} />
    </SessionProvider>
  )
};