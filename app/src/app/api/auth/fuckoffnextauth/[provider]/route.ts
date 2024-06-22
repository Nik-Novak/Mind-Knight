import { get } from "@/lib/fetch";
import { NextRequest, NextResponse,  } from "next/server";

export type RouteURL = '/api/auth/fuckoffnextauth/[provider]';

export async function GET(req: NextRequest, { params }:NextApiParams<RouteURL>):Promise<Response>{
  const provider = params.provider;
  const {searchParams} = new URL(req.url);
  searchParams.set('code', '123'); //inject a fake code to make nextauth v5 happy
  return Response.redirect(`${process.env.NEXTAUTH_URL}/api/auth/callback/${provider}?${searchParams.toString()}`); //this should be your normal nextauth callback url
}

export async function POST(req: NextRequest):Promise<Response>{
  return Response.json({token: '123'}); //fake token endpoint
}

// type Data = ReturnType<typeof GET> extends NextResponse<infer T> ? T : never; //AUTO INFER RETURN TYPE!!!