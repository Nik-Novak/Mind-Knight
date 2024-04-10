
export function coloredText(text:string|undefined, color:string|undefined, key?:string){
  return <span key={key} style={{color}}>{text}</span>;
}