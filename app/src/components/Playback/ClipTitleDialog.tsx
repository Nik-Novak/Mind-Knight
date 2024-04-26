"use client";
import { createClip } from "@/actions/game";
import { useStore } from "@/zustand/store";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Stack, TextField, Typography } from "@mui/material";
import { useSession, signIn } from "next-auth/react";
import ClipIcon from '@mui/icons-material/ContentCut';
import FormButton from "../FormButton";
import React, { useState } from "react";
import { Clip } from "@prisma/client";
import { TransitionProps } from "@mui/material/transitions";
import { provideSession } from "@/utils/hoc/provideSession";
import Link from "next/link";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  open:boolean,
  clipTimes: [number, number],
  onComplete?:(clip:Clip)=>void
  onClose?:()=>void
}

function ClipTitleDialog({open, clipTimes, onComplete=()=>{}, onClose=()=>{}}:Props){
  const game = useStore(state=>state.game)!;
  const { data:session } = useSession();
  const [title, setTitle] = useState('');
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
    >
      <DialogTitle>Title the clip</DialogTitle>
      <DialogContent sx={{display:'flex', flexDirection:'column', '& > *':{mt: 1} }}>
        <form action={async (data)=>{
          if(!title)
            throw Error("Must provide a title");
          if(!session?.user.player_id)
            throw Error("Must be signed in to create a clip")
          let baseTime = game.game_found.log_time.valueOf(); //has to be from game_found.log_time for clips of clips
          let clip = await createClip(title, game.id, session.user.player_id, clipTimes[0]-baseTime, clipTimes[1]-baseTime);
          onComplete(clip);
        }}>
          {!session?.user.player_id && <Typography color="error">Must be <Link href='#' onClick={()=>signIn()}>signed in</Link></Typography>}
          <TextField fullWidth value={title} onChange={(evt)=>{
            const newValue = evt.target.value;
            if(newValue.match(/^(?!.*\s{2})(?:[a-zA-Z0-9]+(?:\s|$))*$/))
              setTitle(newValue)
          }} label="Clip Title" placeholder="Noobs Gone Wrong"  />
          <Stack sx={{mt:3}} spacing={2} direction='row' justifyContent='space-around'>
            <Button className="pixel-corners-small" sx={{width:'130px'}} onClick={onClose}>Cancel</Button>
            <FormButton disabled={title.length<3 || !session?.user.player_id} variant="contained" className="pixel-corners-small" sx={{width:'130px'}} color="warning"><ClipIcon sx={{mr:1}} /> Clip</FormButton>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default provideSession(ClipTitleDialog);