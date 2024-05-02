"use client";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BackIcon from "@mui/icons-material/KeyboardReturn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AvatarWithActions from "../AvatarWithActions";

type Props = {
  isAdmin: boolean
}

export default function Nav({isAdmin}:Props){
  const router = useRouter();
  const path = usePathname();
  const hasHistory = typeof window === 'undefined' ? false : !!window.history.length;
  
  return (
    <nav style={{width:'100%', position:'fixed', paddingTop:10, paddingLeft:10, paddingRight:10, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div>
        <Button sx={{mr:'5px', display:hasHistory && path!=='/'?'inline-flex':'none'}} variant="contained" className="pixel-corners-small" onClick={()=>router.back()}><BackIcon /></Button>
        <Link href="/"><Button variant="contained" className="pixel-corners-small"><HomeIcon /></Button></Link>
      </div>
      <AvatarWithActions isAdmin={isAdmin} />
    </nav>
  )
}