import SteamProvider from 'steam-next-auth'
import type { NextAuthConfig } from "next-auth"
 
export default { providers: [SteamProvider] } satisfies NextAuthConfig