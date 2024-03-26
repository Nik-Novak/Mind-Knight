import LoginForm from "@/components/LoginForm/LoginForm";
import { Stack, Typography } from "@mui/material";
import style from './page.module.css'

export default function Login(){
  return (
    <main className={style.main}>
      <Stack spacing={5}>
        <Typography variant="h1">Login</Typography>
        <LoginForm />
      </Stack>
    </main>
  )
}