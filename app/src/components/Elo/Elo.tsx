import { coloredText } from "@/utils/functions/jsx";
import { Typography } from "@mui/material";

type Props = {
  elo?: number;
  eloIncrement?: number;
}
export default function Elo({elo, eloIncrement}:Props){
  if(elo && eloIncrement){
    let eloIncrementColor = eloIncrement > 0 ? '#25A165' : eloIncrement < 0 ? '#952C30' : '#FFFFFF';
    let eloText = coloredText(Math.round(elo + eloIncrement).toFixed(0), '#AD8432');
    let eloIncrementText = coloredText((eloIncrement > 0 ? '+':'')+Math.round(eloIncrement).toFixed(0), eloIncrementColor);
    return <Typography className="player-elo">{eloText} {eloIncrementText}</Typography>
  }
  else if(elo){
    let eloText = coloredText(Math.round(elo).toFixed(0), '#AD8432');
    return <Typography className="player-elo">{eloText}</Typography>
  }
}