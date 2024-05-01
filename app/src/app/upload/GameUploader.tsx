"use client";
import { uploadGames } from "@/actions/game";
import FormButton from "@/components/FormButton";
import Notification from "@/components/Notification";
import { useNotificationQueue } from "@/components/NotificationQueue";
import { LoadingButton } from "@mui/lab";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import Link from "next/link";
import { useRef, useState } from "react";

export default function GameUploader(){
  const [agreed, setAgreed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { pushNotification } = useNotificationQueue();
  return (
    <form 
      action={async (data)=>{
        console.log('TEST');
        await uploadGames();
        setAgreed(false);
        formRef.current?.reset();
        pushNotification(<Notification>Successfully Queued Uploads. Ping me to make sure I got them.</Notification>);
      }}
      ref={formRef}
      style={{display:'flex', flexDirection:'column', alignItems:'center'}}
    >
      <FormControlLabel control={<Checkbox value={agreed} onChange={(e, checked)=>setAgreed(checked)} />} label="I understand that only the games from my last 2 play sessions will be captured." />
      <FormButton sx={{paddingX:'50px'}} variant="contained" className="pixel-corners" disabled={!agreed} > Upload Games</FormButton>
    </form>
  )
}