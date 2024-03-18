import { getPost } from "@/services/posts";
import { Metadata } from "next";

type PageParams = ServerSideComponentProp<{ id:number }, { author:number }>;

// static export const metadata = { .. } won't get dynamic values. Use this instead:
export async function generateMetadata({ params }: PageParams) {
  let {data:post} = await getPost(params.id); //same function call here (1) so in the definition we use cache() from 'react' to memoize to only 1 call
  return {
    title:`Post ${params.id}: ${post.title}`
  } as Metadata;
}

export default async function Post({params, searchParams}: PageParams ) {
  let {data:post} = await getPost(params.id); //same function call here (2) so in the definition we use cache() from 'react' to memoize to only 1 call
  return (
    <main>
      <article>
        <h1>Title: {post.title}</h1>
        <h2>post #: {params.id}</h2>
        <h2>author: {searchParams.author}</h2>
        <p>{post.body}</p>
        <p>{post.body}</p>
        <p>{post.body}</p>
      </article>
    </main>
  );
}