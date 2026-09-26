import { z } from "zod";
export const kinds = [
  "state",
  "city",
  "meal",
  "pickup",
  "seater",
  "vehicleType",
  "hotel",
  "vehicle",
  "activity",
  "transfer",
  "settings",
  "cms",
  "template",
] as const;
export type Kind = (typeof kinds)[number];
const price = z.number().min(0).max(1e8);
const str = z.string().max(500);
const image = z.string().regex(/^$|^\/api\/media\?id=[a-zA-Z0-9-]+$/);
export const planSchema = z.object({
  meal: str,
  year: z.number().int().min(2020).max(2100),
  prices: z.array(price.nullable()).length(12),
  extra: price,
  child: price,
  childWithoutBed: price.nullable().default(null),
});
export const catalogSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(kinds),
  name: z.string().min(1).max(150),
  state: str.default(""),
  city: str.default(""),
  active: z.boolean().default(true),
  description: z.string().max(12000).default(""),
  images: z.array(image).max(4).default([]),
  country: str.default("India"),
  roomCategory: str.default("Standard"),
  priceBasis: z.enum(["transfer", "vehicle", "person"]).default("transfer"),
  templateActivities: z.array(str).max(20).default([]),
  rating: z.number().int().min(1).max(5).default(3),
  plans: z.array(planSchema).max(40).default([]),
  year: z.number().int().min(2020).max(2100).default(2026),
  prices: z.array(price.nullable()).length(12).default(Array(12).fill(null)),
  amount: price.default(0),
  child: price.default(0),
  seats: z.number().int().min(1).max(100).default(4),
  vehicleType: str.default(""),
  pickup: str.default(""),
  drop: str.default(""),
  stage: z.enum(["local", "arrival", "departure", "enroute"]).default("local"),
  day: z.number().int().min(0).max(30).default(0),
  hours: z.number().min(0.25).max(12).default(2),
  phone: str.default(""),
  email: z.string().max(150).default(""),
  address: str.default(""),
  terms: z.string().max(16000).default(""),
  inclusions: z.string().max(8000).default(""),
  exclusions: z.string().max(8000).default(""),
});
export type Item = z.infer<typeof catalogSchema>;
// A new form may be incomplete. Persisted records still use catalogSchema.
export function newCatalogDraft(kind: Kind, id: string): Item {
  return catalogSchema.extend({ name: z.string().max(150) }).parse({
    id: kind === "settings" ? "company" : kind === "cms" ? "homepage" : id,
    kind,
    name:
      kind === "settings"
        ? "Curiosity Travel"
        : kind === "cms"
          ? "Plan your next journey"
          : "",
    phone: kind === "settings" ? "9909000642" : "",
  });
}
export const defaultCompany = catalogSchema.parse({
  id: "company",
  kind: "settings",
  name: "Curiosity Travel",
  phone: "9909000642",
  terms:
    "Rates and services are subject to availability at booking. Confirm all services before collecting final payment.",
});
export const userSchema = z.object({
  id: z.string().optional(),
  login: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-zA-Z0-9@._+-]+$/),
  password: z.string().max(128).optional(),
  role: z.enum(["staff", "agent"]),
  name: z.string().min(1).max(150),
  company: z.string().min(1).max(150),
  phone: str,
  email: z.string().max(150),
  address: str,
  logo: image.default(""),
  markup: z.number().min(0).max(500),
  active: z.boolean(),
});
export type User = {
  id: string;
  login: string;
  role: "admin" | "staff" | "agent";
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
  markup?: number;
  active: boolean;
};
export const daySchema = z.object({
  date: z.string(),
  city: str,
  activities: z.array(z.string()).max(20),
  title: str.default(""),
  participation: z
    .record(
      z.object({
        adults: z.number().int().min(0),
        children: z.number().int().min(0),
      }),
    )
    .default({}),
  notes: z.string().max(3000),
});
export const draftSchema = z.object({
  client: z.string().min(1).max(150),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  state: str,
  adults: z.number().int().min(1).max(500),
  extraAdults: z.number().int().min(0).max(500),
  children: z.number().int().min(0).max(500),
  childrenWithoutBed: z.number().int().min(0).max(500).default(0),
  childAges: z.array(z.number().int().min(0).max(17)).max(500).default([]),
  contact: str.default(""),
  rooms: z.number().int().min(1).max(250),
  meal: str,
  cities: z
    .array(
      z.object({
        city: str,
        nights: z.number().int().min(1).max(60),
        hotel: str,
      }),
    )
    .min(1)
    .max(30),
  vehicle: str,
  vehicles: z.number().int().min(1).max(30),
  cabDays: z.number().int().min(1).max(366),
  pickup: str,
  drop: str,
  transfers: z.array(z.string()).max(20),
  days: z.array(daySchema).max(91),
  markupType: z.enum(["percent", "fixed"]),
  markup: price,
  inclusions: z.string().max(8000),
  exclusions: z.string().max(8000),
});
export type Draft = z.infer<typeof draftSchema>;
export type Day = z.infer<typeof daySchema>;
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
export const nights = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
export const dateAt = (a: string, n: number) =>
  new Date(Date.parse(a) + n * 86400000).toISOString().slice(0, 10);
