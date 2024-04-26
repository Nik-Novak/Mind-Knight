"use client";
import styles from "./page.module.css";
import { getGames } from "@/actions/game";
import GamesGrid from "@/components/GamesGrid";
import { Button, Checkbox, FormControlLabel, Stack, Tooltip, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { provideSession } from "@/utils/hoc/provideSession";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import Background from "@/components/Background";
import ClipsGrid from "@/components/ClipsGrid";
import { getClips } from "@/actions/clip";
// import sampleGame from './sample-game3.json';

function RewindPage() {
  const {data:session} = useSession();
  const {settings, updateSettings} = useSettings();
  const [paginationMetadata, setPaginationMetadata] = useState<PaginationMetadata>({current_page:0, has_next_page:false, items_per_page:50});
  const [myClipsOnly, setMyClipsOnly] = useState(true);
  const [clips, fetchClips, isFetchingClips] = useFetch(async (offset?:number, limit?:number)=>{
    if(myClipsOnly && !session) return [];
    let response = await getClips(myClipsOnly && session ? session.user.player_id : undefined, settings.josh_mode, offset, limit);
    setPaginationMetadata(response.metadata);
    return response.items;
  }, [], {});

  useEffect(()=>{
    if(session?.user.player_id)
      fetchClips(); //initial fetch
  }, [session?.user.player_id, myClipsOnly, settings.josh_mode]);
console.log(clips);
  return (
    <>
      <Background id='content' className={styles.main}>
        <Typography variant="h2">Clips</Typography>
        <Stack alignItems={'flex-start'}>
          <Tooltip title="Only show clips featuring you"><FormControlLabel control={<Checkbox defaultChecked onChange={(e, checked)=>setMyClipsOnly(checked)} />} label="Show Clips with Me Only" /></Tooltip>
          <Tooltip title="Only show clips featuring joshua.cunningham"><FormControlLabel control={<Checkbox checked={settings.josh_mode} onChange={(e, checked)=>updateSettings({josh_mode:checked})} />} label="Josh Mode" /></Tooltip>
        </Stack>
        <ClipsGrid records={clips} isFetchingRecords={isFetchingClips} fetchRecords={(model)=>fetchClips(model.page*model.pageSize, model.pageSize)} paginationMetadata={paginationMetadata} playerId={session?.user.player_id} />
        <Link href="/rewind"><Button variant="contained" className="pixel-corners" sx={{paddingX:'30px'}}>Create Clips</Button></Link>
      </Background>
    </>
  );
}

export default provideSession(RewindPage)