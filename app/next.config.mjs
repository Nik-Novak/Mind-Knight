import "dotenv/config";
import open from 'open';

console.log('COMPATIBILITY_MODE:', !!process.env.COMPATIBILITY_MODE);

if(process.env.START_BROWSER === 'true' && !process.env.BUILD && process.env.NEXTAUTH_URL)
  open(process.env.NEXTAUTH_URL)
  
// import {verifyPatch} from 'next-ws/server/index.js'
// verifyPatch();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // compiler:{
  //   styledComponents: true,
  //   emotion:true
  // },
  experimental:{
    instrumentationHook: true
  },
  eslint:{
    ignoreDuringBuilds:true
  },
  typescript:{
    ignoreBuildErrors: true
  },
  logging:{
    fetches:{
      fullUrl: true
    }
  }
};

export default nextConfig;
