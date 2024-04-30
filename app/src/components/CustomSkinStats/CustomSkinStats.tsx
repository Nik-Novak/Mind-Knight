import { CustomSkinInfoPayload } from "@/types/skins";
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { CustomSkin, Prisma } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  customSkin: CustomSkinInfoPayload
}
export default function CustomSkinStats({customSkin}:Props){
  const router = useRouter();
  return (
    <Table>
      <TableHead>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>name</TableCell><TableCell>{customSkin.name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>owner</TableCell><TableCell>{customSkin.owner.name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>stolen</TableCell><TableCell>{customSkin.unlocked_games[0]?.game_found.log_time.toDateString() || 'never'}</TableCell>
        </TableRow>
        {customSkin.unlocked_games[0] && 
          <TableRow>
            <TableCell>stolen by</TableCell>
            <TableCell>{customSkin.unlocked_players[1]?.name}<Link href={`/rewind?id=${customSkin.unlocked_games[0].id}`} target="_blank"><Button sx={{ml: 2, fontSize:12}} className="pixel-corners-small">View Game</Button></Link></TableCell>
          </TableRow>
        }
        <TableRow>
          <TableCell>created</TableCell><TableCell>{customSkin.created_at.toDateString()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
/*
<Typography>name: {skinSrc?.name}</Typography>
                <Typography>owner: {skinSrc?.custom_skin?.owner.name}</Typography>
                <Typography>stolen: {skinSrc?.custom_skin?.unlocked_games[0]?.game_found.log_time.toDateString() || 'never'}</Typography>
                <Typography>created: {skinSrc?.custom_skin?.created_at.toDateString()}</Typography>
*/