"use server";
import { sleep } from "@/utils/functions/general";
import { exec, execSync } from "child_process";

export default async function Updater(){
  sleep(3000).then(()=>{
    console.log(execSync('cd .. && ./UPDATE-WINDOWS.bat', {encoding:'utf8'}));
    process.exit(0);
  });
  return null;
}