import { NumberOfPlayers } from '@/types/game';
import { styleMap } from './Player';
import style from './players.module.css';
import { Skeleton } from '@mui/material';

type Props = {
  slot: number,
  numPlayers: NumberOfPlayers,
}

export default function PlayerSkeleton({ slot, numPlayers }:Props){
  const positionalStyle = styleMap[numPlayers];
  return (
    <div className={`${style.playerContainer} ${positionalStyle.playerContainer} `} data-index={slot}>
      <div style={{position:'relative'}}>
        <Skeleton variant='rectangular' animation="pulse" sx={{  position:'absolute', width:'201px', height:'75px', transform:'rotate(90deg) translateY(-100%)', transformOrigin:'top left'}} />
        <img style={{position:'absolute'}} src={'/img/skin-default-shadow.png'} alt="" />
        {/* <img style={{position:'absolute'}} src={'/img/skin-default.png'} alt="" /> */}
      </div>
    </div>
  )
}