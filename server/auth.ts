import { createHash, randomBytes } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { Account, Session } from "./db";
import type { User } from "../lib/model";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export const userData = (r: any): User => ({
  ...r.data,
  id: r.id,
  login: r.login,
  role: r.role,
  active: r.active,
});
export const safeUser = (u: User) => {
  const { markup, ...safe } = u;
  return safe;
};
export function reject(message: string, status = 400): never {
  throw Object.assign(Error(message), { status });
}
export async function current(req: Request) {
  const t = req.cookies.ct_session;
  if (typeof t !== "string") reject("Please sign in.", 401);
  const s = (await Session.findOne({
    token: digest(t),
    expires: { $gt: new Date() },
  }).lean()) as any;
  if (!s) reject("Session expired. Please sign in.", 401);
  const u = await Account.findOne({ id: s.userId, active: true }).lean();
  if (!u) reject("Account unavailable.", 401);
  return userData(u);
}
export async function admin(req: Request) {
  const u = await current(req);
  if (u.role !== "admin") reject("Admin access required.", 403);
  return u;
}
export const cookies = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 28800000,
});
export async function signIn(res: Response, userId: string) {
  const t = randomBytes(32).toString("hex");
  await Session.create({
    token: digest(t),
    userId,
    expires: new Date(Date.now() + 28800000),
  });
  res.cookie("ct_session", t, cookies());
}
export function originGuard(req: Request, _res: Response, next: NextFunction) {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    !(process.env.APP_ORIGIN || "http://localhost:3000")
      .split(",")
      .includes(req.get("origin") || "")
  )
    return next(
      Object.assign(Error("Request origin is not allowed."), { status: 403 }),
    );
  next();
}
