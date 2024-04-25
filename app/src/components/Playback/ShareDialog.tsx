"use client";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Slide, Slider, TextField } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import CopyableText from "../CopyableText";
import { getTimeComponents, getTimeString, removeSearchParam } from "@/utils/functions/general";
import { useQueryState } from "nuqs";
import Playback from "./Playback";
import { useStore } from "@/zustand/store";

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
  onShare?:()=>void
  onClose?:()=>void
}

export default function ShareDialog({open, onShare=()=>{}, onClose=()=>{}}:Props){
  const playHead = useStore(state=>state.playHead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const game = useStore(state=>state.game);
  const [shareTimestamp, setShareTimestamp] = useState(false);
  const [t, setT] = useQueryState('t');
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Share a link to this game</DialogTitle>
      <DialogContent sx={{display:'flex', flexDirection:'column', '& > *':{mt: 1} }}>
        <FormControlLabel control={<Checkbox value={shareTimestamp} onChange={(e,c)=>setShareTimestamp(c)} />} label={`Share with timestamp: ${t}`} />
        { shareTimestamp && game && <Slider 
          valueLabelDisplay="auto" 
          valueLabelFormat={(value)=>getTimeString(getTimeComponents(game.game_found.log_time, value))} 
          min={game.game_found.log_time.valueOf()} 
          max={game.latest_log_time.valueOf()}
          // marks={marks}
          value={playHead?.valueOf()} 
          onChange={(evt, value)=>{typeof value === 'number' && setPlayHead(new Date(value))}}
        /> }
        {/* <DialogContentText> */}
          <CopyableText value={shareTimestamp ? window.location.href : removeSearchParam(window.location.href, 't')} />
        {/* </DialogContentText> */}
      </DialogContent>
      <DialogActions>
        {/* <Button sx={{paddingX:'50px'}} onClick={onShare}>Share</Button> */}
        <Button sx={{paddingX:'50px'}} onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}