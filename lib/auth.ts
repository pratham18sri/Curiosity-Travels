import { SignJWT,jwtVerify } from "jose";import { cookies } from "next/headers";
const secret=new TextEncoder().encode(process.env.JWT_SECRET||"development-only-change-me");
export type SessionUser={id:string;name:string;email:string;role:"admin"|"staff"|"agent"};
export async function createSession(user:SessionUser){const token=await new SignJWT(user).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret);(await cookies()).set("ct_session",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800})}
export async function clearSession(){(await cookies()).delete("ct_session")}
export async function getSession():Promise<SessionUser|null>{try{const t=(await cookies()).get("ct_session")?.value;if(!t)return null;const {payload}=await jwtVerify(t,secret);return payload as unknown as SessionUser}catch{return null}}