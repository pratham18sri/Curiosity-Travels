"use client";
import { useState, useEffect } from "react";
import { GeographyLookup } from "./geography";
import { Plus, Save, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  catalogSchema,
  newCatalogDraft,
  defaultCompany,
  type Item,
  type Kind,
  type User,
  money,
} from "@/lib/model";
import { Field, Choice, Check, Photo, Upload, Panel, api, uid } from "./ui";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const titles: Record<Kind, string> = {
  state: "States",
  city: "Cities",
  meal: "Meal plans",
  pickup: "Pickup & drop locations",
  seater: "Seating capacities",
  vehicleType: "Vehicle types",
  hotel: "Hotels",
  vehicle: "Daily cab rates",
  activity: "Sightseeing & activities",
  transfer: "Special / other transfers",
  settings: "Company & PDF",
  cms: "Homepage content",
  template: "Itinerary templates",
};
export function Catalog({
  kind,
  items,
  onSaved,
  onError,
}: {
  kind: Kind;
  items: Item[];
  onSaved: () => Promise<void>;
  onError: (s: string) => void;
}) {
  const singleton = kind === "settings" || kind === "cms";
  const initial = () =>
    items.find((i) => i.kind === kind && singleton) ||
    newCatalogDraft(kind, uid());
  const [edit, setEdit] = useState<Item | null>(singleton ? initial() : null);
  const [search, setSearch] = useState("");
  const [remove, setRemove] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const patch = (key: keyof Item, v: unknown) =>
    setEdit((x) => (x ? { ...x, [key]: v } : x));
  const opts = (k: Kind) => items.filter((i) => i.kind === k && i.active);
  const name = (id: string) => items.find((i) => i.id === id)?.name || "—";
  async function save() {
    if (!edit) return;
    setBusy(true);
    try {
      if (!edit.name.trim()) throw Error("Enter a name before saving.");
      await api("catalog", "POST", { ...edit, name: edit.name.trim() });
      await onSaved();
      if (!singleton) setEdit(null);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const monthly = (
    prices: (number | null)[],
    change: (p: (number | null)[]) => void,
  ) => (
    <div className="month-grid">
      {months.map((m, n) => (
        <Field key={m} label={m}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="No rate"
            value={prices[n] ?? ""}
            onChange={(e) =>
              change(
                prices.map((p, i) =>
                  i === n
                    ? e.target.value === ""
                      ? null
                      : +e.target.value
                    : p,
                ),
              )
            }
          />
        </Field>
      ))}
    </div>
  );
  if (edit)
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">ADMIN / {titles[kind]}</p>
            <h1>
              {singleton
                ? titles[kind]
                : items.some((i) => i.id === edit.id)
                  ? "Edit " + edit.name
                  : "Add " + titles[kind].toLowerCase()}
            </h1>
          </div>
          {!singleton && (
            <button className="secondary" onClick={() => setEdit(null)}>
              <ArrowLeft size={16} />
              Back to list
            </button>
          )}
        </div>
        {["state", "city"].includes(kind) && (
          <GeographyLookup
            kind={kind}
            state={items.find((i) => i.id === edit.state)?.name || ""}
            country={edit.country}
            onCountry={(v) => patch("country", v)}
            onSelect={(v) => patch("name", v)}
          />
        )}
        <Panel title="Details">
          <div className="form-grid">
            <Field label={kind === "settings" ? "Company name" : "Name"}>
              <input
                value={edit.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </Field>
            {!singleton && (
              <Check
                label="Active / available"
                value={edit.active}
                onChange={(v) => patch("active", v)}
              />
            )}
            {[
              "city",
              "pickup",
              "hotel",
              "vehicle",
              "activity",
              "transfer",
              "template",
            ].includes(kind) && (
              <Choice
                label="State"
                value={edit.state}
                onChange={(v) => {
                  patch("state", v);
                  patch("city", "");
                }}
                options={opts("state")}
              />
            )}
            {["hotel", "activity", "template", "pickup"].includes(kind) && (
              <Choice
                label="City"
                value={edit.city}
                onChange={(v) => patch("city", v)}
                options={opts("city").filter((i) => i.state === edit.state)}
              />
            )}
            {kind === "hotel" && (
              <Choice
                label="Star rating"
                value={String(edit.rating)}
                onChange={(v) => patch("rating", +v || 3)}
                options={[1, 2, 3, 4, 5].map((n) => ({
                  id: String(n),
                  name: n + " star",
                }))}
              />
            )}
            {["vehicle", "transfer"].includes(kind) && (
              <>
                <Choice
                  label="Vehicle type"
                  value={edit.vehicleType}
                  onChange={(v) => patch("vehicleType", v)}
                  options={opts("vehicleType")}
                />
                <Choice
                  label="Seating capacity"
                  value={String(edit.seats)}
                  onChange={(v) => patch("seats", +v || 4)}
                  options={[
                    ...new Set([
                      edit.seats,
                      ...opts("seater").map((i) => i.seats),
                    ]),
                  ].map((n) => ({ id: String(n), name: n + " seats" }))}
                />
                <Choice
                  label="Pickup location"
                  value={edit.pickup}
                  onChange={(v) => patch("pickup", v)}
                  options={opts("pickup").filter((i) => i.state === edit.state)}
                  empty="Any pickup"
                />
                <Choice
                  label="Drop location"
                  value={edit.drop}
                  onChange={(v) => patch("drop", v)}
                  options={opts("pickup").filter((i) => i.state === edit.state)}
                  empty="Any drop"
                />
              </>
            )}
            {kind === "seater" && (
              <Field label="Seats (excluding driver)">
                <input
                  type="number"
                  min="1"
                  value={edit.seats}
                  onChange={(e) => patch("seats", +e.target.value)}
                />
              </Field>
            )}
            {kind === "activity" && (
              <>
                <Field label="Adult price · per person">
                  <input
                    type="number"
                    min="0"
                    value={edit.amount}
                    onChange={(e) => patch("amount", +e.target.value)}
                  />
                </Field>
                <Field label="Child price · per person">
                  <input
                    type="number"
                    min="0"
                    value={edit.child}
                    onChange={(e) => patch("child", +e.target.value)}
                  />
                </Field>
                <Choice
                  label="Itinerary placement"
                  value={edit.stage}
                  onChange={(v) => patch("stage", v)}
                  options={["local", "arrival", "enroute", "departure"].map(
                    (s) => ({ id: s, name: s }),
                  )}
                />
                <Field label="Suggested day in city (0 = flexible)">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={edit.day}
                    onChange={(e) => patch("day", +e.target.value)}
                  />
                </Field>
                <Field label="Duration · hours">
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    max="12"
                    value={edit.hours}
                    onChange={(e) => patch("hours", +e.target.value)}
                  />
                </Field>
              </>
            )}
            {kind === "transfer" && (
              <Field
                label="Price · total for this special transfer"
                hint="Charged once when selected; regular transfers use daily cab pricing."
              >
                <input
                  type="number"
                  min="0"
                  value={edit.amount}
                  onChange={(e) => patch("amount", +e.target.value)}
                />
              </Field>
            )}
            {kind === "hotel" && (
              <Field label="Room category">
                <input
                  value={edit.roomCategory}
                  onChange={(e) => patch("roomCategory", e.target.value)}
                />
              </Field>
            )}
            {kind === "transfer" && (
              <Choice
                label="Price basis"
                value={edit.priceBasis}
                onChange={(v) => patch("priceBasis", v)}
                options={["transfer", "vehicle", "person"].map((id) => ({
                  id,
                  name: "Per " + id,
                }))}
              />
            )}
            {kind === "template" && (
              <>
                <Choice
                  label="Day type"
                  value={edit.stage}
                  onChange={(v) => patch("stage", v)}
                  options={["arrival", "local", "enroute", "departure"].map(
                    (id) => ({ id, name: id }),
                  )}
                />
                <Field label="Suggested day (0 = flexible)">
                  <input
                    type="number"
                    min="0"
                    value={edit.day}
                    onChange={(e) => patch("day", +e.target.value)}
                  />
                </Field>
                <div>
                  {opts("activity")
                    .filter((a) => a.city === edit.city)
                    .map((a) => (
                      <Check
                        key={a.id}
                        label={a.name}
                        value={edit.templateActivities.includes(a.id)}
                        onChange={(v) =>
                          patch(
                            "templateActivities",
                            v
                              ? [...edit.templateActivities, a.id]
                              : edit.templateActivities.filter(
                                  (id) => id !== a.id,
                                ),
                          )
                        }
                      />
                    ))}
                </div>
              </>
            )}
            {kind === "settings" && (
              <>
                <Field label="Phone">
                  <input
                    value={edit.phone}
                    onChange={(e) => patch("phone", e.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={edit.email}
                    onChange={(e) => patch("email", e.target.value)}
                  />
                </Field>
                <Field label="Address">
                  <input
                    value={edit.address}
                    onChange={(e) => patch("address", e.target.value)}
                  />
                </Field>
              </>
            )}
          </div>
          {[
            "hotel",
            "activity",
            "transfer",
            "cms",
            "meal",
            "template",
            "vehicle",
          ].includes(kind) && (
            <Field label="Description / places covered / important notes">
              <textarea
                rows={6}
                value={edit.description}
                onChange={(e) => patch("description", e.target.value)}
              />
            </Field>
          )}
        </Panel>
        {kind === "hotel" && (
          <Panel
            title="Meal plans & monthly room rates"
            subtitle="Per room, per night for two adults. Extra adult and child-bed charges are per person, per night."
          >
            {edit.plans.map((p, index) => (
              <div className="rate-block" key={index}>
                <div className="form-grid">
                  <Choice
                    label="Meal plan"
                    value={p.meal}
                    onChange={(v) =>
                      patch(
                        "plans",
                        edit.plans.map((x, i) =>
                          i === index ? { ...x, meal: v } : x,
                        ),
                      )
                    }
                    options={opts("meal")}
                  />
                  <Field label="Year">
                    <input
                      type="number"
                      value={p.year}
                      onChange={(e) =>
                        patch(
                          "plans",
                          edit.plans.map((x, i) =>
                            i === index ? { ...x, year: +e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Extra adult / bed per night">
                    <input
                      type="number"
                      min="0"
                      value={p.extra}
                      onChange={(e) =>
                        patch(
                          "plans",
                          edit.plans.map((x, i) =>
                            i === index ? { ...x, extra: +e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Child with bed per night">
                    <input
                      type="number"
                      min="0"
                      value={p.child}
                      onChange={(e) =>
                        patch(
                          "plans",
                          edit.plans.map((x, i) =>
                            i === index ? { ...x, child: +e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
                <Field
                  label="Child without bed per night"
                  hint="Blank means unavailable; enter 0 only if complimentary."
                >
                  <input
                    type="number"
                    min="0"
                    value={p.childWithoutBed ?? ""}
                    onChange={(e) =>
                      patch(
                        "plans",
                        edit.plans.map((x, i) =>
                          i === index
                            ? {
                                ...x,
                                childWithoutBed:
                                  e.target.value === ""
                                    ? null
                                    : +e.target.value,
                              }
                            : x,
                        ),
                      )
                    }
                  />
                </Field>
                {monthly(p.prices, (v) =>
                  patch(
                    "plans",
                    edit.plans.map((x, i) =>
                      i === index ? { ...x, prices: v } : x,
                    ),
                  ),
                )}
                <button
                  className="text-btn danger"
                  onClick={() =>
                    patch(
                      "plans",
                      edit.plans.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove plan
                </button>
              </div>
            ))}
            <button
              className="secondary"
              onClick={() =>
                patch("plans", [
                  ...edit.plans,
                  {
                    meal: "",
                    year: new Date().getFullYear(),
                    prices: Array(12).fill(null),
                    extra: 0,
                    child: 0,
                    childWithoutBed: null,
                  },
                ])
              }
            >
              <Plus size={16} />
              Add meal plan
            </button>
          </Panel>
        )}
        {kind === "vehicle" && (
          <Panel
            title="Monthly daily cab rates"
            subtitle="Per vehicle, per day. Includes regular sightseeing and transfers."
          >
            <Field label="Rate year">
              <input
                type="number"
                value={edit.year}
                onChange={(e) => patch("year", +e.target.value)}
              />
            </Field>
            {monthly(edit.prices, (v) => patch("prices", v))}
          </Panel>
        )}
        {["hotel", "activity", "settings", "cms"].includes(kind) && (
          <Panel title="Photos">
            {(kind === "hotel"
              ? ["Hotel front", "Bedroom", "Living area", "Balcony view"]
              : kind === "settings"
                ? ["Company logo", "PDF cover image"]
                : kind === "cms"
                  ? ["Homepage image"]
                  : ["Activity image"]
            ).map((s, n) => (
              <Upload
                key={s}
                label={s}
                value={edit.images[n] || ""}
                onChange={(v) => {
                  const arr = [...edit.images];
                  while (arr.length <= n) arr.push("");
                  arr[n] = v;
                  patch("images", arr);
                }}
                onError={onError}
              />
            ))}
          </Panel>
        )}
        {kind === "settings" && (
          <Panel title="PDF content">
            <Field label="Default inclusions">
              <textarea
                rows={5}
                value={edit.inclusions}
                onChange={(e) => patch("inclusions", e.target.value)}
              />
            </Field>
            <Field label="Default exclusions">
              <textarea
                rows={5}
                value={edit.exclusions}
                onChange={(e) => patch("exclusions", e.target.value)}
              />
            </Field>
            <Field label="Terms, payment and cancellation policies">
              <textarea
                rows={10}
                value={edit.terms}
                onChange={(e) => patch("terms", e.target.value)}
              />
            </Field>
          </Panel>
        )}
        <div className="action-bar">
          <button disabled={busy} className="primary" onClick={save}>
            <Save size={18} />
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR TRAVEL INVENTORY</p>
          <h1>{titles[kind]}</h1>
        </div>
        <button className="primary" onClick={() => setEdit(initial())}>
          <Plus size={18} />
          Add new
        </button>
      </div>
      <Panel title={titles[kind]}>
        <div className="search">
          <Search size={18} />
          <input
            aria-label="Search records"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location / details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items
              .filter(
                (i) =>
                  i.kind === kind &&
                  i.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <div className="table-name">
                      {i.images[0] && <img src={i.images[0]} alt="" />}
                      <strong>{i.name}</strong>
                    </div>
                  </TableCell>
                  <TableCell>
                    {i.city
                      ? name(i.city)
                      : i.state
                        ? name(i.state)
                        : i.kind === "seater"
                          ? i.seats + " seats"
                          : i.description.slice(0, 80) || "—"}
                  </TableCell>
                  <TableCell>
                    <span className={"badge " + (!i.active ? "muted" : "")}>
                      {i.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="row-actions">
                      <button
                        aria-label={"Edit " + i.name}
                        className="icon-btn"
                        onClick={() => setEdit(i)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label={"Delete " + i.name}
                        className="icon-btn danger"
                        onClick={() => setRemove(i)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!items.some((i) => i.kind === kind) && (
          <div className="empty">
            <h3>No {titles[kind].toLowerCase()} yet</h3>
            <p>Add your first record to make it available in quotations.</p>
          </div>
        )}
      </Panel>
      <AlertDialog open={!!remove} onOpenChange={(o) => !o && setRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {remove?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Saved quotation snapshots will remain unchanged. Records linked to
              other inventory cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await api("catalog", "DELETE", { id: remove?.id });
                  await onSaved();
                } catch (e) {
                  onError((e as Error).message);
                }
                setRemove(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export function Accounts({
  role,
  onError,
}: {
  role: "agent" | "staff";
  onError: (s: string) => void;
}) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [edit, setEdit] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      setUsers((await api("users")).users);
    } catch (e) {
      onError((e as Error).message);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const patch = (k: string, v: unknown) =>
    setEdit((e: any) => ({ ...e, [k]: v }));
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCESS & BRANDING</p>
          <h1>{role === "agent" ? "Travel agents" : "Staff accounts"}</h1>
        </div>
        <button
          className="primary"
          onClick={() =>
            setEdit({
              role,
              login: "",
              password: "",
              name: "",
              company: role === "staff" ? "Curiosity Travel" : "",
              phone: "",
              email: "",
              address: "",
              logo: "",
              markup: 0,
              active: true,
            })
          }
        >
          <Plus size={18} />
          Add {role}
        </button>
      </div>
      {edit ? (
        <Panel title={edit.id ? "Edit account" : "New account"}>
          <div className="form-grid">
            {["name", "company", "login", "phone", "email", "address"].map(
              (k) => (
                <Field
                  key={k}
                  label={
                    k === "login" ? "Login ID" : k[0].toUpperCase() + k.slice(1)
                  }
                >
                  <input
                    value={edit[k]}
                    onChange={(e) => patch(k, e.target.value)}
                  />
                </Field>
              ),
            )}
            <Field
              label={
                edit.id
                  ? "New password (leave blank to keep)"
                  : "Initial password"
              }
              hint="At least 12 characters; share credentials with the account holder yourself."
            >
              <input
                autoComplete="new-password"
                type="password"
                value={edit.password || ""}
                onChange={(e) => patch("password", e.target.value)}
              />
            </Field>
            {role === "agent" && (
              <Field
                label="Hidden agent markup %"
                hint="Applied to base service rates. The agent never receives this percentage or original rates."
              >
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={edit.markup}
                  onChange={(e) => patch("markup", +e.target.value)}
                />
              </Field>
            )}
            <Check
              label="Account active"
              value={edit.active}
              onChange={(v) => patch("active", v)}
            />
          </div>
          {role === "agent" && (
            <Upload
              label="Agent company logo"
              value={edit.logo}
              onChange={(v) => patch("logo", v)}
              onError={onError}
            />
          )}
          <div className="row-actions">
            <button
              disabled={busy}
              className="primary"
              onClick={async () => {
                setBusy(true);
                try {
                  await api("users", "POST", {
                    ...edit,
                    password: edit.password || undefined,
                  });
                  await refresh();
                  setEdit(null);
                } catch (e) {
                  onError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save account
            </button>
            <button className="secondary" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </Panel>
      ) : (
        <Panel title={role === "agent" ? "Agent directory" : "Staff directory"}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / company</TableHead>
                <TableHead>Login</TableHead>
                {role === "agent" && <TableHead>Hidden markup</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users
                ?.filter((u) => u.role === role)
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <strong>{u.name}</strong>
                      <p>{u.company}</p>
                    </TableCell>
                    <TableCell>{u.login}</TableCell>
                    {role === "agent" && <TableCell>{u.markup}%</TableCell>}
                    <TableCell>{u.active ? "Active" : "Disabled"}</TableCell>
                    <TableCell>
                      <button
                        aria-label={"Edit " + u.name}
                        className="icon-btn"
                        onClick={() => setEdit({ ...u, password: "" })}
                      >
                        <Pencil size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {!users?.some((u) => u.role === role) && (
            <div className="empty">No {role} accounts yet.</div>
          )}
        </Panel>
      )}
    </>
  );
}
