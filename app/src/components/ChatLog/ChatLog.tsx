"use client";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Input, InputAdornment, Paper, Stack, TextField, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useState } from "react";

type ChatMessage = {
  author: string | 'system',
  message: string,
  color: string
}

type Props = {
  chat:ChatMessage[]
}

export function coloredTextSpan(text:string, color:string){
  return <span style={{color:color}}>{text}</span>;
}

export default function Chatlog({chat}:Props){
  const [searchPattern, setSearchPattern] = useState('');
  const [showMatchingChatOnly, setShowMatchingChatOnly] = useState(false);

  return (
    <Stack>
      <Box className="panel-search">
        <TextField variant="standard" value={searchPattern} placeholder="Search" onChange={(event)=>setSearchPattern(event.target.value)} 
          InputProps={{ endAdornment: <InputAdornment position="end">
              <IconButton onClick={()=>setSearchPattern('')}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>}} 
        />
        <Tooltip title={showMatchingChatOnly?'SHOW all messages':'HIDE messages that do NOT match'} placement="right" arrow>
          <IconButton className="toggle-visibility" onClick={(event)=>setShowMatchingChatOnly(m=>!m)}>
            {showMatchingChatOnly ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <ul>
        {chat.map(c=>{
          if(c.author === 'system')
            return <li>{`------- ${coloredTextSpan(c.message, c.color)} -------`}</li>
          else
            return <li>{`[${coloredTextSpan(c.author, c.color)}]: ${c.message}`}</li>
        })}
      </ul>
    </Stack>
  )
}