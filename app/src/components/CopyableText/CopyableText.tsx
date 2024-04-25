import { IconButton, TextField } from "@mui/material";
import CopyIcon from '@mui/icons-material/ContentCopy';
import CheckCopyIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useState } from "react";
import { copyToClipboard } from "@/utils/functions/general";

type Props = {
  label?:string
  value:string
}
export default function CopyableText({label="click to copy", value}:Props){
  const [copied, setCopied] = useState(false)
  const handleCopy = async ()=>{
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(()=>setCopied(false), 3000);
  }
  return (
    <TextField label={copied ? 'copied!' : label} focused color={copied ? "success" : "primary"} value={value} onClick={handleCopy} InputProps={{endAdornment:<IconButton onClick={handleCopy}>{copied ? <CheckCopyIcon color="success" /> : <CopyIcon />}</IconButton>}} />
  );
}