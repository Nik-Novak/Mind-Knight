import { getMindnightSession } from "@/actions/mindnight";
import { suspense } from "@/utils/hoc/suspense";
import { Typography } from "@mui/material";

async function Instructions() {
  const mnSession = await getMindnightSession();
  let instructions = 'launch mindnight to begin...';
  if(mnSession?.status==='pending' || mnSession?.status==='authenticated')
    instructions = 'game launched, awaiting main menu';
  else if(mnSession?.status==='ready')
    instructions = 'ready for a game';
  return(
    <Typography variant="h3">{instructions}</Typography>
  );
}

export default suspense(Instructions, 'loading...')