"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Hotel,
  MapPin,
  Car,
  CalendarDays,
} from "lucide-react";
import {
  type Draft,
  type Item,
  type Quote,
  makeDays,
  autoDays,
  dateAt,
  nights,
  money,
  priceQuote,
} from "@/lib/model";
import { Field, Choice, Check, Photo, Panel, api } from "./ui";
export const blankDraft = (company: Item): Draft => ({
  client: "",
  start: "",
  end: "",
  state: "",
  adults: 2,
  extraAdults: 0,
  children: 0,
  childrenWithoutBed: 0,
  childAges: [],
  contact: "",
  rooms: 1,
  meal: "",
  cities: [{ city: "", nights: 1, hotel: "" }],
  vehicle: "",
  vehicles: 1,
  cabDays: 2,
  pickup: "",
  drop: "",
  transfers: [],
  days: [],
  markupType: "fixed",
  markup: 0,
  inclusions: company.inclusions,
  exclusions: company.exclusions,
});
export function Builder({
  items,
  company,
  onGenerated,
  onError,
  initial,
  draftId,
}: {
  items: Item[];
  company: Item;
  onGenerated: (q: Quote) => void;
  onError: (s: string) => void;
  initial?: Draft;
  draftId?: string;
}) {
  const [d, setD] = useState<Draft>(initial || blankDraft(company));
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState(draftId);
  const [notice, setNotice] = useState("");
  const patch = (key: keyof Draft, v: unknown) =>
    setD((x) => ({ ...x, [key]: v }));
  const opts = (kind: string) =>
    items.filter((i) => i.kind === kind && i.active);
  const name = (id: string) =>
    items.find((i) => i.id === id)?.name || "Select city";
  const totalNights = d.start && d.end ? nights(d.start, d.end) : 0;
  const routeNights = d.cities.reduce((s, c) => s + c.nights, 0);
  const ready =
    !!d.start && totalNights === routeNights && d.cities.every((c) => !!c.city);
  let estimate: ReturnType<typeof priceQuote> | null = null;
  try {
    estimate = priceQuote(d, items);
  } catch {}
  const routeChange = (cities: Draft["cities"]) => {
    setD((x) => ({ ...x, cities, days: [] }));
    setNotice("Route changed. Refresh the itinerary before generating.");
  };
  function refreshDays(auto = false) {
    if (!ready) {
      onError(
        "Select travel dates and cities; city nights must match trip nights.",
      );
      return;
    }
    if (
      d.days.length &&
      !window.confirm("Replace the current day selections and notes?")
    )
      return;
    patch("days", auto ? autoDays(d, items) : makeDays(d));
    setNotice(
      auto
        ? "Suggested itinerary created. Review travel times, opening days and arrival/departure timing before finalising."
        : "Day cards created. Add activities and notes to each day.",
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BUILD A JOURNEY</p>
          <h1>Create a quotation</h1>
          <p>Choose the stay. Shape each day. Make it their trip.</p>
        </div>
        <span className="badge">
          <CalendarDays size={15} />
          {totalNights > 0
            ? `${totalNights} nights / ${totalNights + 1} days`
            : "New quotation"}
        </span>
      </div>
      <div className="builder-layout">
        <div>
          <Panel number="01" title="Guest & travel details">
            <div className="form-grid">
              <Field label="Guest / client name">
                <input
                  placeholder="Enter guest name"
                  value={d.client}
                  onChange={(e) => patch("client", e.target.value)}
                />
              </Field>
              <Field label="Guest contact">
                <input
                  value={d.contact}
                  onChange={(e) => patch("contact", e.target.value)}
                />
              </Field>
              <Choice
                label="Destination state"
                value={d.state}
                options={opts("state")}
                onChange={(v) => {
                  setD((x) => ({
                    ...x,
                    state: v,
                    cities: [{ city: "", nights: 1, hotel: "" }],
                    vehicle: "",
                    pickup: "",
                    drop: "",
                    transfers: [],
                    days: [],
                  }));
                }}
              />
              <Field label="Arrival date">
                <input
                  type="date"
                  value={d.start}
                  onChange={(e) => {
                    const start = e.target.value;
                    setD((x) => ({
                      ...x,
                      start,
                      days: [],
                      cabDays:
                        start && x.end
                          ? Math.max(1, nights(start, x.end) + 1)
                          : x.cabDays,
                    }));
                  }}
                />
              </Field>
              <Field label="Departure date">
                <input
                  type="date"
                  min={d.start || undefined}
                  value={d.end}
                  onChange={(e) => {
                    const end = e.target.value;
                    setD((x) => ({
                      ...x,
                      end,
                      days: [],
                      cabDays:
                        x.start && end
                          ? Math.max(1, nights(x.start, end) + 1)
                          : x.cabDays,
                    }));
                  }}
                />
              </Field>
            </div>
          </Panel>
          <Panel
            number="02"
            title="Destinations & guests"
            subtitle="Arrange cities in travel order and allocate your nights."
          >
            {d.cities.map((c, i) => (
              <div className="route-row" key={i}>
                <span className="route-dot">
                  {i + 1}
                  {i > 0 && (
                    <button
                      aria-label="Move city up"
                      onClick={() => {
                        const c = [...d.cities];
                        [c[i - 1], c[i]] = [c[i], c[i - 1]];
                        routeChange(c);
                      }}
                    >
                      ↑
                    </button>
                  )}
                </span>
                <Choice
                  label="City"
                  value={c.city}
                  options={opts("city").filter((x) => x.state === d.state)}
                  onChange={(v) =>
                    routeChange(
                      d.cities.map((x, n) =>
                        n === i ? { ...x, city: v, hotel: "" } : x,
                      ),
                    )
                  }
                />
                <Field label="Nights">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={c.nights}
                    onChange={(e) =>
                      routeChange(
                        d.cities.map((x, n) =>
                          n === i
                            ? { ...x, nights: Math.max(1, +e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                </Field>
                {d.cities.length > 1 && (
                  <button
                    className="icon-btn danger"
                    aria-label="Remove city"
                    onClick={() =>
                      routeChange(d.cities.filter((_, n) => n !== i))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <div className="route-footer">
              <button
                className="secondary"
                onClick={() =>
                  routeChange([...d.cities, { city: "", nights: 1, hotel: "" }])
                }
              >
                <Plus size={16} />
                Add another city
              </button>
              <span
                className={routeNights !== totalNights ? "warning-text" : ""}
              >
                {routeNights} / {totalNights || "—"} nights allocated
              </span>
            </div>
            <div className="form-grid three">
              {(
                [
                  ["adults", "Total adults"],
                  ["extraAdults", "Extra adults (within total)"],
                  ["children", "Children with bed"],
                  ["childrenWithoutBed", "Children without bed"],
                  ["rooms", "Rooms"],
                ] as const
              ).map(([k, label]) => (
                <Field key={k} label={label}>
                  <input
                    type="number"
                    min={k === "adults" || k === "rooms" ? 1 : 0}
                    value={d[k]}
                    onChange={(e) => patch(k, +e.target.value)}
                  />
                </Field>
              ))}
              <Choice
                label="Meal plan"
                value={d.meal}
                options={opts("meal")}
                onChange={(v) => patch("meal", v)}
              />
            </div>
            <div className="form-grid three">
              {Array.from(
                { length: Math.min(500, d.children + d.childrenWithoutBed) },
                (_, i) => (
                  <Field
                    key={i}
                    label={`Child ${i + 1} age (${i < d.children ? "with bed" : "without bed"})`}
                  >
                    <input
                      type="number"
                      min="0"
                      max="17"
                      value={d.childAges[i] ?? ""}
                      onChange={(e) =>
                        patch(
                          "childAges",
                          Array.from(
                            { length: d.children + d.childrenWithoutBed },
                            (_, n) =>
                              n === i ? +e.target.value : (d.childAges[n] ?? 0),
                          ),
                        )
                      }
                    />
                  </Field>
                ),
              )}
            </div>
            <p className="hint">
              A room rate covers two adults. Extra adults and children with bed
              are charged per night.
            </p>
          </Panel>
          <Panel
            number="03"
            title="Cab & transfers"
            subtitle="Regular sightseeing and transfers are covered by the daily cab rate."
          >
            <div className="form-grid">
              <Choice
                label="Pickup"
                value={d.pickup}
                options={opts("pickup").filter((i) => i.state === d.state)}
                onChange={(v) => patch("pickup", v)}
              />
              <Choice
                label="Drop"
                value={d.drop}
                options={opts("pickup").filter((i) => i.state === d.state)}
                onChange={(v) => patch("drop", v)}
              />
              <Choice
                label="Vehicle"
                value={d.vehicle}
                options={opts("vehicle")
                  .filter(
                    (i) =>
                      i.state === d.state &&
                      (!i.pickup || i.pickup === d.pickup) &&
                      (!i.drop || i.drop === d.drop),
                  )
                  .map((i) => ({
                    id: i.id,
                    name: i.name + " · " + i.seats + " seats",
                  }))}
                empty="No daily cab"
                onChange={(v) => patch("vehicle", v)}
              />
              <Field label="Vehicles">
                <input
                  type="number"
                  min="1"
                  value={d.vehicles}
                  onChange={(e) => patch("vehicles", +e.target.value)}
                />
              </Field>
              <Field
                label="Chargeable cab days"
                hint="Charged from the arrival date."
              >
                <input
                  type="number"
                  min="1"
                  max={totalNights + 1 || 1}
                  value={d.cabDays}
                  onChange={(e) => patch("cabDays", +e.target.value)}
                />
              </Field>
            </div>
            <h3 className="subheading">Special / other transfers</h3>
            {opts("transfer")
              .filter((i) => i.state === d.state)
              .map((t) => (
                <Check
                  key={t.id}
                  label={t.name + " · " + money(t.amount)}
                  value={d.transfers.includes(t.id)}
                  onChange={(v) =>
                    patch(
                      "transfers",
                      v
                        ? [...d.transfers, t.id]
                        : d.transfers.filter((id) => id !== t.id),
                    )
                  }
                />
              ))}
            {!opts("transfer").some((i) => i.state === d.state) && (
              <p className="hint">
                No special transfers available for this state.
              </p>
            )}
          </Panel>
          <Panel
            number="04"
            title="Day-wise itinerary"
            subtitle="Generate a suggested plan from your activity catalogue, then adjust each day."
          >
            <div className="row-actions">
              <button
                className="primary"
                disabled={!ready}
                onClick={() => refreshDays(true)}
              >
                <Sparkles size={17} />
                Auto-build itinerary
              </button>
              <button
                className="secondary"
                disabled={!ready}
                onClick={() => refreshDays(false)}
              >
                Create blank days
              </button>
            </div>
            {d.days.length > 0 && (
              <p className="hint">
                Rebuilding replaces the current day selections and notes.
              </p>
            )}
            {notice && <p className="info-note">{notice}</p>}
            {!d.days.length && (
              <div className="empty small">
                <CalendarDays />
                <p>Select cities, nights and dates to create your itinerary.</p>
              </div>
            )}
            {d.days.map((day, index) => (
              <div className="day-editor" key={day.date}>
                <div className="day-label">
                  <strong>Day {index + 1}</strong>
                  <span>{name(day.city)}</span>
                  <small>
                    {new Date(day.date + "T00:00:00").toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", weekday: "short" },
                    )}
                  </small>
                </div>
                <div className="day-fields">
                  <Field label="Day title">
                    <input
                      value={day.title}
                      onChange={(e) =>
                        patch(
                          "days",
                          d.days.map((x, n) =>
                            n === index ? { ...x, title: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </Field>
                  {day.activities.map((id, ix) => (
                    <div key={id} className="activity-edit">
                      <div className="activity-chip">
                        <span>{name(id)}</span>
                        <div className="row-actions">
                          <button
                            disabled={ix === 0}
                            aria-label="Move activity up"
                            onClick={() => {
                              const a = [...day.activities];
                              [a[ix - 1], a[ix]] = [a[ix], a[ix - 1]];
                              patch(
                                "days",
                                d.days.map((x, n) =>
                                  n === index ? { ...x, activities: a } : x,
                                ),
                              );
                            }}
                          >
                            ↑
                          </button>
                          <button
                            aria-label={"Remove " + name(id)}
                            onClick={() =>
                              patch(
                                "days",
                                d.days.map((x, n) =>
                                  n === index
                                    ? {
                                        ...x,
                                        activities: x.activities.filter(
                                          (v) => v !== id,
                                        ),
                                      }
                                    : x,
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="form-grid">
                        {(["adults", "children"] as const).map((key) => (
                          <Field key={key} label={"Participating " + key}>
                            <input
                              type="number"
                              min="0"
                              max={
                                key === "adults"
                                  ? d.adults
                                  : d.children + d.childrenWithoutBed
                              }
                              value={
                                day.participation[id]?.[key] ??
                                (key === "adults"
                                  ? d.adults
                                  : d.children + d.childrenWithoutBed)
                              }
                              onChange={(e) =>
                                patch(
                                  "days",
                                  d.days.map((x, n) =>
                                    n === index
                                      ? {
                                          ...x,
                                          participation: {
                                            ...x.participation,
                                            [id]: {
                                              ...(x.participation[id] || {
                                                adults: d.adults,
                                                children:
                                                  d.children +
                                                  d.childrenWithoutBed,
                                              }),
                                              [key]: +e.target.value,
                                            },
                                          },
                                        }
                                      : x,
                                  ),
                                )
                              }
                            />
                          </Field>
                        ))}
                      </div>
                      <Choice
                        label="Move to day"
                        value=""
                        options={d.days.flatMap((x, n) =>
                          n !== index &&
                          x.city === day.city &&
                          !x.activities.includes(id)
                            ? [{ id: String(n + 1), name: "Day " + (n + 1) }]
                            : [],
                        )}
                        onChange={(v) => {
                          if (!v) return;
                          patch(
                            "days",
                            d.days.map((x, n) =>
                              n === index
                                ? {
                                    ...x,
                                    activities: x.activities.filter(
                                      (a) => a !== id,
                                    ),
                                  }
                                : n === +v - 1
                                  ? {
                                      ...x,
                                      activities: [...x.activities, id],
                                      participation: {
                                        ...x.participation,
                                        [id]: day.participation[id] || {
                                          adults: d.adults,
                                          children:
                                            d.children + d.childrenWithoutBed,
                                        },
                                      },
                                    }
                                  : x,
                            ),
                          );
                        }}
                      />
                    </div>
                  ))}
                  <Choice
                    label="Add activity"
                    value=""
                    options={opts("activity").filter(
                      (a) =>
                        a.city === day.city && !day.activities.includes(a.id),
                    )}
                    onChange={(id) =>
                      id &&
                      patch(
                        "days",
                        d.days.map((x, n) =>
                          n === index
                            ? { ...x, activities: [...x.activities, id] }
                            : x,
                        ),
                      )
                    }
                  />
                  <Field label="Day notes">
                    <textarea
                      rows={2}
                      value={day.notes}
                      placeholder="Arrival timing, travel notes or special requests…"
                      onChange={(e) =>
                        patch(
                          "days",
                          d.days.map((x, n) =>
                            n === index ? { ...x, notes: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            number="05"
            title="Select hotels"
            subtitle="Choose a hotel for each city. Rates depend on the meal plan and stay month."
          >
            {d.cities.map((c, index) => {
              const offset = d.cities
                .slice(0, index)
                .reduce((n, x) => n + x.nights, 0);
              const start = d.start ? dateAt(d.start, offset) : "";
              const hotels = opts("hotel").filter((h) => h.city === c.city);
              return (
                <div className="city-hotels" key={index}>
                  <h3>
                    <MapPin size={17} />
                    {name(c.city)} <span>{c.nights} nights</span>
                  </h3>
                  <div className="hotel-grid">
                    {hotels.map((h) => {
                      const plan = h.plans.find(
                        (p) =>
                          p.meal === d.meal &&
                          p.year === +(start.slice(0, 4) || "0"),
                      );
                      const rate =
                        plan?.prices[+(start.slice(5, 7) || "1") - 1];
                      return (
                        <button
                          className={
                            "hotel-card " + (c.hotel === h.id ? "selected" : "")
                          }
                          key={h.id}
                          onClick={() =>
                            patch(
                              "cities",
                              d.cities.map((x, n) =>
                                n === index ? { ...x, hotel: h.id } : x,
                              ),
                            )
                          }
                        >
                          <Photo src={h.images[0]} alt={h.name} />
                          <div className="hotel-info">
                            <span className="stars">
                              {"★".repeat(h.rating)}
                            </span>
                            <h4>{h.name}</h4>
                            <p>
                              {rate !== null && rate !== undefined
                                ? money(rate) + " / room / night"
                                : "Choose meal plan / check rates"}
                            </p>
                            <span className="select-label">
                              {c.hotel === h.id ? "Selected ✓" : "Select hotel"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {!hotels.length && (
                    <p className="hint">
                      No hotels available. Ask admin to add hotels for this
                      city.
                    </p>
                  )}
                </div>
              );
            })}
          </Panel>
          <Panel number="06" title="Price & package notes">
            <div className="form-grid">
              <Choice
                label="Your quotation markup"
                value={d.markupType}
                options={[
                  { id: "fixed", name: "Fixed amount ₹" },
                  { id: "percent", name: "Percentage %" },
                ]}
                onChange={(v) => patch("markupType", v)}
              />
              <Field
                label={
                  d.markupType === "percent" ? "Markup %" : "Markup amount ₹"
                }
              >
                <input
                  type="number"
                  min="0"
                  value={d.markup}
                  onChange={(e) => patch("markup", +e.target.value)}
                />
              </Field>
            </div>
            <Field label="Inclusions">
              <textarea
                rows={5}
                value={d.inclusions}
                onChange={(e) => patch("inclusions", e.target.value)}
              />
            </Field>
            <Field label="Exclusions">
              <textarea
                rows={5}
                value={d.exclusions}
                onChange={(e) => patch("exclusions", e.target.value)}
              />
            </Field>
          </Panel>
        </div>
        <aside className="quote-summary">
          <div className="summary-top">
            <span className="eyebrow">YOUR QUOTATION</span>
            <h2>{d.cities.map((c) => name(c.city)).join(" & ")}</h2>
            <p>{d.client || "Guest name"}</p>
          </div>
          <div className="summary-body">
            <div className="summary-facts">
              <span>
                <CalendarDays size={16} />
                {totalNights > 0 ? totalNights + " nights" : "Choose dates"}
              </span>
              <span>
                <Hotel size={16} />
                {d.rooms} rooms
              </span>
              <span>
                {d.adults} adults · {d.children + d.childrenWithoutBed} children
              </span>
            </div>
            {estimate ? (
              ["Hotels", "Cab", "Activities", "Special transfers"].map(
                (cat) => (
                  <div className="cost-row" key={cat}>
                    <span>{cat}</span>
                    <strong>
                      {money(
                        estimate!.lines
                          .filter((l) => l.category === cat)
                          .reduce((s, l) => s + l.total, 0),
                      )}
                    </strong>
                  </div>
                ),
              )
            ) : (
              <p className="hint">
                Complete your route, hotels and itinerary to calculate the
                price.
              </p>
            )}
            {estimate && (
              <div className="cost-row">
                <span>Your markup</span>
                <strong>{money(estimate.addedMarkup)}</strong>
              </div>
            )}
            <div className="total">
              <span>Package total</span>
              <strong>{estimate ? money(estimate.total) : "—"}</strong>
            </div>
            <button
              disabled={busy}
              className="primary wide"
              onClick={async () => {
                setBusy(true);
                try {
                  const { quote } = await api("quotes", "POST", {
                    ...d,
                    _id: savedId,
                  });
                  onGenerated(quote);
                } catch (e) {
                  onError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Generating…" : "Generate quotation"}
              <ArrowRight size={18} />
            </button>
            <button
              className="secondary wide"
              style={{ marginTop: 14 }}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const { quote } = await api("quotes", "POST", {
                    ...d,
                    _action: "draft",
                    _id: savedId,
                  });
                  setSavedId(quote.id);
                  setNotice("Draft saved. Resume it from Saved quotations.");
                } catch (e) {
                  onError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save draft
            </button>
            {notice && (
              <p className="info-note" role="status">
                {notice}
              </p>
            )}
            {estimate?.allocation.map((r) => (
              <div className="cost-row" key={r.category}>
                <span>
                  {r.category} × {r.quantity}
                  <small>
                    {money(r.unitPrice)} each
                    {r.rounding > 0 ? ` + ${money(r.rounding)} rounding` : ""}
                  </small>
                </span>
                <strong>{money(r.total)}</strong>
              </div>
            ))}
            <p className="hint">
              Review the preview before downloading the client PDF.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
