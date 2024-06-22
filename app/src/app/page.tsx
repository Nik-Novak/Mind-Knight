import styles from "./page.module.css";
import Link from "next/link";
import Title from "@/components/Title";
import Version from "@/components/Version";
import { Button, Stack, Typography } from "@mui/material";
import Instructions from "@/components/Instructions";
import Footer from "@/components/Footer";
import Panel from "@/components/Panel";
import Chatbox from "@/components/Chatbox";
import { GlobalChatMessage } from "@/types/game";
import { getGlobalChat, sendGlobalMessage } from "@/actions/chat";
import { grey } from "@mui/material/colors";
import Avatar from "@/components/Avatar";
import { auth } from '@/auth';
import { authOptions } from "./api/auth/[...nextauth]/route";
import { database } from "../../prisma/database";
import { MindnightSessionStatus } from "@prisma/client";
import { verifyIsAdmin } from "@/actions/admin";
import { signIn, signOut } from "next-auth/react";
import AvatarWithActions from "@/components/AvatarWithActions";
import Leaderboards from "@/components/LeaderboardsPedestal";
import { getTop3Players } from "@/actions/leaderboard";

//React server component that securely runs on the server by default
export default async function HomePage() {
  // const globalChat: GlobalChatMessage[] = await getGlobalChat();
  // console.log('RERENDER AND REFETCH GLOBAL CHAT', globalChat[globalChat.length-1].Message);
  const session = await auth();
  const top3Players = await getTop3Players();

  return (
    <>
    <main id='content' className={styles.main}>
      <Title 
        main='Mind Knight'
        secondary={<>A companion tool for <Link href="http://www.mindnightgame.com/">Mindnight</Link></>}
        tertiary={
          <Version localPath={'../mindknight.version'} remotePath={'https://raw.githubusercontent.com/Nik-Novak/Mind-Knight/master/mindknight.version'} />
        }
      />
      {/* <Link href={'/leaderboards'}> */}
        <Leaderboards top3Players={top3Players} sessionPlayerId={session?.user.player_id} />
        {/* </Link> */}
      <Stack spacing={1}>
        <Instructions />
        <Typography variant="h3">OR</Typography>
        <Stack spacing={2} direction={'row'} justifyContent={'center'}>
          { 
            session?.user
            ? <> 
                <Link href='/skins'><Button className="pixel-corners" sx={{paddingX: '55px'}} variant="contained">Skins</Button></Link>
                <Link href='/rewinds'><Button className="pixel-corners" sx={{paddingX: '50px'}} variant="contained">Rewinds</Button></Link>
                <Link href='/clips'><Button className="pixel-corners" sx={{paddingX: '55px'}} variant="contained">Clips</Button></Link>
              </>
            : <Link href={`${process.env.NEXTAUTH_URL}/api/auth/signin`}><Button className="pixel-corners" sx={{paddingX: '50px'}} variant="contained">Sign In</Button></Link>
          }
        </Stack>
      </Stack>
      
      {/* <Panel title={"Global Chat"} containerSx={{position:'fixed', left:{ sm:undefined, md:10 }, bottom:10, maxWidth: { sm:'80%', md:'30%' }}}>
        <Chatbox chat={globalChat} sendMessage={sendGlobalMessage}/>
      </Panel> */}
    </main>
    {/* <Footer /> */}
    </>
  );
}