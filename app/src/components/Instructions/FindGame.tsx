"use client";
import { sendToMindnight } from "@/actions/mindnight-connection";
import FormButton from "../FormButton";
import { LogSendEvents, ServerEvents } from "@/types/events";
import { useEffect, useState } from "react";
import { useServerEvents } from "../ServerEventsProvider";
import { Slider, Stack, Typography } from "@mui/material";

export default function FindGame(){
  const [searching, setSearching] = useState(false);
  const [roomInfo, setRoomInfo] = useState<ServerEvents['RoomInfo'][0]|undefined>({AcceptedPlayers:6, MaxPlayers:8, PlayersCount:7, StartIn: 7000, Type:103});
  // const [roomInfo, setRoomInfo] = useState<ServerEvents['RoomInfo'][0]|undefined>();
  const [choice, setChoice] = useState<'accepted'|'refused'>();
  const {serverEvents} = useServerEvents();
  useEffect(()=>{
    serverEvents.on('RoomInfo', room_info=>{
      setRoomInfo(room_info);
      let timeUntilStart = room_info.StartIn;
      setTimeout(()=>setRoomInfo(undefined), timeUntilStart);
    })
  }, []);
  return (
    roomInfo ? 
      <form action={async (data)=>{
        if(choice === 'accepted'){
          let packet:LogSendEvents['Acceptmatch'][0] = {
            Type:105
          }
          await sendToMindnight(packet);
        }
        else if(choice === 'refused'){
          // setRoomInfo(undefined);
        }
      }}>
        <Typography>A MATCH WAS FOUND</Typography>
        <Slider
        sx={{mt:5}}
          aria-label="Players"
          defaultValue={0}
          step={1}
          marks
          min={0}
          max={8}
          value={4}
          valueLabelDisplay="on"
          valueLabelFormat={value=>`${value} accepted`}
          // slots={{
          //   thumb:<div></div>
          // }}
          disabled
        />
        <Stack mt={2} direction={'row'} >
          <FormButton type='submit' value={'accepted'} onClick={()=>setChoice('accepted')} sx={{bgcolor:'#6c6c6c', color:'#ADADAD', fontSize:24, paddingX:10}} className="">ACCEPT</FormButton>
          <FormButton type='submit' value={'refused'} onClick={()=>setChoice('refused')} sx={{bgcolor:'#6c6c6c', color:'#ADADAD', fontSize:24, paddingX:10}} className="">REFUSE</FormButton>
        </Stack>
      </form>
    :
      <form action={async ()=>{
        if(!searching) {
          let packet:LogSendEvents['FindGame'][0] = {
            Type:101,
            RandomSkin: false,
            LevelGroup: 0
          }
          await sendToMindnight(packet);
          setSearching(true);
        }
        else {
          let packet:LogSendEvents['CancelSearch'][0] = {
            Type:104
          }
          await sendToMindnight(packet);
          setSearching(false);
        }
      }}>
        <FormButton variant="contained" className="pixel-corners" sx={{paddingX: '50px'}}>{!searching ? 'Find Game' : 'Cancel'}</FormButton>
      </form>
  )
}