import { Key } from "react";

export function coloredText(text:string|undefined, color:string|undefined, key?:Key){
  return <span key={key} style={{color}}>{text}</span>;
}