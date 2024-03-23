"use client";
import { IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useState } from "react";
import { ChatMessage, GamePlayers } from "@prisma/client";
import { ColorCode, colors } from "@/utils/constants/colors";
import { PlayerSlot } from "@/types/game";
import Message from "./Message";

type Props = {
  chat:ChatMessage[],
  game_players: GamePlayers
}

export default function Chatlog({chat, game_players}:Props){
  const [searchPattern, setSearchPattern] = useState('');
  const [showMatchingChatOnly, setShowMatchingChatOnly] = useState(true);
  let processedChat = chat;
  if (searchPattern && showMatchingChatOnly){
    processedChat = chat.filter(c=>
      c.Message.toLowerCase().includes(searchPattern.toLowerCase()) 
      || game_players[c.Slot as PlayerSlot]?.Username.toLowerCase().includes(searchPattern.toLowerCase())
    );
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
        {processedChat.map(c=>{
          const slot = c.Slot as PlayerSlot;
          const author = game_players[slot]?.Username || '_UNKNOWN';
          const message = c.Message;
          const colorCode = game_players[slot]?.Color as ColorCode || 0
          let color = colors[ colorCode ].hex;
          return <Message key={c.index} author={author} color={color} message={message} searchPattern={searchPattern} />
        })}
      </ul>
    </Stack>
  )
}