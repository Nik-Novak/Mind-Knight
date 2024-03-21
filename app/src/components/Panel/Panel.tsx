import { Accordion, AccordionDetails, AccordionSummary, Paper } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";

type Props = {
  title: string,
  children: React.ReactNode
}

export default function Panel({title, children}:Props){
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>{title}</AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}