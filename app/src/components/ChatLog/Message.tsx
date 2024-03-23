import { coloredText } from "@/utils/functions/jsx";
import { IconButton, Typography } from "@mui/material";
import CopyIcon from '@mui/icons-material/ContentCopy';
import Highlighter from "react-highlight-words";
import style from './message.module.css';
import { useState } from "react";
import { copyToClipboard } from "@/utils/functions/general";

type Props = {
  author: string,
  color: string,
  message: string,
  searchPattern: string
}

export default function Message({author, color, message, searchPattern}:Props){
  const [isHovered, setIsHovered] = useState(false);
  if(author === 'system')
    return <li className={style.message} >{`------- ${coloredText(message, color)} -------`}</li>
  else{
    let text = <span>{'['}{coloredText(author, color)}{']: '}<Highlighter searchWords={[searchPattern]} textToHighlight={message}/></span> //`[${coloredText(author, color)}]: ${message}`; //
    return (
      <li className={style.message} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>
        <Typography display={'flex'} justifyContent={'space-between'}>
          {text}
          {isHovered && <IconButton size="small" onClick={()=>{copyToClipboard(`[${author}]: ${message}`)}}><CopyIcon sx={{fontSize:14}}/></IconButton>}
        </Typography>
      </li>
    )
  }
}