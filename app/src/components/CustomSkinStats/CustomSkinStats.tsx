import { CustomSkinInfoPayload } from "@/types/skins";
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { CustomSkin, Prisma } from "@prisma/client";
import _ from "lodash";
import Link from "next/link";

type Props = {
  customSkin: CustomSkinInfoPayload,
  isLocked?:boolean
}
export default function CustomSkinStats({customSkin, isLocked}:Props){
  return (
    <Table>
      <TableHead>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>name</TableCell><TableCell>{isLocked ? '?????' : _.startCase(customSkin.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>owner</TableCell><TableCell>{isLocked ? '?????' : customSkin.owner.name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>stolen</TableCell><TableCell>{isLocked ? '?????' : customSkin.unlocked_games[0]?.game_found.log_time.toDateString() || 'never'}</TableCell>
        </TableRow>
        {customSkin.unlocked_games[0] && !isLocked &&
          <TableRow>
            <TableCell>stolen by</TableCell>
            <TableCell>{customSkin.unlocked_players[1]?.name}<Link href={`/rewind?id=${customSkin.unlocked_games[0].id}`} target="_blank"><Button sx={{ml: 2, fontSize:12}} className="pixel-corners-small">View Game</Button></Link></TableCell>
          </TableRow>
        }
        <TableRow>
          <TableCell>created</TableCell><TableCell>{isLocked ? '?????' : customSkin.created_at.toDateString()}</TableCell>
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