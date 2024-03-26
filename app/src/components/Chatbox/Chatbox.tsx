"use client";
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useRef, useState } from "react";
import { ChatMessage, GamePlayers } from "@prisma/client";
import { ColorCode, colors } from "@/utils/constants/colors";
import { GlobalChatMessage, PlayerSlot } from "@/types/game";
import Message from "./Message";
import { sendGlobalMessage } from "@/actions/chat";

// type Props = {
//   chat: (ChatMessage | GlobalChatMessage)[],
//   game_players: GamePlayers
// }

type GameProps = {
  chat:(ChatMessage)[],
  game_players: GamePlayers, //will treat as game chat if game_players
  sendMessage?: (message:string)=>Promise<ChatMessage[]>
}

type GlobalProps = {
  chat:(GlobalChatMessage)[],
  game_players?: undefined //will treat as global chat if no game_players
  sendMessage?: (message:string)=>Promise<GlobalChatMessage[]>
}

export default function Chatbox({chat, game_players, sendMessage}:GameProps|GlobalProps){
  const [searchPattern, setSearchPattern] = useState('');
  const [showMatchingChatOnly, setShowMatchingChatOnly] = useState(true);
  const messageForm = useRef<HTMLFormElement>(null);

  let processedChat = chat;
  if (searchPattern && showMatchingChatOnly){
    processedChat = chat.filter((c)=>{
      if( c.Message.toLowerCase().includes(searchPattern.toLowerCase()) ) //message contains query
        return true;
      if( game_players && game_players[(c as ChatMessage).Slot as PlayerSlot]?.Username.toLowerCase().includes(searchPattern.toLowerCase()) ) //author contains query
        return true;
    }
    ) as ChatMessage[] | GlobalChatMessage[];
  }
  return (
    <Stack>
      <Stack direction='row' spacing={2}>
        <TextField style={{flexGrow:1}} variant="standard" value={searchPattern} placeholder="Search" onChange={(event)=>setSearchPattern(event.target.value)} 
          InputProps={{ endAdornment: <InputAdornment position="end">
              <IconButton onClick={()=>{setSearchPattern('');}}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>}} 
        />
        <Tooltip title={showMatchingChatOnly?'SHOW all messages':'HIDE messages that do NOT match'} placement="right" arrow>
          <IconButton className="toggle-visibility" onClick={(event)=>setShowMatchingChatOnly(m=>!m)}>
            {showMatchingChatOnly ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <ul style={{maxHeight:'30vh', overflow:'hidden', overflowY:'scroll'}}>
        {processedChat.map((c, i)=>{
            const slot = game_players && (c as ChatMessage).Slot as PlayerSlot; //game_players existing enforces ChatMessage type
            const author = game_players && game_players[slot!]?.Username || (c as GlobalChatMessage).Username;
            const message = c.Message;
            const colorCode = game_players && game_players[slot!]?.Color as ColorCode;
            let color = game_players && colors[ colorCode! ].hex;
            return <Message key={i} author={author} color={color} message={message} searchPattern={searchPattern} />
        })}
      </ul>
      { sendMessage && <form action={async (data)=>{
        let msg = data.get('message')?.toString();
        if(!msg) return;
        await sendMessage(msg);
        messageForm.current?.reset();
      }} style={{display:'flex'}} ref={messageForm}>
        <TextField name="message" style={{flexGrow:1}} variant="standard" placeholder="Message" 
          InputProps={{ endAdornment: <InputAdornment position="end">
              <Button type="submit" sx={{fontSize:12, padding: '2px'}} variant="contained" className="pixel-corners-small">
                Send
              </Button>
            </InputAdornment>}}
        />
      </form>
      }
    </Stack>
  )
}