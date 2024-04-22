import styles from "./page.module.css";
import { Typography } from "@mui/material";
import Background from "@/components/Background";
import { redirect } from "next/navigation";
import Title from "@/components/Title";
import { verifyIsAdmin } from "@/actions/admin";
import { getCustomSkins } from "@/actions/skins";
import SkinGrid from "@/components/SkinGrid";
import GameSimulator from "./GameSimulator";


export default async function AdminDashboardPage() {
  if(!verifyIsAdmin()){
    redirect('/');
  }
  const customSkins = await getCustomSkins();

  return (
    <>
      <Background id='content' className={styles.main}>
        <Title sx={{mt:20}} main='Admin Dashboard' secondary='Welcome to the command center' />
        <Typography sx={{mt:20}} variant="h2">Skins</Typography>
        <SkinGrid sx={{mt:1}} skins={customSkins} renderContext='admin' />
        <Typography sx={{mt:20}} variant="h2">Game Simulator</Typography>
        <GameSimulator sx={{mt:2}} />
      </Background>
    </>
  );
}