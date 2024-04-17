import { coloredText } from "@/utils/functions/jsx";
import { IconButton, Typography } from "@mui/material";
import CopyIcon from '@mui/icons-material/ContentCopy';
import Highlighter from "react-highlight-words";
import style from './message.module.css';
import { useState } from "react";
import { copyToClipboard } from "@/utils/functions/general";
import { useNotificationQueue } from "../NotificationQueue";
import Notification from "../Notification";
import { chatMessageMiddleware } from "@/utils/functions/chat";

type Props = {
  author: string,
  color?: string,
  message: string,
  searchPattern: string
}

export default function Message({author, color, message, searchPattern}:Props){
  const [isHovered, setIsHovered] = useState(false);
  const {pushNotification} = useNotificationQueue();
  if(author === 'system')
    return <li className={style.message} >{`------- ${coloredText(message, color)} -------`}</li>
  else{
    let text = <span>{'['}{coloredText(author, color)}{']: '}{chatMessageMiddleware(message, searchPattern)}</span> //`[${coloredText(author, color)}]: ${message}`; //
    return (
      <li className={style.message} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>
        <Typography display={'flex'} justifyContent={'space-between'}>
          {text}
          {isHovered && <IconButton size="small" onClick={async ()=>{await copyToClipboard(`[${author}]: ${message}`); pushNotification(<Notification>Copied to Clipboard!</Notification>) }}><CopyIcon sx={{fontSize:14}}/></IconButton>}
        </Typography>
      </li>
    )
  }
}