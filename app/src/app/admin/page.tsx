import styles from "./page.module.css";
import { Stack, Typography } from "@mui/material";
import Background from "@/components/Background";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import BadgeScanner from "./BadgeScanner";
import Title from "@/components/Title";


export default async function AdminPage() {
  let session = await getServerSession(authOptions);
  if(!session?.user.steam_id){
    redirect('/');
  }
  return (
    <>
      <Background id='content' className={styles.main}>
        <Title sx={{mt:20}} main='Admin' secondary='Welcome to the head of the NTF collective' />
          <BadgeScanner sx={{mt:5}} />
      </Background>
    </>
  );
}