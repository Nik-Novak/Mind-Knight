"use client";
import { verifyIsAdmin } from "@/actions/admin";
import FormButton from "@/components/FormButton";
import { Stack, SxProps, Theme, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ScanIcon from '@mui/icons-material/QrCodeScanner';

type Props = {
  sx?: SxProps<Theme>
}
export default function BadgeScanner({sx}:Props){
  const [text, setText] = useState("Please scan your NTF Admin badge");
  const router = useRouter();
  return(
    <Stack sx={sx} spacing={3} alignItems='center'>
      <Typography variant="h3">{text}</Typography>
      <form action={async (data)=>{
        let authorized = await verifyIsAdmin();
        if(authorized){
          setText("Access Granted. Welcome back officer.");
          setTimeout(()=>router.push('/admin/dashboard'), 3000);
        }
        else {
          setText("Access denied. Security will escort you out.");
          setTimeout(()=>router.replace('/'), 3000);
        }
      }}>
        <FormButton variant="contained" className="pixel-corners" sx={{paddingX: '40px'}}><ScanIcon sx={{mr:1}} />Scan</FormButton>
      </form>
    </Stack>
  )
}