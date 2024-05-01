"use server";
import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { Stack } from "@mui/material";
// import sampleGame from './sample-game3.json';
import ImportantInfo from "@/components/ImportantInfo";
import Nodes from "@/components/Nodes";
import NodeTeamRejects from "@/components/NodeTeamRejects";
import Players from "@/components/Players";
import Turns from "@/components/Turns";
import { database } from "../../../prisma/database";
import Chatbox from "@/components/Chatbox";
import Settings from "@/components/Settings";
import Playback from "@/components/Playback";
import Background from "@/components/Background";
import Controls from "@/components/Controls";
import { notFound } from "next/navigation";
import GameAssigner from "@/components/GameAssigner/GameAssigner";

//React server component that securely runs on the server by default
export default async function ClipPage({searchParams}:ServerSideComponentProp<{}, {id: string}>) {
  let clipId = searchParams.id;
  
  if(!clipId)
    return notFound();

  let clip = await database.clip.findFirst({where:{id:clipId}, include:{game:true}});
  if(!clip)
    return notFound();
  
  return (
    <>
      <GameAssigner game={database.$polish(clip.game)} time={clip.offset_start + clip.game.game_found.log_time.valueOf()} />
      <Background className={styles.main}>
        <Stack className={styles.left}>
          <Settings />
          <Panel title="Chat" defaultExpanded > <Chatbox /> </Panel>
        </Stack>
        <Stack className={styles.center}>
          <ImportantInfo />
          <Playback 
            minTimestamp={clip.game.game_found.log_time.valueOf() + clip.offset_start} 
            maxTimestamp={clip.game.game_found.log_time.valueOf() + clip.offset_end}
            loop={true}
          />
          <Players />
          <Turns />
          <Controls />
        </Stack>
        <Stack className={styles.right}>
          <Nodes />
          <NodeTeamRejects />
        </Stack>
      </Background>
    </>
  );
}