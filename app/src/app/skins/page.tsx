import styles from "./page.module.css";
import { Button, Grid, Stack, Typography } from "@mui/material";
import Background from "@/components/Background";
import CustomSkinCard from "@/components/CustomSkinCard";
import { getEquippedSkin, getSkins, getUnlockedCustomSkins } from "@/actions/skins";
import Link from "next/link";
import SkinCard from "@/components/SkinCard";
import SkinGrid from "@/components/SkinGrid";

export default async function SkinsPage() {
  let unlockedCustomSkins = await getUnlockedCustomSkins();
  let skins = await getSkins();
  let equippedSkin = await getEquippedSkin();
  return (
    <>
      <Background id='content' className={styles.main}>
        <Stack spacing={4} alignItems='center'>
          <Typography variant="h2">Custom Skins</Typography>
          <SkinGrid skins={unlockedCustomSkins} equippedSkin={equippedSkin} />
          <Link href="/skins/upload"><Button variant="contained" className="pixel-corners" sx={{paddingX:5}}>Upload Skins</Button></Link>
        </Stack>
        <Stack mt={10} spacing={4} alignItems='center'>
          <Typography variant="h2">Game Skins</Typography>
          <SkinGrid skins={skins} equippedSkin={equippedSkin} />
        </Stack>
      </Background>
    </>
  );
}