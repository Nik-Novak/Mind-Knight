import { useLang } from "@/hooks/LangContext";
import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from "@mui/material";
import { useRef } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type ConfirmDialogProps = {
  title: string;
  data: any|null;
  excludeFields?: string[];
  onClose: () => void;
};

export default function DetailsDialog({ title, data, excludeFields = [], onClose = () => {} }: ConfirmDialogProps) {
  // const { t } = useLang();
  const dialogInputRef = useRef<HTMLInputElement>();

  const StringEllipsis = (str:any, limit=40)=>{
    let safeString = String(str).substring(0,limit);
    let isOverLimit = String(str).length > limit;
    return (
    <Tooltip title={String(str)}>
      <span>{`${safeString}${isOverLimit ? '...': ''}`}</span>
    </Tooltip>
      
    )
  }

  const getTableRowContent = (key:string, value:any)=>{
    if(Array.isArray(value))
      return(
        <TableCell component="th" scope="row" colSpan={2}>
          <p>{key}</p>
          {displayData(value)}
        </TableCell>
      )
    return (
      <>
        <TableCell component="th" scope="row">
          {key}
        </TableCell>
        <TableCell align="right">{StringEllipsis(value)}</TableCell>
      </>
    )
  }

  const getTableBody = (data:object)=>{
    return Object.entries(data).filter(([key])=>!excludeFields.includes(key)).map(([key, value]) => {
      return (
        <TableRow
          key={key}
          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
          {getTableRowContent(key, value)}
        </TableRow>
      )
    })
  }

  const displayData = (data:any) =>{
    if(Array.isArray(data)){
      return data.map((v, i)=>(
          <Accordion key={i}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              {/* String(Object.values(v)[0]) */}
              {i} 
            </AccordionSummary>
            <AccordionDetails>
              {displayData(v)}
            </AccordionDetails>
          </Accordion>
        ))
    }
    if(typeof data === 'object'){
      return (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableBody>
              {getTableBody(data)}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    else
      return data.toString && data.toString() || data; //default
  }

  return (
    <Dialog open={!!data} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {data && displayData(data)}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
