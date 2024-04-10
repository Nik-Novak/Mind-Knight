"use server";
import { getMindnightSession } from "@/actions/mindnight-session";
import styles from "./page.module.css";
import { getGames, getPlayer } from "@/actions/game";
import ReplaysGrid from "@/components/ReplaysGrid";
import { Typography } from "@mui/material";
// import sampleGame from './sample-game3.json';

export default async function ReplaysPage() {
  let mindnightSession = await getMindnightSession();
  if(!mindnightSession)
    return null;
  let player = await getPlayer(mindnightSession.steam_id);
  let myGames = await getGames(player.id);

  console.log('HEreE', myGames);
  
  return (
    <>
      <main id='content' className={styles.main}>
        <Typography variant="h2">Replays</Typography>
        <ReplaysGrid records={myGames} />
      </main>
    </>
  );
}