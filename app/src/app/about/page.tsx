import Link from "next/link";

export default function About(){
  return (<h1>Hello About Page. Go to <Link href={{pathname:'/posts', query:{test:'hi'}}}>Posts</Link></h1>)
}

//https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// export const runtime = 'nodejs'
// export const dynamic = 'force-static'
// export const revalidate = 5
// export const fetchCache = 'force-cache'