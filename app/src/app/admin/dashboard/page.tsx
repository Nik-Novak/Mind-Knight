import styles from "./page.module.css";
import { Typography } from "@mui/material";
import Background from "@/components/Background";
import { redirect } from "next/navigation";
import Title from "@/components/Title";
import { verifyIsAdmin } from "@/actions/admin";
import AdminCustomSkins from "./AdminCustomSkins";
import { getCustomSkins } from "@/actions/skins";
import SkinGrid from "@/components/SkinGrid";


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
        <SkinGrid skins={customSkins} renderContext='admin' />
      </Background>
    </>
  );
}