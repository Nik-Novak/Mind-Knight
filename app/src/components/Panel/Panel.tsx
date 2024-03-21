import { Accordion, AccordionDetails, AccordionSummary, Paper, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";

type Props = {
  title: string,
  defaultExpanded?: boolean,
  children: React.ReactNode
}

export default function Panel({title, defaultExpanded=true, children}:Props){
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h5">{title}</Typography></AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}