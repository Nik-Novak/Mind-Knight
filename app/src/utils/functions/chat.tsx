import Highlighter from "react-highlight-words";

export function chatMessageMiddleware(message:string|undefined, searchPattern?:string, fontSize?:string|number){
  if(message == undefined) return undefined;
  // Define a regular expression to match <sprite name="..."> tags
  const spriteRegex = /<sprite\s+name="([^"]+)"\s*\/?>/g;

  // Split the message into parts separated by <sprite> tags
  const parts = message.split(spriteRegex);

  // Process each part, replacing <sprite> tags with <img> tags
  const processedParts = parts.map((part, index) => {
    if (index % 2 === 0) {
      return searchPattern ? <Highlighter searchWords={[searchPattern]} textToHighlight={part}/> : part; // Even indexes are plain text
    } else {
      const emojiName = part.replace(/"/g, ''); // Remove quotes from emoji name
      return <img key={index} src={`/img/emojis/${emojiName}.png`} alt="emoji" />;
    }
  });

  // Return the React node containing processed parts
  return <span style={{display:'flex', alignItems:'center', fontSize}}>{processedParts}</span>;
}