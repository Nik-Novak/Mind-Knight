'use client';
import { Button, Stack, TextField } from "@mui/material";
import style from './form.module.css';
// import { login } from "@/actions/login";
import { redirect } from "next/navigation";
import { useRef } from "react";

export default function LoginForm(){
  const loginForm = useRef<HTMLFormElement>(null);
  return (
    <form ref={loginForm} action={async (data)=>{
      let username = data.get('username')?.toString();
      let password = data.get('password')?.toString();
      if(!username || !password) throw Error('Username or Password field was empty.');
      loginForm.current?.reset();
      // await login(username, password);
      redirect('/');
    }}>
      <Stack spacing={2}>
        <TextField name="username" placeholder="Username"/>
        <TextField type="password" name="password" placeholder="Password"/>
        <Button type="submit" variant="contained" className="pixel-corners" sx={{paddingX:'50px'}}>Login</Button>
      </Stack>
    </form>
  )
}