"use client";
import styles from "./page.module.css";
import { getGames } from "@/actions/game";
import GamesGrid from "@/components/GamesGrid";
import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import useFetch from "@/hooks/useFetch";
import { provideSession } from "@/utils/hoc/provideSession";
import Link from "next/link";
// import sampleGame from './sample-game3.json';

function RewindPage() {
  const {data:session} = useSession();
  // const [myGamesOnly, setMyGamesOnly] = useState(true);
  // let session = await getServerSession(authOptions);
  const [games, fetchGames, isFetchingGames] = useFetch(async (myGamesOnly:boolean)=>{
    if(myGamesOnly){
      if(session)
        return getGames(session.user.player_id);
      else return [];
    }
    else 
      return getGames();
  }, [], {});

  useEffect(()=>{
    if(session?.user.player_id)
      fetchGames(true); //initial fetch
  }, [session?.user.player_id]);
  
  return (
    <>
      <main id='content' className={styles.main}>
        <Typography variant="h2">Rewind</Typography>
        <FormControlLabel control={<Checkbox defaultChecked onChange={(e, checked)=>fetchGames(checked)} />} label="Show My Games Only" />
        <GamesGrid records={games} isFetchingRecords={isFetchingGames} />
        <Link href="/upload"><Button variant="contained" className="pixel-corners"> Upload Games</Button></Link>
      </main>
    </>
  );
}

export default provideSession(RewindPage)