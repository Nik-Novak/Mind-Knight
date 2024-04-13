import LoadingOverlay from "@/components/LoadingOverlay";
import styles from "./page.module.css";
import Updater from "./Updater";
import { Typography } from "@mui/material";
// import LoadingOverlay from "@/components/LoadingOverlay";

export default function UpdatePage() {
  
  return (
    <>
      <main id='content' className={styles.main}>
        <Typography variant="h2" style={{color:'white'}}>Confirm</Typography>
        <Updater />
      </main>
    </>
  );
}