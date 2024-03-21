import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { Stack, Typography } from "@mui/material";
import Chatlog from "@/components/ChatLog";
import { Game } from "@prisma/client";
import sampleGame from './sample-game2.json';

//React server component that securely runs on the server by default
export default async function GamePage() {
  let game:Game = sampleGame as unknown as Game//TODO fetch game
  
  return (
    <>
    <main id='content' className={styles.main}>
      <Stack className={styles.left}>
        <Panel title="Chat" > <Chatlog chat={game.chat} game_players={game.players} /> </Panel>
      </Stack>
      <Stack className={styles.center}><div>p</div></Stack>
      <Stack className={styles.right}>
        
      </Stack>
    </main>
    </>
  );
}