import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import SteamProvider from 'next-auth-steam';
import { NextRequest } from 'next/server';

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  if( !process.env.NEXTAUTH_DISCORD_CLIENTID || !process.env.NEXTAUTH_DISCORD_SECRET )
    throw Error("Must provide env NEXTAUTH_DISCORD_CLIENTID and NEXTAUTH_DISCORD_SECRET");
  if( !process.env.NEXTAUTH_STEAM_SECRET )
    throw Error("Must provide env NEXTAUTH_STEAM_SECRET");

  return NextAuth(req, ctx, {
    providers: [
      SteamProvider(req, {
        clientSecret: process.env.NEXTAUTH_STEAM_SECRET,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback`
      }),
      // DiscordProvider({
      //   clientId: process.env.NEXTAUTH_DISCORD_CLIENTID, 
      //   clientSecret: process.env.NEXTAUTH_DISCORD_SECRET
      // }),
    ]
  })
}

export {
  handler as GET,
  handler as POST
}

// async function handler(req:NextRequest, ctx: { params: { nextauth:string[] } }) {

//   if( !process.env.NEXTAUTH_DISCORD_CLIENTID || !process.env.NEXTAUTH_DISCORD_SECRET )
//     throw Error("Must provide env NEXTAUTH_DISCORD_CLIENTID and NEXTAUTH_DISCORD_SECRET");
//   if( !process.env.NEXTAUTH_STEAM_SECRET )
//     throw Error("Must provide env NEXTAUTH_STEAM_SECRET");

//   return NextAuth({
//     providers: [
//       DiscordProvider({
//         clientId: process.env.NEXTAUTH_DISCORD_CLIENTID, 
//         clientSecret: process.env.NEXTAUTH_DISCORD_SECRET
//       }),
//       // SteamProvider(req, {
//       //   clientSecret: process.env.NEXTAUTH_STEAM_SECRET,
//       //   callbackUrl: 'http://localhost:3000/api/auth/callback'
//       // })
//     ],
//     secret: process.env.NEXTAUTH_SECRET
//   })
// }

// export {handler as GET, handler as POST};