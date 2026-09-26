import {
  dateAt,
  makeDays,
  nights,
  visibleItem,
  type Draft,
  type Item,
  type Kind,
  type Quote,
} from "./model";
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function priceQuote(d: Draft, items: Item[], percent = 0) {
  const ns = nights(d.start, d.end);
  if (
    !Number.isFinite(ns) ||
    ns < 1 ||
    ns > 90 ||
    dateAt(d.start, 0) !== d.start ||
    dateAt(d.start, ns) !== d.end
  )
    throw Error("Choose valid travel dates within 90 nights.");
  if (d.cities.reduce((s, c) => s + c.nights, 0) !== ns)
    throw Error("City nights must equal trip nights.");
  const regular = d.adults - d.extraAdults,
    children = d.children + d.childrenWithoutBed,
    pax = d.adults + children;
  if (regular < 1 || regular > d.rooms * 2)
    throw Error(
      "Each room includes two adults. Extra adults are within the total. At least one regular adult is required.",
    );
  if (d.childAges.length !== children)
    throw Error("Enter every child age, children with bed first.");
  if (d.cabDays > ns + 1) throw Error("Cab days cannot exceed trip days.");
  const expected = makeDays(d);
  if (
    d.days.length !== expected.length ||
    d.days.some(
      (x, i) => x.date !== expected[i].date || x.city !== expected[i].city,
    )
  )
    throw Error("Refresh itinerary to match route and dates.");
  const priced = items.map((i) => visibleItem(i, percent));
  const get = (id: string, kind: Kind) => {
    const x = priced.find((i) => i.id === id && i.kind === kind && i.active);
    if (!x) throw Error("A selected " + kind + " is missing or inactive.");
    return x;
  };
  get(d.state, "state");
  get(d.meal, "meal");
  for (const id of [d.pickup, d.drop].filter(Boolean))
    if (get(id, "pickup").state !== d.state)
      throw Error("Pickup/drop must match the state.");
  const monthly = (n: number | null | undefined, date: string) => {
    if (n === null || n === undefined)
      throw Error(
        "Missing monthly rate for " + date + ". Ask admin to add it.",
      );
    return n;
  };
  const qty = [regular, d.extraAdults, d.children, d.childrenWithoutBed],
    costs = [0, 0, 0, 0];
  const shared = (n: number) =>
    qty.forEach((q, i) => (costs[i] += (n * q) / pax));
  const adultCost = (n: number) => {
    costs[0] += (n * regular) / d.adults;
    costs[1] += (n * d.extraAdults) / d.adults;
  };
  const childCost = (n: number) => {
    if (children) {
      costs[2] += (n * d.children) / children;
      costs[3] += (n * d.childrenWithoutBed) / children;
    }
  };
  const lines: Quote["lines"] = [],
    hotels: Item[] = [];
  let offset = 0;
  for (const c of d.cities) {
    if (get(c.city, "city").state !== d.state)
      throw Error("City must belong to the state.");
    const h = get(c.hotel, "hotel");
    if (h.city !== c.city) throw Error("Hotel must belong to its route city.");
    hotels.push(h);
    let cost = 0;
    for (let n = 0; n < c.nights; n++) {
      const date = dateAt(d.start, offset++),
        p = h.plans.find(
          (p) => p.meal === d.meal && p.year === +date.slice(0, 4),
        );
      if (!p) throw Error("Missing meal plan or rate year for " + h.name);
      const room = monthly(p.prices[+date.slice(5, 7) - 1], date) * d.rooms,
        extra = p.extra * d.extraAdults,
        child = p.child * d.children,
        noBed = d.childrenWithoutBed
          ? monthly(p.childWithoutBed, date) * d.childrenWithoutBed
          : 0;
      costs[0] += room;
      costs[1] += extra;
      costs[2] += child;
      costs[3] += noBed;
      cost += room + extra + child + noBed;
    }
    lines.push({
      name: h.name + " · " + c.nights + " nights",
      category: "Hotels",
      total: round(cost),
    });
  }
  let vehicle: Item | null = null;
  if (d.vehicle) {
    vehicle = get(d.vehicle, "vehicle");
    if (vehicle.state !== d.state) throw Error("Vehicle state does not match.");
    if (vehicle.seats * d.vehicles < pax)
      throw Error("Not enough vehicle seats.");
    if (
      (vehicle.pickup && vehicle.pickup !== d.pickup) ||
      (vehicle.drop && vehicle.drop !== d.drop)
    )
      throw Error("Vehicle route does not match pickup/drop.");
    let cost = 0;
    for (let n = 0; n < d.cabDays; n++) {
      const date = dateAt(d.start, n);
      if (vehicle.year !== +date.slice(0, 4))
        throw Error("Vehicle rate year does not cover this trip.");
      cost += monthly(vehicle.prices[+date.slice(5, 7) - 1], date) * d.vehicles;
    }
    shared(cost);
    lines.push({
      name: vehicle.name + " · " + d.cabDays + " days × " + d.vehicles,
      category: "Cab",
      total: round(cost),
    });
  }
  const activities: Item[] = [];
  for (const day of d.days) {
    if (new Set(day.activities).size !== day.activities.length)
      throw Error("Activity repeated on the same day.");
    for (const id of day.activities) {
      const a = get(id, "activity");
      if (a.city !== day.city) throw Error("Activity must match the day city.");
      const c = day.participation[id] || { adults: d.adults, children };
      if (c.adults > d.adults || c.children > children)
        throw Error("Participation exceeds guest count.");
      adultCost(a.amount * c.adults);
      childCost(a.child * c.children);
      activities.push(a);
      lines.push({
        name: a.name + " · " + day.date,
        category: "Activities",
        total: round(a.amount * c.adults + a.child * c.children),
      });
    }
  }
  if (new Set(d.transfers).size !== d.transfers.length)
    throw Error("Duplicate special transfer.");
  const transfers = d.transfers.map((id) => get(id, "transfer"));
  for (const t of transfers) {
    if (t.state !== d.state)
      throw Error("Special transfer state does not match.");
    if ((t.pickup && t.pickup !== d.pickup) || (t.drop && t.drop !== d.drop))
      throw Error("Special transfer route does not match.");
    const cost =
      t.amount *
      (t.priceBasis === "vehicle"
        ? d.vehicles
        : t.priceBasis === "person"
          ? pax
          : 1);
    shared(cost);
    lines.push({
      name: t.name,
      category: "Special transfers",
      total: round(cost),
    });
  }
  const subtotal = round(lines.reduce((s, l) => s + l.total, 0)),
    addedMarkup = round(
      d.markupType === "percent" ? (subtotal * d.markup) / 100 : d.markup,
    ),
    total = round(subtotal + addedMarkup),
    raw = costs.reduce((s, n) => s + n, 0);
  const exact = costs.map(
      (c, i) => (raw ? c / raw : qty[i] / pax) * Math.round(total * 100),
    ),
    cents = exact.map(Math.floor),
    left = Math.round(total * 100) - cents.reduce((s, n) => s + n, 0),
    order = exact
      .map((n, i) => ({ i, remainder: n - cents[i] }))
      .filter((x) => qty[x.i] > 0)
      .sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < left; i++) cents[order[i % order.length].i]++;
  const allocation = qty
    .map((quantity, i) => ({
      category: [
        "Regular adults",
        "Extra adults",
        "Children with bed",
        "Children without bed",
      ][i],
      quantity,
      unitPrice: quantity ? Math.floor(cents[i] / quantity) / 100 : 0,
      rounding: quantity ? (cents[i] % quantity) / 100 : 0,
      total: cents[i] / 100,
    }))
    .filter((x) => x.quantity);
  return {
    hotels,
    vehicle,
    activities,
    transfers,
    lines,
    subtotal,
    addedMarkup,
    total,
    allocation,
  };
}
