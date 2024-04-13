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
  // exec('cd .. && start call ./UPDATE-WINDOWS.bat', {encoding:'utf8'});
  // console.log('Started update process...')
  await sleep(1000);
  console.log('Exiting...');
  exec('Get-Process | Where-Object { $_.ProcessName -eq "conhost" } | Stop-Process -Force', {shell: 'powershell'});
  // console.log('PPID:', process.pid);
  // console.log('PID:', process.pid);
  // console.log('trying: SIGKILL PPID');
  // process.kill(process.ppid, 'SIGKILL');
  // console.log('trying: SIGKILL PID');
  // process.kill(process.pid, 'SIGKILL');
  // console.log('trying: SIGQUIT');
  // process.kill(process.pid, 'SIGQUIT');
  // console.log('trying: SIGINT');
  // process.kill(process.pid, 'SIGINT');
  // console.log('trying: SIGHUP');
  // process.kill(process.pid, 'SIGHUP');
  // process.exit(1);
}