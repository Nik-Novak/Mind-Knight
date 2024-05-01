import { Stack, Typography } from "@mui/material";

type Props = {
  totalSkins:number,
  unlockedSkins: number,
}
export default function LockedSkins({totalSkins, unlockedSkins}:Props){
  return (
    <Stack>
      <Typography>{unlockedSkins}/</Typography>
    </Stack>
  );
}