export function makeDays(d: Pick<Draft, "start" | "cities">): Day[] {
  if (!d.start || !Number.isFinite(Date.parse(d.start))) return [];
  let offset = 0;
  const out: Day[] = [];
  for (const c of d.cities) {
    for (let n = 0; n < c.nights; n++)
      out.push({
        date: dateAt(d.start, offset++),
        city: c.city,
        activities: [],
        title: "",
        participation: {},
        notes: "",
      });
  }
  if (out.length)
    out.push({
      date: dateAt(d.start, offset),
      city: d.cities.at(-1)!.city,
      activities: [],
      title: "",
      participation: {},
      notes: "",
    });
  return out;
}
export function autoDays(d: Draft, items: Item[]): Day[] {
  const days = makeDays(d),
    used = new Set<string>(),
    cityDays: Record<string, number> = {};
  return days.map((day, i) => {
    cityDays[day.city] = (cityDays[day.city] || 0) + 1;
    const stage =
      i === 0
        ? "arrival"
        : i === days.length - 1
          ? "departure"
          : days[i - 1].city !== day.city
            ? "enroute"
            : "local";
    let hours = stage === "local" ? 6 : 2;
    const t = items.find(
      (x) =>
        x.kind === "template" &&
        x.active &&
        x.city === day.city &&
        x.stage === stage &&
        (!x.day || x.day === cityDays[day.city]),
    );
    const available = items.filter(
      (a) =>
        a.kind === "activity" &&
        a.active &&
        a.city === day.city &&
        !used.has(a.id),
    );
    const candidates = t
      ? t.templateActivities
          .map((id) => available.find((a) => a.id === id))
          .filter((a): a is Item => !!a)
      : available.filter(
          (a) =>
            (a.stage === stage ||
              (stage !== "departure" && a.stage === "local")) &&
            (!a.day || a.day === cityDays[day.city]),
        );
    const chosen: Item[] = [];
    for (const a of candidates)
      if (a.hours <= hours && !used.has(a.id)) {
        chosen.push(a);
        used.add(a.id);
        hours -= a.hours;
      }
    return {
      ...day,
      title: t?.name || "",
      activities: chosen.map((a) => a.id),
      notes:
        t?.description ||
        (stage === "arrival"
          ? "Arrival and hotel check-in. Confirm arrival timing."
          : stage === "departure"
            ? "Check-out and departure transfer. Confirm departure timing."
            : stage === "enroute"
              ? "Transfer to the next city and hotel check-in."
              : chosen.length
                ? ""
                : "Time at leisure."),
    };
  });
}
export function visibleItem(item: Item, percent: number): Item {
  const mul = (n: number) => Math.round(n * (1 + percent / 100) * 100) / 100;
  return {
    ...item,
    amount: mul(item.amount),
    child: mul(item.child),
    prices: item.prices.map((n) => (n === null ? null : mul(n))),
    plans: item.plans.map((p) => ({
      ...p,
      prices: p.prices.map((n) => (n === null ? null : mul(n))),
      extra: mul(p.extra),
      child: mul(p.child),
      childWithoutBed:
        p.childWithoutBed === null ? null : mul(p.childWithoutBed),
    })),
  };
}
export type Quote = {
  status?: "draft" | "generated";
  allocation?: {
    category: string;
    quantity: number;
    unitPrice: number;
    rounding: number;
    total: number;
  }[];
  labels: Record<string, string>;
  id: string;
  owner: string;
  created: string;
  draft: Draft;
  company: Item;
  hotels: Item[];
  activities: Item[];
  vehicle: Item | null;
  transfers: Item[];
  lines: { name: string; category: string; total: number }[];
  subtotal: number;
  addedMarkup: number;
  total: number;
};
export { priceQuote } from "./pricing";
