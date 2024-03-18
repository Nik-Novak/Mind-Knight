import Image from "next/image";
import styles from "./page.module.css";
import { get } from "@/lib/fetch";
import { getRepository } from "@/services/respositories";
import Link from "next/link";
import NavBar from "@/components/NavBar/NavBar";

//React server component that securely runs on the server by default
export default async function Home() {
  let repository = await getRepository('https://api.github.com/repos/vercel/next.js');
  return (
    <main className={styles.main}>
      <div>
        <h1>Repo id: {repository.id}</h1>
        <h1>Repo name: {repository.name}</h1>
        <h1>Repo full_name: {repository.full_name}</h1>
      </div>
    </main>
  );
}

//https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// export const runtime = 'nodejs'
// export const dynamic = 'force-static'
// export const revalidate = 5
// export const fetchCache = 'force-cache'