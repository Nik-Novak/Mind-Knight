"use server";
import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { Stack, Typography } from "@mui/material";
import { Game } from "@prisma/client";
// import sampleGame from './sample-game3.json';
import ImportantInfo from "@/components/ImportantInfo";
import { NodeNumber, NumberOfPlayers, PlayerSlot } from "@/types/game";
import Nodes from "@/components/Nodes";
import NodeTeamRejects from "@/components/NodeTeamRejects";
import Players from "@/components/Players";
import Turns from "@/components/Turns";
import { database } from "../../../prisma/database";
import { Prisma } from "@prisma/client";
import Chatbox from "@/components/Chatbox";
import Settings from "@/components/Settings";
import { redirect } from "next/navigation";
import { getDbPlayer, updateGameOnServer } from "@/actions/game";

//React server component that securely runs on the server by default
export default async function GamePage({searchParams}:ServerSideComponentProp<{}, {id: string}>) {
  let gameId = searchParams.id;
  
  if(gameId){
    let game = await database.game.findById(gameId);
    if(game){
      await updateGameOnServer(game);
    }
  }

  return (
    <>
      <main id='content' className={styles.main}>
        <Stack className={styles.left}>
          <Settings />
          <Panel title="Chat" defaultExpanded > <Chatbox /> </Panel>
        </Stack>
        <Stack className={styles.center}>
          <ImportantInfo />
          <Players />
          <Turns />
        </Stack>
        <Stack className={styles.right}>
          <Nodes />
          <NodeTeamRejects />
        </Stack>
      </main>
    </>
  );
}