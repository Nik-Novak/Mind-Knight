import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import SteamProvider, { SteamProfile } from 'next-auth-steam';
import { NextRequest } from 'next/server';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { database } from '@/utils/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { Adapter } from 'next-auth/adapters';
import { OAuthConfig } from 'next-auth/providers/oauth';

if( !process.env.NEXTAUTH_DISCORD_CLIENTID || !process.env.NEXTAUTH_DISCORD_SECRET )
    throw Error("Must provide env NEXTAUTH_DISCORD_CLIENTID and NEXTAUTH_DISCORD_SECRET");
if( !process.env.NEXTAUTH_STEAM_SECRET )
  throw Error("Must provide env NEXTAUTH_STEAM_SECRET");

export const authOptions:NextAuthOptions = {
  adapter: PrismaAdapter(database) as Adapter,
  providers: [],
  secret: process.env.NEXTAUTH_SECRET
}

async function handler(req: NextApiRequest, res: NextApiResponse){
  authOptions.providers = [
    SteamProvider(req, {
      clientSecret: process.env.NEXTAUTH_STEAM_SECRET!,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback`
    })
  ];
  return NextAuth(req, res, authOptions)
}

export {
  handler as GET,
  handler as POST
}