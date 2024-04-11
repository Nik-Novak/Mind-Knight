import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

export default function Nav(){
  return (
    <nav style={{position:'fixed', top:5, left: 5}}>
      <Link href="/"><Button variant="contained" className="pixel-corners-small"><HomeIcon /></Button></Link>
    </nav>
  )
}