"use server";
import fs from 'fs';
import { database } from '../../prisma/database/database';
//@ts-expect-error
import sillyname from 'sillyname'

import LogEventEmitter from '@/utils/classes/LogEvents/LogEventEmitter';
import { auth } from '@/auth';

const USINGFORLOGREADINGONLY = new LogEventEmitter();
export async function reportBug(description:string){
  let console_log = fs.readFileSync('log/console.log', {encoding:'utf8'});
  let session = await auth();
  return database.bug.create({data:{
    name: sillyname(),
    description,
    console_log,
    game_log: USINGFORLOGREADINGONLY.readLog(),
    user_id: session?.user.id || undefined
  }});
}