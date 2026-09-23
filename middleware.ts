import { NextRequest, NextResponse } from "next/server";
export function middleware(req:NextRequest){const token=req.cookies.get("ct_session")?.value;if(req.nextUrl.pathname.startsWith("/portal")&&!token){const url=new URL("/",req.url);url.searchParams.set("next",req.nextUrl.pathname);return NextResponse.redirect(url)}return NextResponse.next()}
export const config={matcher:["/portal/:path*"]};