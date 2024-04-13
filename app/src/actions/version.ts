"use server";
import { get } from "@/lib/fetch"
import { sleep } from "@/utils/functions/general";
import { exec, execSync } from "child_process";
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
  
  // Get the PIDs of the conhost processes
  console.log('Getting writelocks');
  let PIDs = execSync('cd ..; ./GetWritelockPIDs.bat', { encoding: 'utf8', shell: 'powershell' }).trim().split('\n');
  console.log('Starting update process...')
  exec('cd .. && start call ./UPDATE-WINDOWS.bat', {encoding:'utf8'});
  console.log('Started update process...')
  await sleep(1000);
  console.log('Exiting...');
  exec(`Stop-Process -Id ${PIDs.join(',')} -Force`, { shell: 'powershell' });
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