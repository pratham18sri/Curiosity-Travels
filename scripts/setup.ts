import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectDB, Account, Catalog } from "../server/db";
import { catalogSchema, defaultCompany } from "../lib/model";
export async function setup() {
  const login = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    password = process.env.ADMIN_PASSWORD;
  if (!login || !password || password.length < 12)
    throw Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters).");
  const old = await Account.findOne({ login });
  if (old && old.role !== "admin")
    throw Error("Login belongs to a non-admin account.");
  if (!old)
    await Account.create({
      id: randomUUID(),
      login,
      hash: await bcrypt.hash(password, 12),
      role: "admin",
      active: true,
      data: {
        name: "Curiosity Travel Admin",
        company: "Curiosity Travel",
        phone: "9909000642",
        email: login,
        address: "",
        logo: "",
        markup: 0,
      },
    });
  await Catalog.updateOne(
    { id: "company" },
    { $setOnInsert: { kind: "settings", data: defaultCompany } },
    { upsert: true },
  );
  for (const [id, name] of [
    ["meal-ep", "EP — Room only"],
    ["meal-cp", "CP — Breakfast"],
    ["meal-map", "MAP — Breakfast and dinner"],
    ["meal-ap", "AP — All meals"],
  ])
    await Catalog.updateOne(
      { id },
      {
        $setOnInsert: {
          kind: "meal",
          data: catalogSchema.parse({ id, kind: "meal", name }),
        },
      },
      { upsert: true },
    );
  console.log(
    "Owner, indexes and company defaults ready. Existing data preserved.",
  );
}
if (process.argv[1]?.endsWith("setup.ts")) {
  try {
    await connectDB();
    await setup();
    await mongoose.disconnect();
  } catch {
    console.error(
      "Setup failed. Check private environment variables and MongoDB connectivity.",
    );
    process.exit(1);
  }
}
