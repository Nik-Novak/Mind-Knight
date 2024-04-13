"use client";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
export default function Loading(){
  const [startedLoading, setStartedLoading] = useState(false);
  const {pending} = useFormStatus();
  useEffect(()=>{
    if(pending)
      setStartedLoading(true);
  }, [pending])
  return (
    <LoadingOverlay open={startedLoading} type="cradle" loadingContent={
      <Stack alignItems={'center'}>
        <Typography>MindKnight is updating. Don't touch anything until you see "UPDATE COMPLETE" in console.</Typography>
        <Typography>Then just relaunch the client.</Typography> 
        {/* <Typography>MindKnight is updating. Don't touch anything until a new window opens in your browser.</Typography>
        <Typography>If it takes more than 5 minutes try launching normally.</Typography>  */}
      </Stack>
    }/>
  )
}