import { Button, Stack, Typography } from "@mui/material";
import style from './page.module.css'

export default function Test(){
  return (
    <main className={style.main}>
      <Stack spacing={5}>
        <Typography variant="h1">Test</Typography>
        <Button >Increse</Button>
        <Button >Remove All</Button>
      </Stack>
    </main>
  )
}