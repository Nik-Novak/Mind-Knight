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
  minTimestamp:number,
  t:string|null,
  maxTimestamp:number,
  onShare?:()=>void
  onClose?:()=>void
}

export default function ShareDialog({open, minTimestamp, t, maxTimestamp, onShare=()=>{}, onClose=()=>{}}:Props){
  const playHead = useStore(state=>state.playhead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const [shareTimestamp, setShareTimestamp] = useState(false);
  const context = window.location.pathname === '/clip' ? 'clip' : 
    window.location.pathname === '/game' ? 'game' : undefined;
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
    >
      <DialogTitle>Share {context}</DialogTitle>
      <DialogContent sx={{display:'flex', flexDirection:'column', '& > *':{mt: 1} }}>
        <FormControlLabel control={<Checkbox value={shareTimestamp} onChange={(e,c)=>setShareTimestamp(c)} />} label={`Share with timestamp: ${t}`} />
        { shareTimestamp && <Slider 
          valueLabelDisplay="auto" 
          valueLabelFormat={(value)=>getTimeString(getTimeComponents(minTimestamp, value))} 
          min={minTimestamp} 
          max={maxTimestamp}
          // marks={marks}
          value={playHead?.valueOf()} 
          onChange={(evt, value)=>{typeof value === 'number' && setPlayHead(value)}}
        /> }
        {/* <DialogContentText> */}
          <CopyableText value={shareTimestamp ? window.location.href : removeSearchParam(window.location.href, 't')} />
        {/* </DialogContentText> */}
      </DialogContent>
      <DialogActions sx={{display:'flex', justifyContent:'center'}}>
        {context === 'clip' && <Button sx={{width:'130px'}} onClick={onShare}>Create GIF</Button>}
        <Button sx={{width:'130px'}} onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}