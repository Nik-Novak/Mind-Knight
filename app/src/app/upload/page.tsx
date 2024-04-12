"use client";
import styles from "./page.module.css";
import { Typography } from "@mui/material";
import GameUploader from "./GameUploader";

export default function UploadPage() {
  
  return (
    <>
      <main id='content' className={styles.main}>
        <Typography variant="h2">Game Uploader</Typography>
        <Typography>This page should only be used if you forgot to run the client for a game. If this client was running while you were playing, your games were already saved.</Typography>
        <Typography>You can only upload games from your last 2 play sessions (the last two times you booted Mindnight). All others are lost indefinitely.</Typography>
        <GameUploader />
      </main>
    </>
  );
}