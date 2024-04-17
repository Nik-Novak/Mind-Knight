"use client";
import styles from "./page.module.css";
import { getGames } from "@/actions/game";
import GamesGrid from "@/components/GamesGrid";
import { Button, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { provideSession } from "@/utils/hoc/provideSession";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
// import sampleGame from './sample-game3.json';

function RewindPage() {
  const {data:session} = useSession();
  const {settings, updateSettings} = useSettings();
  const [paginationMetadata, setPaginationMetadata] = useState<PaginationMetadata>({current_page:0, has_next_page:false, items_per_page:50});
  const [myGamesOnly, setMyGamesOnly] = useState(true);
  const [games, fetchGames, isFetchingGames] = useFetch(async (offset?:number, limit?:number)=>{
    if(myGamesOnly && !session) return [];
    let response = await getGames(myGamesOnly && session ? session.user.player_id : undefined, settings.josh_mode, offset, limit);
    setPaginationMetadata(response.metadata);
    return response.items;
  }, [], {});

  useEffect(()=>{
    if(session?.user.player_id)
      fetchGames(); //initial fetch
  }, [session?.user.player_id, myGamesOnly, settings.josh_mode]);

  return (
    <>
      <main id='content' className={styles.main}>
        <Typography variant="h2">Rewind</Typography>
        <Stack alignItems={'flex-start'}>
          <FormControlLabel control={<Checkbox defaultChecked onChange={(e, checked)=>setMyGamesOnly(checked)} />} label="Show My Games Only" />
          <FormControlLabel control={<Checkbox checked={settings.josh_mode} onChange={(e, checked)=>updateSettings({josh_mode:checked})} />} label="Josh Mode" />
        </Stack>
        <GamesGrid records={games} isFetchingRecords={isFetchingGames} fetchRecords={(model)=>fetchGames(model.page*model.pageSize, model.pageSize)} paginationMetadata={paginationMetadata} />
        <Link href="/upload"><Button variant="contained" className="pixel-corners"> Upload Games</Button></Link>
      </main>
    </>
  );
}

export default provideSession(RewindPage)