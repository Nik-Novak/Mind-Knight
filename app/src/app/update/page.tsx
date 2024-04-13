import LoadingOverlay from "@/components/LoadingOverlay";
import styles from "./page.module.css";
import Updater from "./Updater";
// import LoadingOverlay from "@/components/LoadingOverlay";

export default function UpdatePage() {
  
  return (
    <>
      <main id='content' className={styles.main}>
        <h2 style={{color:'white', fontSize: '44px', position:'absolute', top:'40vh'}}>Updating...</h2>
        <LoadingOverlay open={true} type="cradle" text="MindKnight is updating... Once complete a new window will launch and you can close this one." />
        <Updater />
      </main>
    </>
  );
}