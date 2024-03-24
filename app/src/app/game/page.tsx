import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { Stack, Typography } from "@mui/material";
import Chatlog from "@/components/ChatLog";
import { Game } from "@prisma/client";
import sampleGame from './sample-game3.json';
import ImportantInfo from "@/components/ImportantInfo";
import { NodeNumber, PlayerSlot } from "@/types/game";
import Nodes from "@/components/Nodes";
import NodeTeamRejects from "@/components/NodeTeamRejects";
import Players from "@/components/Players";
import Turns from "@/components/Turns";
import { database } from "@/utils/database/database";
import { Prisma } from "@prisma/client";

//React server component that securely runs on the server by default
export default async function GamePage() {
  const game:Game = sampleGame as unknown as Game//TODO fetch game
  const selectedNode:NodeNumber = 1;
  const selectedTurn:number = 1;
  const selectedSlot:PlayerSlot = 0;

  // console.log(game.game_found);
  // game.
  let player = await database.player.findOrCreate({Level:30, Nickname:'2JZ 4U', Slot:0, Steamid:'76561198073023481'});
  game.player_ids=[]
  game.player_ids.push(player.id); let game_found = game.game_found;
  // let uploadedGame = await database.game.create({data:{game_found:{Options:game_found.Options,  FirstPlayer:game_found.FirstPlayer, GuyRole:game_found.GuyRole, Hacker: game_found.Hacker, HackersAmount:game_found.HackersAmount, Map:game_found.Map, MatchType:game_found.MatchType, PlayerNumber:game_found.PlayerNumber, Type:game_found.Type, VoiceChat:game_found.VoiceChat, VoiceChatChannel:game_found.VoiceChatChannel, VoiceChatName:game_found.VoiceChatName, Hackers:game_found.Hackers, MissionInfo:game_found.MissionInfo, MissionMinhacks:game_found.MissionMinhacks}, updated_at:new Date()}});

  // console.log('BEFORE', game.game_start);
  let polishedGame = database.game.polish(game);
  // console.log('AFTER', polishedGame.game_start);

  // console.log('OG', Object.keys(game));
  // console.log('POLISHED', polishedGame);
  // console.log('POLISHED', Object.keys(polishedGame))
  
  let uploadedGame = await database.game.create({data:polishedGame});
  // console.log('UPLOADED', uploadedGame.id);

  return (
    <>
      <main id='content' className={styles.main}>
        <Stack className={styles.left}>
          <Panel title="Chat" > <Chatlog chat={game.chat} game_players={game.game_players} /> </Panel>
        </Stack>
        <Stack className={styles.center}>
          <ImportantInfo selectedNode={selectedNode} selectedTurn={selectedTurn} selectedSlot={selectedSlot} game_players={game.game_players} numPlayers={game.game_found.PlayerNumber}/>
          <Players selectedNode={selectedNode} selectedTurn={selectedTurn} selectedSlot={selectedSlot} game_players={game.game_players} game_end={game.game_end} />
          <Turns selectedNode={selectedNode} selectedTurn={selectedTurn} game_players={game.game_players} />
        </Stack>
        <Stack className={styles.right}>
          <Nodes selectedNode={selectedNode} missions={game.missions||undefined} game_found={game.game_found} />
          <NodeTeamRejects selectedNode={selectedNode} selectedTurn={selectedTurn} selectedSlot={selectedSlot} game_players={game.game_players}/>
        </Stack>
      </main>
    </>
  );
}