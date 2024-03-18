import { get } from "@/lib/fetch";

type Repository = {
  id: number;
  name: string;
  full_name: string;
}

export async function getRepository(url:string){
  let response = await get('https://api.github.com/repos/vercel/next.js');
  return response.data as Repository;
}