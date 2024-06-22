import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
// import SteamProvider, { PROVIDER_ID, SteamProfile } from 'next-auth-steam';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { database } from '@/database';
import { Adapter } from 'next-auth/adapters';
// import SteamProvider from '@/components/SteamNextAuth';
import SteamProvider from 'steam-next-auth'
 
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string;
      image?: string;
      name?: string;
      player_id: string;
      steam_id: string;
    }
    // Add other extra fields as needed
  }
}

if( !process.env.NEXTAUTH_DISCORD_CLIENTID || !process.env.NEXTAUTH_DISCORD_SECRET )
    throw Error("Must provide env NEXTAUTH_DISCORD_CLIENTID and NEXTAUTH_DISCORD_SECRET");
if( !process.env.NEXTAUTH_STEAM_SECRET )
  throw Error("Must provide env NEXTAUTH_STEAM_SECRET");

// export const nextauthConfig:NextAuthConfig = 

export const { auth, handlers, signIn, signOut } = NextAuth(req=>({
  adapter: PrismaAdapter(database) as Adapter,
  debug:true,
  providers: [
    SteamProvider(req!, {
      clientSecret: process.env.NEXTAUTH_STEAM_SECRET!,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/fuckoffnextauth`
    })
    // SteamProvider(req!, {
    //   clientSecret: process.env.NEXTAUTH_STEAM_SECRET!,
    //   callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback`
    // })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks:{
    async session({session, user }){
      let matchingAccount = await database.account.findFirstOrThrow({ //get account for steamId
        where:{
          userId: user.id
        }
      });
      let player = await database.player.createOrFind({ //create or find existing player
          data:{
            name: user.name || '',
            steam_id: matchingAccount.steamId,
            user_id: user.id
          },
        },
        {
          where:{
            steam_id: matchingAccount.steamId,
            user_id: user.id
          }
        }
      );
      session.user.id = user.id;
      session.user.player_id = player.id; //add player_id to session
      session.user.steam_id = player.steam_id; //add steam_id to session
      return session;
    }
  }
}));

// async function handler(req: NextApiRequest, res: NextApiResponse){
//   authOptions.providers = [
//     SteamProvider(req, {
//       clientSecret: process.env.NEXTAUTH_STEAM_SECRET!,
//       callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback`
//     })
//   ];
//   return NextAuth(req, res, authOptions)
// }

// export {
//   handler as GET,
//   handler as POST
// }