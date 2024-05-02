"use server";
import fs from 'fs';
import { database } from '../../prisma/database/database';
//@ts-expect-error
import sillyname from 'sillyname'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function reportBug(description:string){
  let console_log = fs.readFileSync('log/console.log', {encoding:'utf8'});
  let session = await getServerSession(authOptions);
  return database.bug.create({data:{
    name: sillyname(),
    description,
    console_log,
    user_id: session?.user.id || undefined
  }});
}