import styles from "./page.module.css";
import { Button, Grid, Stack, Typography } from "@mui/material";
import Background from "@/components/Background";
import CustomSkinCard from "@/components/CustomSkinCard";
import { getEquippedSkin, getSkins, getUnlockedCustomSkins } from "@/actions/skins";
import Link from "next/link";
import SkinCard from "@/components/SkinCard";

export default async function SkinsPage() {
  let unlockedCustomSkins = await getUnlockedCustomSkins();
  let skins = await getSkins();
  let equippedSkin = await getEquippedSkin();
  return (
    <>
      <Background id='content' className={styles.main}>
        <Stack spacing={4} alignItems='center'>
          <Typography variant="h2">Custom Skins</Typography>
          <Grid container justifyContent='center' rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {
              unlockedCustomSkins.map((cs, i)=><Grid item ><CustomSkinCard key={i} customSkin={cs} equipped={cs.name === equippedSkin} /></Grid>)
            }
          </Grid>
          <Link href="/skins/upload"><Button variant="contained" className="pixel-corners" sx={{paddingX:5}}>Upload Skins</Button></Link>
        </Stack>
        <Stack mt={10} spacing={4} alignItems='center'>
          <Typography variant="h2">Game Skins</Typography>
            <Grid container justifyContent='center' rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {
                skins.map((s, i)=><Grid item ><SkinCard key={i} skin={s} equipped={s===equippedSkin} /></Grid>)
              }
            </Grid>
        </Stack>
      </Background>
    </>
  );
}