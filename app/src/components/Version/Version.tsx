import { getVersion } from "@/services/version";
import { suspense } from "@/utils/hoc/suspense";
import Link from "next/link";
import { FC, Suspense } from "react";

type Props = {
  localPath: string,
  remotePath: string,
} & JSX.IntrinsicAttributes;

const Version:FC<Props> = async ({localPath, remotePath}) =>{
  let version = await getVersion(localPath, remotePath);
  let upToDate = version.local == version.remote;
  return upToDate ? 
    <span>v{version.local} - (<Link style={{color: !upToDate ? 'red' : undefined}} href="/reinstall">REINSTALL</Link>)</span>
    : <span>v{version.local} - (<Link href="/update" style={{color:"red"}}>UPDATE</Link>)</span>
};

export default suspense(Version, 'checking version...');

//checkingContent="checking version..." 
//upToDateContent={<span>v{version.local} - (<Link to="/reinstall">reinstall</Link>)</span>} 
//outOfDateContent={<span>v{version.local} - (<Link to="/update" style={{color:"red"}}>UPDATE</Link>)</span>}