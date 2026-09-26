import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Account, Session, Catalog, Quotation, Media } from "./db";
import {
  admin,
  current,
  safeUser,
  userData,
  reject,
  originGuard,
  signIn,
  digest,
  cookies,
} from "./auth";
import {
  catalogSchema,
  draftSchema,
  userSchema,
  defaultCompany,
  visibleItem,
  priceQuote,
  type Item,
  type Quote,
} from "../lib/model";
import { createPdf } from "../lib/pdf";
const idSchema = z.string().regex(/^[a-zA-Z0-9-]{1,100}$/);
const allItems = async (): Promise<Item[]> =>
  (await Catalog.find().lean()).map((r: any) => catalogSchema.parse(r.data));
const owned = (u: { id: string; role: string }, id: string) =>
  u.role === "admin" ? { id } : { id, owner: u.id };
const asBuffer = (b: any): Buffer =>
  Buffer.isBuffer(b) ? b : Buffer.from(b.buffer);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(
    helmet(),
    cookieParser(),
    express.json({ limit: "1mb" }),
    originGuard,
  );
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/public", async (_req, res) => {
    const all = await allItems(),
      c = all.find((i) => i.kind === "settings") || defaultCompany,
      h = all.find((i) => i.kind === "cms");
    res.json({
      company: {
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        images: c.images,
      },
      cms: h
        ? { name: h.name, description: h.description, images: h.images }
        : null,
    });
  });
  app.get("/api/auth", async (req, res) => {
    try {
      res.json({ user: safeUser(await current(req)) });
    } catch (e: any) {
      if (e.status === 401) res.json({ user: null });
      else throw e;
    }
  });
  app.post(
    "/api/auth",
    rateLimit({
      windowMs: 900000,
      limit: 15,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many login attempts. Try again in 15 minutes." },
    }),
    async (req, res) => {
      if (req.body.action === "logout") {
        if (req.cookies.ct_session)
          await Session.deleteOne({
            token: digest(String(req.cookies.ct_session)),
          });
        res.clearCookie("ct_session", cookies());
        res.json({ ok: true });
        return;
      }
      const { login, password } = z
          .object({
            login: z.string().min(1).max(80),
            password: z.string().min(1).max(128),
          })
          .parse(req.body),
        u = (await Account.findOne({
          login: login.trim().toLowerCase(),
        }).lean()) as any;
      const ok = await bcrypt.compare(
        password,
        u?.hash ||
          "$2b$12$KbQiHgHpMCojMQ8upxSHIObDiSDDfTpSTyGkjQIg5/15NNc4PxbmS",
      );
      if (!u || !ok || !u.active) reject("Incorrect login or password.", 401);
      await signIn(res, u.id);
      res.json({ user: safeUser(userData(u)) });
    },
  );
  app.get("/api/catalog", async (req, res) => {
    const u = await current(req),
      all = await allItems();
    res.json({
      items: all
        .filter((i) => u.role === "admin" || i.active)
        .map((i) => visibleItem(i, u.role === "agent" ? u.markup || 0 : 0)),
      company: all.find((i) => i.kind === "settings") || defaultCompany,
    });
  });
  app.post("/api/catalog", async (req, res) => {
    await admin(req);
    const i = catalogSchema.parse(req.body),
      all = await allItems();
    idSchema.parse(i.id);
    const old = all.find((x) => x.id === i.id);
    if (old && old.kind !== i.kind) reject("Record type cannot change.");
    const ref = (id: string, kind: string) => {
      if (!all.some((x) => x.id === id && x.kind === kind))
        reject("Select a valid " + kind + ".");
    };
    if (
      [
        "city",
        "hotel",
        "vehicle",
        "transfer",
        "pickup",
        "activity",
        "template",
      ].includes(i.kind)
    )
      ref(i.state, "state");
    if (["hotel", "activity", "template"].includes(i.kind)) {
      ref(i.city, "city");
      if (all.find((x) => x.id === i.city)?.state !== i.state)
        reject("City and state do not match.");
    }
    if (i.kind === "hotel") {
      if (!i.plans.length) reject("Add at least one meal plan.");
      i.plans.forEach((p) => ref(p.meal, "meal"));
      if (
        new Set(i.plans.map((p) => p.meal + ":" + p.year)).size !==
        i.plans.length
      )
        reject("Only one rate block per meal plan and year.");
    }
    if (["vehicle", "transfer"].includes(i.kind)) {
      if (i.vehicleType) ref(i.vehicleType, "vehicleType");
      for (const id of [i.pickup, i.drop].filter(Boolean)) {
        ref(id, "pickup");
        if (all.find((x) => x.id === id)?.state !== i.state)
          reject("Transfer locations must match the state.");
      }
    }
    if (i.kind === "template")
      for (const id of i.templateActivities) {
        ref(id, "activity");
        if (all.find((x) => x.id === id)?.city !== i.city)
          reject("Template activity must match its city.");
      }
    if (
      (i.kind === "settings" && i.id !== "company") ||
      (i.kind === "cms" && i.id !== "homepage")
    )
      reject("Invalid settings record.");
    await Catalog.updateOne(
      { id: i.id },
      { $set: { kind: i.kind, data: i } },
      { upsert: true },
    );
    res.json({ item: i });
  });
  app.delete("/api/catalog", async (req, res) => {
    await admin(req);
    const id = idSchema.parse(req.body.id),
      all = await allItems(),
      i = all.find((x) => x.id === id);
    if (!i || ["settings", "cms"].includes(i.kind))
      reject("Record cannot be removed.");
    if (
      all.some(
        (x) =>
          x.id !== id &&
          (x.state === id ||
            x.city === id ||
            x.pickup === id ||
            x.drop === id ||
            x.vehicleType === id ||
            x.plans.some((p) => p.meal === id) ||
            x.templateActivities.includes(id)),
      )
    )
      reject("This record is in use. Set it inactive instead.");
    await Catalog.deleteOne({ id });
    res.json({ ok: true });
  });
  app.get("/api/users", async (req, res) => {
    await admin(req);
    res.json({
      users: (await Account.find({ role: { $ne: "admin" } }).lean()).map(
        userData,
      ),
    });
  });
  app.post("/api/users", async (req, res) => {
    await admin(req);
    const u = userSchema.parse(req.body),
      id = u.id || randomUUID();
    idSchema.parse(id);
    const existing = (await Account.findOne({ id }).lean()) as any;
    if (existing?.role === "admin")
      reject("Owner account cannot be edited here.");
    if (!existing && !u.password) reject("Initial password required.");
    if (u.password && u.password.length < 12)
      reject("Use at least 12 characters.");
    const { password, id: ignored, login, role, active, ...data } = u;
    data.markup = role === "agent" ? u.markup : 0;
    await Account.updateOne(
      { id },
      {
        $set: {
          login: login.toLowerCase(),
          role,
          active,
          data,
          hash: password ? await bcrypt.hash(password, 12) : existing.hash,
        },
      },
      { upsert: true },
    );
    await Session.deleteMany({ userId: id });
    res.json({ ok: true });
  });
  app.get("/api/quotes", async (req, res) => {
    const u = await current(req);
    if (req.query.id) {
      const q = (await Quotation.findOne(
        owned(u, idSchema.parse(req.query.id)),
      ).lean()) as any;
      if (!q) reject("Quotation not found.", 404);
      res.json({ quote: q.data });
      return;
    }
    const rows = await Quotation.find(u.role === "admin" ? {} : { owner: u.id })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({
      quotes: rows.map((r: any) => ({
        id: r.id,
        status: r.status,
        created: r.data.created,
        client: r.data.draft.client,
        start: r.data.draft.start,
        total: r.data.total || 0,
      })),
    });
  });
  app.post("/api/quotes", async (req, res) => {
    const u = await current(req),
      mode = req.body._action || "generate",
      id = req.body._id ? idSchema.parse(req.body._id) : randomUUID(),
      old = (await Quotation.findOne(owned(u, id)).lean()) as any;
    if (req.body._id && !old) reject("Quotation not found.", 404);
    if (old && old.owner !== u.id && mode !== "content")
      reject("Duplicate another account’s quote before recalculating.", 403);
    const all = await allItems(),
      settings = all.find((i) => i.kind === "settings") || defaultCompany,
      company =
        u.role === "agent"
          ? {
              ...settings,
              name: u.company,
              phone: u.phone,
              email: u.email,
              address: u.address,
              images: u.logo ? [u.logo] : [],
            }
          : settings;
    let q: Quote;
    if (mode === "content") {
      if (!old || old.status !== "generated")
        reject("Generated quotation required.");
      const b = z
        .object({
          client: z.string().min(1).max(150),
          inclusions: z.string().max(8000),
          exclusions: z.string().max(8000),
          notes: z
            .array(
              z.object({
                title: z.string().max(500),
                notes: z.string().max(3000),
              }),
            )
            .max(91),
        })
        .parse(req.body);
      if (b.notes.length !== old.data.draft.days.length)
        reject("Keep the same number of days.");
      q = old.data;
      q.draft = {
        ...q.draft,
        client: b.client,
        inclusions: b.inclusions,
        exclusions: b.exclusions,
        days: q.draft.days.map((day, i) => ({ ...day, ...b.notes[i] })),
      };
    } else {
      const draft = (
        mode === "draft"
          ? draftSchema.extend({
              client: z.string().max(150),
              start: z.string().max(10),
              end: z.string().max(10),
            })
          : draftSchema
      ).parse(req.body);
      if (mode === "draft" && old?.status === "generated")
        reject("Keep the generated snapshot by saving a new draft.");
      q = {
        id,
        owner: old?.owner || u.id,
        created: old?.data.created || new Date().toISOString(),
        draft,
        company,
        status: mode === "draft" ? "draft" : "generated",
        labels: Object.fromEntries(all.map((i) => [i.id, i.name])),
        ...(mode === "draft"
          ? {
              hotels: [],
              activities: [],
              vehicle: null,
              transfers: [],
              lines: [],
              subtotal: 0,
              addedMarkup: 0,
              total: 0,
            }
          : priceQuote(draft, all, u.role === "agent" ? u.markup || 0 : 0)),
      };
    }
    await Quotation.updateOne(
      { id },
      { $set: { owner: q.owner, status: q.status, data: q } },
      { upsert: true },
    );
    res.json({ quote: q });
  });
  app.post(
    "/api/media",
    async (req, _res, next) => {
      await admin(req);
      next();
    },
    upload.single("file"),
    async (req, res) => {
      if (!req.file) reject("Choose a JPG or PNG.");
      if (!["image/png", "image/jpeg"].includes(req.file.mimetype))
        reject("Choose a JPG or PNG.");
      let bytes: Buffer;
      try {
        bytes = await sharp(req.file.buffer, { limitInputPixels: 25000000 })
          .rotate()
          .resize({
            width: 1800,
            height: 1800,
            fit: "inside",
            withoutEnlargement: true,
          })
          .png()
          .toBuffer();
      } catch {
        reject("Invalid image. Use a JPG or PNG under 25 megapixels.");
      }
      const id = randomUUID();
      await Media.create({ id, mime: "image/png", bytes });
      res.json({ url: "/api/media?id=" + id });
    },
  );
  app.get("/api/media", async (req, res) => {
    const id = idSchema.parse(req.query.id),
      url = "/api/media?id=" + id,
      all = await allItems(),
      isPublic = all.some(
        (x) => ["settings", "cms"].includes(x.kind) && x.images.includes(url),
      );
    if (!isPublic) {
      const u = await current(req);
      if (
        u.role !== "admin" &&
        !all.some((x) => x.active && x.images.includes(url)) &&
        u.logo !== url
      ) {
        const qs = await Quotation.find({ owner: u.id }).lean();
        if (!qs.some((q: any) => JSON.stringify(q.data).includes(url)))
          reject("Image not found.", 404);
      }
    }
    const row = (await Media.findOne({ id }).lean()) as any;
    if (!row) reject("Image not found.", 404);
    res.type(row.mime).send(asBuffer(row.bytes));
  });
  app.get(
    "/api/pdf",
    rateLimit({
      windowMs: 60000,
      limit: 15,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    async (req, res) => {
      const u = await current(req),
        row = (await Quotation.findOne(
          owned(u, idSchema.parse(req.query.id)),
        ).lean()) as any;
      if (!row || row.status !== "generated")
        reject("Generate the quotation first.", 404);
      const q: Quote = row.data,
        images: Record<string, Uint8Array> = {};
      let total = 0;
      for (const url of new Set([
        ...q.company.images,
        ...q.hotels.flatMap((x) => x.images),
        ...q.activities.flatMap((x) => x.images),
      ])) {
        const id = url.split("id=")[1];
        if (!id) continue;
        const m = (await Media.findOne({ id }).lean()) as any;
        if (m) {
          const b = asBuffer(m.bytes);
          total += b.length;
          if (total > 30 * 1024 * 1024)
            reject("Photos exceed 30 MB. Use smaller images.");
          images[url] = new Uint8Array(b);
        }
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        (req.query.preview === "1" ? "inline" : "attachment") +
          '; filename="Quotation_' +
          q.draft.client.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50) +
          "_" +
          q.id.slice(0, 8) +
          '.pdf"',
      );
      res.send(Buffer.from(createPdf(q, images)));
    },
  );
  const cache = new Map<string, { expires: number; data: any }>();
  app.get("/api/geography", async (req, res) => {
    await current(req);
    const { level, country, state } = z
        .object({
          level: z.enum(["countries", "states", "cities"]),
          country: z.string().max(100).default("India"),
          state: z.string().max(100).default(""),
        })
        .parse(req.query),
      key = JSON.stringify([level, country, state]),
      hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
      res.json(hit.data);
      return;
    }
    try {
      const suffix =
          level === "countries"
            ? "/iso"
            : level === "states"
              ? "/states"
              : "/state/cities",
        r = await fetch(
          "https://countriesnow.space/api/v0.1/countries" + suffix,
          {
            method: level === "countries" ? "GET" : "POST",
            headers: { "Content-Type": "application/json" },
            body:
              level === "countries"
                ? undefined
                : JSON.stringify({
                    country,
                    ...(level === "cities" ? { state } : {}),
                  }),
            signal: AbortSignal.timeout(10000),
          },
        );
      if (!r.ok) throw Error();
      const b: any = await r.json();
      if (b.error) throw Error();
      const data = {
        names:
          level === "countries"
            ? b.data.map((x: any) => x.name)
            : level === "states"
              ? b.data.states.map((x: any) => x.name)
              : b.data,
        source: "CountriesNow",
      };
      if (cache.size > 500) cache.clear();
      cache.set(key, { expires: Date.now() + 86400000, data });
      res.json(data);
    } catch {
      reject(
        "Location service unavailable. Enter the location manually to continue.",
        502,
      );
    }
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Endpoint not found." }),
  );
  app.use(
    (
      e: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (e instanceof z.ZodError) {
        res
          .status(400)
          .json({
            error: e.issues
              .map((x) => x.path.join(".") + ": " + x.message)
              .join("; "),
          });
        return;
      }
      if (e.code === 11000) {
        res.status(409).json({ error: "Login or record already exists." });
        return;
      }
      res
        .status(e.status || 400)
        .json({
          error:
            e instanceof multer.MulterError
              ? "Upload a JPG or PNG up to 5 MB."
              : e.name?.includes("Mongo")
                ? "Database request failed."
                : e.message || "Request failed.",
        });
    },
  );
  return app;
}
