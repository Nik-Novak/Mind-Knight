"use server";
import { getMindnightSession } from "@/actions/mindnight-session";
import styles from "./page.module.css";
import { getGames, getPlayer } from "@/actions/game";
import ReplaysGrid from "@/components/ReplaysGrid";
import { Button, Typography } from "@mui/material";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import HomeIcon from "@mui/icons-material/Home";
// import sampleGame from './sample-game3.json';

export default async function ReplaysPage() {
  let session = await getServerSession(authOptions);
  console.log('HERE REPLAYS', session);
  if(!session)
    return null;
  let player = await getPlayer(session.user.steam_id);
  let myGames = await getGames(player.id);
  
  return (
    <>
      <main id='content' className={styles.main}>
        <Typography variant="h2">Replays</Typography>
        <ReplaysGrid records={myGames} />
      </main>
    </>
  );
}