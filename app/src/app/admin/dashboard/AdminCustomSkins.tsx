import CustomSkinCard from "@/components/CustomSkinCard";
import { Grid } from "@mui/material";
import { CustomSkin, Prisma } from "@prisma/client";

type Props = {
  customSkins: Prisma.CustomSkinGetPayload<{include:{owner:true}}>[]
}
export default function AdminCustomSkins({customSkins}:Props){
  return <Grid container>
    { customSkins.map(cs=>
      <Grid item><CustomSkinCard customSkin={cs} renderContext="admin" /></Grid>) 
    }
  </Grid>
}