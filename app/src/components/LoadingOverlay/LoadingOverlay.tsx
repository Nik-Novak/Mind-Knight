"use client";
import { CircularProgress, Typography, Backdrop, useTheme } from "@mui/material";
import Styles from "./LoadingOverlay.module.css";
import Car from "./car";
import Cradle from "./cradle";
import Search from "./search";
import Search2 from "./search-2";

type LoadingOverlayProps = {
  open: boolean;
  type?: "car" | "cradle" | "circular" | "search" | "search2";
  text?: string;
  opaque?: boolean;
  transitions?: {
    appear?: number;
    enter?: number;
    exit?: number;
  };
};

//Dynamic color: https://chat.openai.com/chat/9a4b2048-e95d-456b-9e0b-17b9c323dc30

export default function LoadingOverlay({
  open,
  type = "circular",
  text = "",
  opaque = false,
  transitions = { enter: 0, exit: 500 },
}: LoadingOverlayProps) {
  const { primary, mode } = useTheme().palette;
  const primaryColor = mode === "dark" ? primary.dark : primary.light;

  return (
    <Backdrop
      className={Styles.backdrop}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: opaque ? '#444' : undefined,
      }}
      open={open}
      timeout={transitions}
    >
      <div className={Styles.content}>
        {type === "car" && <Car />}
        {type === "cradle" && <Cradle sx={{ "--uib-color": primaryColor }} />}
        {type === "circular" && <CircularProgress style={{ color: primaryColor }} />}
        {type === "search" && <Search />}
        {type === "search2" && <Search2 />}
        {text.split('\n').map((line, i)=><Typography key={i} className={Styles.text}>{text}</Typography>)}
      </div>
    </Backdrop>
  );
}
