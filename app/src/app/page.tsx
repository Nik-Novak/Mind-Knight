import styles from "./page.module.css";
import Link from "next/link";
import Title from "@/components/Title";
import Version from "@/components/Version";
import { Box, Button, Stack, Typography } from "@mui/material";
import Instructions from "@/components/Instructions";
import Footer from "@/components/Footer";

//React server component that securely runs on the server by default
export default async function HomePage() {

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
          <Link href='/events'><Button className="pixel-corners" variant="contained">Events</Button></Link>
          <Link href='/replays'><Button variant="contained">Replays</Button></Link>
        </Stack>
      </Stack>
    </main>
    <Footer />
    </>
  );
}