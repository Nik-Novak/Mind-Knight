import { getPosts } from "@/services/posts";
import Link from "next/link";

export default async function Posts(){
  let posts = await getPosts({limit: 5,  offset: 1});
  //If this was fetched from a db, etc., we can invalidate the cache with revalidateTag('posts') or revalidatePath(...) and tag the fetch accordingly
  //if someone else mutated the data, use webhooks to sync
  //what if i cant control at all? TBD

  let renderedPosts = posts.items.map(post=>(
    <div>
      <Link href={{pathname:`/posts/${post.id}`, query:{author: post.userId}}}>
        <h2>{post.title}</h2>
      </Link>
      <p>{post.body}</p>
    </div>
  ));

  return (
    <main>
      <h1>All Posts</h1>
      {...renderedPosts}
    </main>
  )
}

//https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// export const runtime = 'nodejs'
// export const dynamic = 'force-static'
// export const revalidate = 5
// export const fetchCache = 'force-cache'