import { NodeNumber } from "@/types/game";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { GameFound, Missions } from "@prisma/client";

type NodeProps = {
  hacked:boolean|undefined,
  numPlayers: number,
  selected?: boolean,
}
function Node({ numPlayers, hacked, selected}:NodeProps){
  let bgColor = '#696969' //default
  let hoverColor = '#595959' //default
  if(hacked===true){
    bgColor = '#952C30';
    hoverColor = '#851C20';
  }
  else if(hacked === false){
    bgColor = '#25A165';
    hoverColor = '#159155';
  }
  return <IconButton sx={{ border:selected?'2px solid white':undefined, width:'15vh', height:'15vh', maxWidth:100, maxHeight:100, bgcolor:bgColor, '&:hover': {
    bgcolor: hoverColor, // Keep the background red on hover
  }}}>
    <Typography sx={{fontWeight:'bold'}}>{numPlayers}</Typography>
  </IconButton>
}

type Props = {
  game_found: GameFound,
  missions: Missions,
  selectedNode: NodeNumber,
}

export default function Nodes({missions, selectedNode, game_found}:Props){
  return (
    <Stack m={'10%'} height={'80vh'} maxHeight={'637px'} justifyContent={'space-between'}>
      {
        game_found.MissionInfo.map((numPlayers, i)=>{
          let n = i+1 as NodeNumber;
          let hacked = missions[n]?.mission_phase_end.Failed
          return <Node key={n} hacked={hacked} numPlayers={numPlayers} selected={selectedNode === i+1} />
        })
      }
    </Stack>
    // <div className={`round-button ${selected?'selected':''}`} index={index} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    //   <div className="round-button-circle" status={status}>
    //     <a className="round-button">{size}</a>
    //   </div>
    // </div>
  )
}