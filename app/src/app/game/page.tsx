import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { Stack, Typography } from "@mui/material";
import Chatlog from "@/components/ChatLog";


//React server component that securely runs on the server by default
export default async function Home() {
  return (
    <>
    <main id='content' className={styles.main}>
      <Stack className={styles.left}>
        <Panel title="Chat" > <Chatlog chat={[]} /> </Panel>
      </Stack>
      <Stack className={styles.center}><div>p</div></Stack>
      <Stack className={styles.right}>
        
      </Stack>
    </main>
    </>
  );
}