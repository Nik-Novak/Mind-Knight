import { Grid, SxProps, Theme } from "@mui/material";
import { CustomSkin, Prisma } from "@prisma/client";
import CustomSkinCard from "../CustomSkinCard";
import SkinCard from "../SkinCard";
type Props = {
  sx?: SxProps<Theme>
  skins:Prisma.CustomSkinGetPayload<{include:{owner:true}}>[] | string[];
  equippedSkin?:string;
  renderContext?:'admin';
}
export default function SkinGrid({sx, skins, equippedSkin, renderContext}:Props){
  return (
    <Grid sx={sx} container justifyContent='center' rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {
        skins.map((skin, i)=>{
          if(typeof skin === 'string') //regular game skin
            return <Grid key={i} item ><SkinCard key={i} skin={skin} equipped={skin === equippedSkin} /></Grid>;
          else //custom skin
            return <Grid key={i} item ><CustomSkinCard key={i} customSkin={skin} equipped={skin.name === equippedSkin} renderContext={renderContext} /></Grid>;
      })
      }
    </Grid>
  )
}