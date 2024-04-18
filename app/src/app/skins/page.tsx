import styles from "./page.module.css";
import { Button, Grid, Stack, Typography } from "@mui/material";
import Background from "@/components/Background";
import CustomSkinCard from "@/components/CustomSkinCard";
import { getUnlockedCustomSkins } from "@/actions/skin";
import Link from "next/link";

export default async function SkinsPage() {
  let unlockedCustomSkins = await getUnlockedCustomSkins();
  return (
    <>
      <Background id='content' className={styles.main}>
        <Stack spacing={4} alignItems='center'>
          <Typography variant="h2">Custom Skins</Typography>
          <Grid container justifyContent='center' rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {
              unlockedCustomSkins.map((cs, i)=><>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                {/* <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid>
                <Grid item ><CustomSkinCard key={i} customSkin={cs} /></Grid> */}
                </>
            )
            }
          </Grid>
          <Link href="/skins/upload"><Button variant="contained" className="pixel-corners" sx={{paddingX:5}}>Upload Skins</Button></Link>
        </Stack>
      </Background>
    </>
  );
}