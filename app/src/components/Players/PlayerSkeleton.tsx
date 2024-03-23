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
      <div style={{position:'relative'}} className={style.playerImg}>
        <Skeleton variant='rectangular' animation="wave" sx={{  position:'absolute', width:'calc(4vh * 2.68 )', height:'3.8vh', transform:'rotate(90deg) translateY(-191%)', transformOrigin:'top left'}} />
        <img style={{position:'absolute'}} src={'/img/skin-default-shadow.png'} alt="" />
        {/* <img style={{position:'absolute'}} src={'/img/skin-default.png'} alt="" /> */}
      </div>
    </div>
  )
}