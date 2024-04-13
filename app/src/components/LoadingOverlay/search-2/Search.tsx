import Image from "next/image";
import { useTheme } from "@mui/material";
import Styles from "./search.module.css";
import SearchGif from "./img/search.gif";

export default function Search() {
  const {palette} = useTheme();
  return (
    <div className={Styles.carWrapper}>
      <Image src={SearchGif} alt="Loading"/>
    </div>
  );
}
