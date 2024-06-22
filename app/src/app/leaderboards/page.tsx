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
import LeaderboardsGrid from "@/components/LeaderboardsGrid";
import { getLeaderboards } from "@/actions/leaderboard";
// import sampleGame from './sample-game3.json';

export default function LeaderboardsPage() {
  const {data:session} = useSession();
  const {settings, updateSettings} = useSettings();
  const [paginationMetadata, setPaginationMetadata] = useState<PaginationMetadata>({current_page:0, has_next_page:false, items_per_page:50});
  const [showMyPlacement, setShowMyPlacement] = useState(true);
  const [leaderboards, fetchLeaderboards, isFetchingLeaderboards] = useFetch(async (offset?:number, limit?:number)=>{
    if(showMyPlacement && !session) return [];
    let response = await getLeaderboards(showMyPlacement && session ? session.user.player_id : undefined, settings.josh_mode, offset, limit);
    setPaginationMetadata(response.metadata);
    return response.items;
  }, [], {});

  useEffect(()=>{
    if(session?.user.player_id)
      fetchLeaderboards(); //initial fetch
  }, [session?.user.player_id, showMyPlacement, settings.josh_mode]);

  return (
    <>
      <Background id='content' className={styles.main}>
        <Typography variant="h2">Rewind</Typography>
        <Stack alignItems={'flex-start'}>
          <Tooltip title="Only show games that you played"><FormControlLabel control={<Checkbox defaultChecked onChange={(e, checked)=>setShowMyPlacement(checked)} />} label="Show My Placement" /></Tooltip>
          <Tooltip title="Only show games that joshua.cunningham played"><FormControlLabel control={<Checkbox checked={settings.josh_mode} onChange={(e, checked)=>updateSettings({josh_mode:checked})} />} label="Josh Mode" /></Tooltip>
        </Stack>
        <LeaderboardsGrid records={leaderboards} isFetchingRecords={isFetchingLeaderboards} fetchRecords={(model)=>fetchLeaderboards(model.page*model.pageSize, model.pageSize)} paginationMetadata={paginationMetadata} playerId={session?.user.player_id} />
        <Link href="/upload"><Button variant="contained" className="pixel-corners"> Upload Games</Button></Link>
      </Background>
    </>
  );
}