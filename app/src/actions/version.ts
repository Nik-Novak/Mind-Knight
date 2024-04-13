"use server";
import { get } from "@/lib/fetch"
import { sleep } from "@/utils/functions/general";
import { exec } from "child_process";
import fs from 'fs/promises'

type Version = {
  local: string,
  remote: string
}
export async function getVersion(localPath:string, remotePath:string):Promise<Version>{
  // "use server"; //server action
  let local = (await fs.readFile(localPath)).toString();
  let response = await get(remotePath);
  return { local, remote: response.data };
}

export async function updateVersion(){
  console.log('Starting update process...')
  exec('cd .. && start ./UPDATE-WINDOWS.bat', {encoding:'utf8'});
  console.log('Started update process...')
  await sleep(1000);
  console.log('Exiting...');
  process.exit(0);
}