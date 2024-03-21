import { get } from "@/lib/fetch"
import fs from 'fs/promises'

type Version = {
  local: string,
  remote: string
}
export async function getVersion(localPath:string, remotePath:string):Promise<Version>{
  "use server"; //server action
  let local = (await fs.readFile(localPath)).toString();
  let response = await get(remotePath);
  return { local, remote: response.data };
}