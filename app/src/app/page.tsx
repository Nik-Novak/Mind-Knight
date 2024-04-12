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
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { database } from "../../prisma/database";
import { MindnightSessionStatus } from "@prisma/client";

//React server component that securely runs on the server by default
export default async function HomePage() {

  const globalChat: GlobalChatMessage[] = await getGlobalChat();
  // console.log('RERENDER AND REFETCH GLOBAL CHAT', globalChat[globalChat.length-1].Message);
  const steamSession = await getServerSession(authOptions);

  console.log('SS', steamSession);

  return (
    <>
    <main id='content' className={styles.main}>
      <Title 
        main='Mind Knight'
        secondary={<>A companion tool for <Link href="http://www.mindnightgame.com/">Mindnight</Link></>}
        tertiary={
          <Version localPath={'../mindknight.version'} remotePath={'https://raw.githubusercontent.com/Nik-Novak/Mind-Knight/react-ts/mindknight.version'} />
        }
      />
      <Stack spacing={1}>
        <Instructions />
        <Typography variant="h3">OR</Typography>
        <Stack spacing={2} direction={'row'} justifyContent={'center'}>
          { 
            steamSession?.user
            ? <> 
                <Link href='/events'><Button className="pixel-corners" sx={{paddingX: '50px'}} variant="contained">Events</Button></Link>
                <Link href='/rewind'><Button className="pixel-corners" sx={{paddingX: '50px'}} variant="contained">Rewind</Button></Link>
              </>
            : <Link href={`${process.env.NEXTAUTH_URL}/api/auth/signin`}><Button className="pixel-corners" sx={{paddingX: '50px'}} variant="contained">Sign In</Button></Link>
          }
        </Stack>
      </Stack>
      <Avatar sx={{bgcolor: grey[800], position: 'fixed', top:10, right:10}} />
      {/* <Panel title={"Global Chat"} containerSx={{position:'fixed', left:{ sm:undefined, md:10 }, bottom:10, maxWidth: { sm:'80%', md:'30%' }}}>
        <Chatbox chat={globalChat} sendMessage={sendGlobalMessage}/>
      </Panel> */}
    </main>
    <Footer />
    </>
  );
}