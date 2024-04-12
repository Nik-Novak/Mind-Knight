"use client";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BackIcon from "@mui/icons-material/KeyboardReturn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Nav(){
  const router = useRouter();
  const path = usePathname();
  const hasHistory = typeof window === 'undefined' ? false : !!window.history.length;
  
  return (
    <nav style={{position:'fixed', top:5, left: 5}}>
      {hasHistory && path!=='/' && <Button sx={{mr:'5px'}} variant="contained" className="pixel-corners-small" onClick={()=>router.back()}><BackIcon /></Button>}
      <Link href="/"><Button variant="contained" className="pixel-corners-small"><HomeIcon /></Button></Link>
    </nav>
  )
}