import { Accordion, AccordionDetails, AccordionSummary, Paper, SxProps, Theme, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";

type Props = {
  title: string,
  defaultExpanded?: boolean,
  children: React.ReactNode,
  containerSx?:SxProps<Theme>
}

export default function Panel({title, defaultExpanded=false, containerSx, children}:Props){
  return (
    <Accordion sx={containerSx} defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h5">{title}</Typography></AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}