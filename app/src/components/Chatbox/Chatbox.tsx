"use client";
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useRef, useState, useOptimistic, useEffect } from "react";
import { ChatMessage, GamePlayers } from "@prisma/client";
import { ColorCode, colors } from "@/utils/constants/colors";
import { GlobalChatMessage, PlayerSlot } from "@/types/game";
import Message from "./Message";
import { useRouter } from "next/navigation";
import { provideLogEvents } from "@/utils/hoc/provideLogEvents";
import { useServerEvents } from "../ServerEventsProvider";
import { LogEvents } from "@/utils/classes/LogReader";
import { provideMindnightSession } from "@/utils/hoc/provideMindnightSession";
import { useMindnightSession } from "../MindnightSessionProvider";
import { useStore } from "@/zustand/store";
import { hasHappened } from "@/utils/functions/game";

// type GameProps = {
//   chat:(GlobalChatMessage|ChatMessage)[],
//   game_players: GamePlayers, //will treat as game chat if game_players
//   sendMessage?: (message:string)=>Promise<ChatMessage[]>
// }

type Props = {
  chat?:(GlobalChatMessage|ChatMessage)[],
  // game_players?: GamePlayers //will treat as global chat if no game_players
  sendMessage?: (message:string)=>Promise<GlobalChatMessage|ChatMessage>
}

function Chatbox({ chat, sendMessage}:Props){
  const playHead = useStore(state=>state.playHead);
  const [searchPattern, setSearchPattern] = useState('');
  const [showMatchingChatOnly, setShowMatchingChatOnly] = useState(true);
  const messageForm = useRef<HTMLFormElement>(null);
  const chatContainerRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const { serverEvents } = useServerEvents();
  const { mindnightSession } = useMindnightSession();

  if(!chat)
    chat = useStore(state=>state.game?.chat) || [];
  
  const game_players = useStore(state=>state.game?.game_players);

  // console.log('CHATBOX MN SESSION', mindnightSession);

  const [optimisticChat, addOptimisticChat] = useOptimistic(
    chat,
    (state, newChat:GlobalChatMessage|ChatMessage)=>{
      return [...state, newChat];
    }
  );

  let processedChat = optimisticChat;
  if (searchPattern && showMatchingChatOnly || playHead){ //any of these conditions triggers a filter;
    processedChat = optimisticChat.filter((c)=>{
      if(playHead && game_players && !hasHappened((c as ChatMessage).log_time, playHead)){ //!has happened
        return false;
      }
      if(searchPattern){
        if( c.Message.toLowerCase().includes(searchPattern.toLowerCase()) ) //message contains query
          return true;
        if( game_players && game_players[(c as ChatMessage).Slot as PlayerSlot]?.Username.toLowerCase().includes(searchPattern.toLowerCase()) ) //author contains query
          return true;
        return false;
      }
      return true;
    }
    )
  }

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      // Check if the scroll is at the bottom
      const isAtBottom = chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 30;

      // console.log(isAtBottom, chatContainer.scrollHeight, chatContainer.clientHeight, chatContainer.scrollHeight - chatContainer.clientHeight, chatContainer.scrollTop + 30);
      // If it's at the bottom, scroll to the bottom after new content is added
      if (isAtBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;
      }
    }
  }, [processedChat.length]);

  useEffect(()=>{
    let onReceiveGlobalChatMessage = (data:LogEvents['ReceiveGlobalChatMessage'][0])=> {
      router.refresh();
    };
    serverEvents.on('ReceiveGlobalChatMessage', onReceiveGlobalChatMessage );
    //cleanup event listener
    return ()=> {serverEvents.removeListener('ReceiveGlobalChatMessage', onReceiveGlobalChatMessage )};
  }, []);
  
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
          <IconButton className="toggle-visibility" onClick={(event)=>{setShowMatchingChatOnly(m=>!m);}}>
            {showMatchingChatOnly ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <ul style={{maxHeight:'30vh', overflow:'hidden', overflowY:'scroll', textAlign:'left'}} ref={chatContainerRef}>
        {processedChat.map((c, i)=>{
          const slot = game_players && (c as ChatMessage).Slot as PlayerSlot; //game_players existing enforces ChatMessage type
          const author = game_players && game_players[slot!]?.Username || (c as GlobalChatMessage).Username;
          const message = c.Message;
          const colorCode = game_players && game_players[slot!]?.Color as ColorCode;
          let color = game_players && colors[ colorCode || 0 ].hex;
          return <Message key={i} author={author} color={color} message={message} searchPattern={searchPattern} />
        })}
      </ul>
      { sendMessage && <form action={async (data)=>{
        let msg = data.get('message')?.toString();
        if(!msg || !mindnightSession) return;
        addOptimisticChat({
          Message: msg,
          SteamId: mindnightSession.steam_id,
          Username: mindnightSession.name,
          Roles: [0],
          Timestamp: Date.now()
        })
        await sendMessage(msg);
        messageForm.current?.reset();
        // router.refresh();
      }} style={{display:'flex'}} ref={messageForm}>
        <TextField disabled={mindnightSession?.status!=='ready'} name="message" style={{flexGrow:1}} variant="standard" placeholder="Message" 
          InputProps={{ endAdornment: <InputAdornment position="end">
              <Button type="submit" disabled={mindnightSession?.status!=='ready'} sx={{fontSize:12, padding: '2px'}} variant="contained" className="pixel-corners-small">
                Send
              </Button>
            </InputAdornment>}}
        />
      </form>
      }
    </Stack>
  )
}

export default Chatbox;