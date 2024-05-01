import { Grid, SxProps, Theme } from "@mui/material";
import { CustomSkin, Prisma } from "@prisma/client";
import SkinCard from "../SkinCard";
import { CustomSkinInfoPayload } from "@/types/skins";
type Props = {
  sx?: SxProps<Theme>
  skins:CustomSkinInfoPayload[] | string[]; //accepts both custom skins and game skins
  lockedSkins?:CustomSkinInfoPayload[]
  equippedSkin?:string;
  renderContext?:'admin';
}
export default function SkinGrid({sx, skins, lockedSkins, equippedSkin, renderContext}:Props){
  return (
    <Grid sx={sx} container justifyContent='center' rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {
        skins.map((skin, i)=>{
          let skinName = typeof skin === 'string' ? skin : skin.name;
          return <Grid key={i} item ><SkinCard key={i} skin={skin} equipped={skinName === equippedSkin} renderContext={renderContext} /></Grid>;
        })
      }
      {
        lockedSkins && lockedSkins.map((skin, i)=>{
          return <Grid key={i} item ><SkinCard key={i} skin={skin} isLocked /></Grid>
        })
      }
    </Grid>
  )
}