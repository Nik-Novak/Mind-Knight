import Link from "next/link";
import Image from "next/image";
import style from './navbar.module.css';
import { cookies, headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export default async function NavBar(){
  let randomPostId = Math.floor(Math.random()*100+1); //this will statically compute once (ONLY IN BUILDS)
  //EXCEPT if we opt out of cache and in to dynamic rendering with: cookies() | headers() | noStore()
  // cookies(); //because we're reading from the request
  // headers(); //because we're reading from the request 

  return (
    <nav className={style.nav} >
      <Image alt="logo" src={'/img/logo.png'} width={50} height={50} />
      <ul className={style.menu}>
        <li className={style.menuItem}><Link href="/">Home</Link></li>
        <li className={style.menuItem}><Link href="/about">About</Link></li>
        <li className={style.menuItem}><Link href="/posts">Posts</Link></li>
        <li className={style.menuItem}><Link href={`/posts/${randomPostId}`}>Random Post</Link></li>
      </ul>
      <p> showcase disabling SSR (BUILT ONLY): {Date.now()}</p>
    </nav>
  )
}

//https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// export const runtime = 'nodejs'
// export const dynamic = 'force-static'
// export const revalidate = 5
// export const fetchCache = 'force-cache'