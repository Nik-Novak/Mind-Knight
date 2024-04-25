import { getMindnightSession } from "@/actions/mindnight-session";
import { suspense } from "@/utils/hoc/suspense";
import { Button, Typography } from "@mui/material";
import Link from "next/link";
import FindGame from "./FindGame";

async function Instructions() {
  const mnSession = await getMindnightSession();
  let instructions = 'launch mindnight to begin...';
  // if(mnSession?.authenticated_directly && mnSession?.status !== 'playing' )
  if( true )
    return <FindGame />
  if(mnSession?.status==='pending' || mnSession?.status==='authenticated')
    instructions = 'game launched, awaiting main menu';
  else if(mnSession?.status==='ready')
    instructions = 'ready for a game';
  else if(mnSession?.status === 'playing')
    return <Link href="/game" ><Button variant="contained" className="pixel-corners" sx={{paddingX: '50px'}} >Go to Game</Button></Link>
  return(
    <Typography variant="h3">{instructions}</Typography>
  );
}

export default suspense(Instructions, 'loading...')