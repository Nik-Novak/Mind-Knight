"use client";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Input, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useState } from "react";
import { ChatMessage, GamePlayers } from "@prisma/client";
import { ColorCode, colors } from "@/utils/constants/colors";

// type ChatMessage = {
//   author: string | 'system',
//   message: string,
//   color: string
// }






type Props = {
  chat:ChatMessage[],
  game_players: GamePlayers
}

export default function Chatlog({chat, game_players}:Props){
  const [searchPattern, setSearchPattern] = useState('');
  const [showMatchingChatOnly, setShowMatchingChatOnly] = useState(false);

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
      <ul style={{maxHeight:500, maxWidth:400, overflow:'hidden', overflowY:'scroll'}}>
        {chat.map(c=>{
          const slot = c.Slot as keyof typeof game_players;
          const author = game_players[slot]?.Username || '_UNKNOWN';
          const message = c.Message;
          const colorCode = game_players[slot]?.Color as ColorCode || 0
          let color = colors[ colorCode ].hex;
          // return <li>{JSON.stringify(c)}</li>
          if(author === 'system')
            return <li key={c.index}>{`------- ${coloredTextSpan(message, color)} -------`}</li>
          else
            return <li key={c.index}><Typography>{['[', coloredTextSpan(author, color), ']: ', message]}</Typography></li>
        })}
      </ul>
    </Stack>
  )
}

export function coloredTextSpan(text:string, color:string){
  return <span style={{color}}>{text}</span>;
}