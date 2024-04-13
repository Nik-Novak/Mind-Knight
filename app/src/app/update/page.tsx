import LoadingOverlay from "@/components/LoadingOverlay";
import styles from "./page.module.css";
import Updater from "./Updater";
// import LoadingOverlay from "@/components/LoadingOverlay";

export default function UpdatePage() {
  
  return (
    <>
      <main id='content' className={styles.main}>
        <h2 style={{color:'white', fontSize: '44px'}}>Updating...</h2>
        <Updater />
      </main>
    </>
  );
}