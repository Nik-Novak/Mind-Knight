import { getTop3Players } from "@/actions/leaderboard";
import { Box, Container, Stack } from "@mui/material";
import Player from "../Players/Player";
import SimplePlayer from "../SimplePlayer";
import { PlayerSlot } from "@/types/game";

export default async function Leaderboards(){
  const top3Players = await getTop3Players();
  return (
    <Box sx={{width:'100%'}}>
      <Container sx={{position:'relative', width:'100%', height: 400}}>
        <img style={{position:'absolute', bottom:0, left:'calc(50% - 221px)' }} src="/img/leaderboard_pedestals.png" />
        {top3Players.map((p, i)=>{
          let playerIdentity = p.latest_game?.game_end?.PlayerIdentities.find(pi=>{
            // console.log(p.player.name, pi.Steamid, p.player.steam_id, pi.Steamid === p.player.steam_id)
            return pi.Steamid === p.player.steam_id;
          });
          // console.log(p.latest_game?.game_end?.PlayerIdentities);
          if(!playerIdentity)
            throw Error("Failed to get player identity for latest game. steam_id: " + p.player.steam_id);
          let slot = playerIdentity.Slot as PlayerSlot;
          let latestGameSkin = p.latest_game?.game_players[slot]?.Skin;
          return (
            <SimplePlayer 
              key={i}
              sx={{top: i===0 ? 106 : i==1 ? 135 : 167, left:i===0 ? 'calc(50% - 25px)' : i===1 ? 'calc(50% - 140px - 25px)' : 'calc(50% + 140px - 25px)', width:51, height:193}} 
              // playerImgSx={{ width:103, height:193 }}
              playerImgSx={{ width:51, height:137 }}
              playerInfoSx={{ position:'absolute', bottom:i===0 ? -130 : i==1 ? -90 : -60 }}
              player={p.player} 
              direction={i===1 ? 'left' : 'right'}
              skin={p.player.equipped_skin || latestGameSkin || 'skin_default'}
              highlighted={i===0}
            />
          );
        })}
        
      </Container>
    </Box>
  )
}