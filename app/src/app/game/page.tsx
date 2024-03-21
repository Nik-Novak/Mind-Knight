import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { Stack, Typography } from "@mui/material";
import Chatlog from "@/components/ChatLog";
import { Game } from "@prisma/client";
import sampleGame from './sample-game2.json';
import ImportantInfo from "@/components/ImportantInfo";
import { NodeNumber, PlayerSlot } from "@/types/game";

//React server component that securely runs on the server by default
export default async function GamePage() {
  const game:Game = sampleGame as unknown as Game//TODO fetch game
  const selectedNode:NodeNumber = 1;
  const selectedTurn:number = 1;
  const selectedSlot:PlayerSlot = 1;
  console.log(game.players)
  return (
    <>
    <main id='content' className={styles.main}>
      <Stack className={styles.left}>
        <Panel title="Chat" > <Chatlog chat={game.chat} game_players={game.players} /> </Panel>
      </Stack>
      <Stack className={styles.center}>
        <ImportantInfo selectedNode={selectedNode} selectedTurn={selectedTurn} selectedSlot={selectedSlot} game_players={game.players} numPlayers={game.game_found.PlayerNumber}/>
      </Stack>
      <Stack className={styles.right}>
        
      </Stack>
    </main>
    </>
  );
}