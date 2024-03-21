import { Component, FC, ReactNode, Suspense } from "react";

// export function suspense<P extends React.JSX.IntrinsicAttributes>(Component:FC<P>, fallback:ReactNode){
export function suspense<P extends {}>(Component:FC<P>, fallback:ReactNode){
  return (props:P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
};