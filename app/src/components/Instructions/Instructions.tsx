"use client";

import { Typography } from "@mui/material";
import { useState } from "react";

export default function Instructions(){
  const [instructions, setInstructions] = useState('launch mindnight to begin...');
  return(
    <Typography variant="h3">{instructions}</Typography>
  )
}