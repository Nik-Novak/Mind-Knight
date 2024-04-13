"use client";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
export default function Loading(){
  const [startedLoading, setStartedLoading] = useState(false);
  const {pending} = useFormStatus();
  useEffect(()=>{
    setStartedLoading(true);
  }, [pending])
  return (
    <LoadingOverlay open={startedLoading} type="cradle" text="MindKnight is updating. Don't touch anything until a new window opens in your browser.\nIf it takes more than 5 minutes try launching normally." />
  )
}