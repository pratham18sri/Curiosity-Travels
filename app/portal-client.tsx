"use client";
import { useEffect, useState } from "react";
import {
  Compass,
  Plus,
  LayoutDashboard,
  Building2,
  Car,
  MapPin,
  Utensils,
  Users,
  FileText,
  Settings,
  LogOut,
  ArrowRight,
  Image,
  Phone,
  Shield,
  CalendarDays,
  Route,
  Armchair,
  Globe,
  Loader2,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  type User,
  type Item,
  type Kind,
  type Quote,
  type Draft,
  defaultCompany,
  money,
} from "@/lib/model";
import { api, Field, Panel } from "./ui";
import { Catalog, Accounts, titles } from "./admin";
import { Builder } from "./builder";
import { Preview } from "./preview";
const links = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["create", "Create quotation", Plus],
  ["saved", "Saved quotations", FileText],
  ["hotel", "Hotels", Building2],
  ["vehicle", "Daily cab rates", Car],
  ["activity", "Sightseeing & activities", Compass],
  ["transfer", "Special transfers", Route],
  ["agent", "Travel agents", Users],
  ["staff", "Staff accounts", Shield],
  ["state", "States", Globe],
  ["city", "Cities", MapPin],
  ["meal", "Meal plans", Utensils],
  ["pickup", "Pickup & drop", MapPin],
  ["vehicleType", "Vehicle types", Car],
  ["seater", "Seating capacities", Armchair],
  ["cms", "Homepage content", Image],
  ["settings", "Company & PDF", Settings],
  ["template", "Itinerary templates", CalendarDays],
] as const;
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [setup, setSetup] = useState(false);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [ownerVerified, setOwnerVerified] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [company, setCompany] = useState(defaultCompany);
  const [view, setView] = useState("dashboard");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [draftId, setDraftId] = useState<string>();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | undefined>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [builderKey, setBuilderKey] = useState(0);
  async function refresh() {
    const [c, q] = await Promise.all([api("catalog"), api("quotes")]);
    setItems(c.items);
    setCompany(c.company);
    setQuotes(q.quotes);
  }
  async function auth() {
    try {
      const a = await api("auth");
      setUser(a.user);
      setSetup(!!a.needsSetup);
      setSetupAvailable(!!a.setupAvailable);
      setOwnerVerified(!!a.ownerVerified);
      if (a.user) await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    const view =
      window.location.hash.slice(1) ||
      (window.location.pathname.endsWith("/quotes/new")
        ? "create"
        : window.location.pathname.endsWith("/quotes")
          ? "saved"
          : "dashboard");
    if (links.some((l) => l[0] === view)) setView(view);
    void auth();
  }, []);
  function navigate(v: string) {
    setView(v);
    window.history.replaceState(null, "", "/portal#" + v);
    if (v === "saved") void refresh();
    setError("");
    setMessage("");
    if (v === "create") {
      setDraftId(undefined);
      setDraft(undefined);
      setBuilderKey((k) => k + 1);
    }
  }
  async function openQuote(id: string) {
    try {
      const q = (await api("quotes?id=" + id)).quote;
      setQuote(q);
      if (q.status === "draft") {
        setDraft(q.draft);
        setDraftId(q.id);
        setBuilderKey((k) => k + 1);
        setView("create");
      } else setView("preview");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (!loaded)
    return (
      <div className="loading">
        <Compass className="spin" />
        <p>Opening your travel workspace…</p>
      </div>
    );
  if (!user)
    return (
      <main className="login-page">
        <div className="login-visual">
          <img src="/shimla-reference.jpeg" alt="Himalayan mountain valley" />
          <div className="login-overlay">
            <div className="brand">
              <span className="brand-icon">
                <Compass />
              </span>
              <div>
                <strong>CURIOSITY</strong>
                <small>TRAVEL</small>
              </div>
            </div>
            <div>
              <p className="eyebrow">A WORLD OF POSSIBILITIES</p>
              <h1>
                Every great journey
                <br />
                starts with curiosity.
              </h1>
              <p>Your travel planning workspace.</p>
            </div>
            <span>Curiosity Travel · 9909000642</span>
          </div>
        </div>
        <div className="login-form">
          <div className="login-inner">
            <span className="round-icon">
              <Compass size={30} />
            </span>
            <p className="eyebrow">CURIOSITY TRAVEL PORTAL</p>
            <h2>{setup ? "Set up your workspace" : "Welcome back."}</h2>
            <p>
              {setup
                ? "Create the owner account to begin adding your rates and team."
                : "Sign in to plan journeys and create quotations."}
            </p>
            {error && (
              <div role="alert" className="notice error">
                {error}
              </div>
            )}
            {setup && !setupAvailable && (
              <div className="notice">
                Owner setup is not enabled yet. The portal administrator must
                configure the setup key before the first login.
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  await api("auth", "POST", {
                    action: setup ? "setup" : "login",
                    login,
                    password,
                    setupKey,
                  });
                  setPassword("");
                  setSetupKey("");
                  await auth();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="Login ID">
                <input
                  autoComplete="username"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  autoComplete={setup ? "new-password" : "current-password"}
                  required
                  minLength={setup ? 12 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {setup && !ownerVerified && (
                <Field label="Owner setup key">
                  <input
                    type="password"
                    required
                    value={setupKey}
                    onChange={(e) => setSetupKey(e.target.value)}
                  />
                </Field>
              )}
              <button
                className="primary wide"
                disabled={busy || (setup && !setupAvailable)}
              >
                {busy
                  ? "Please wait…"
                  : setup
                    ? "Create owner account"
                    : "Sign in"}
                <ArrowRight size={18} />
              </button>
            </form>
            <p className="hint">
              Staff and agent accounts are created by Curiosity Travel.
            </p>
            <a className="login-phone" href="tel:+919909000642">
              <Phone size={15} />
              9909000642
            </a>
          </div>
        </div>
      </main>
    );
  const brand = user.role === "agent" ? user.company : company.name;
  const cms = items.find((i) => i.kind === "cms");
  return (
    <SidebarProvider>
      <Sidebar className="travel-sidebar">
        <SidebarHeader>
          <div className="brand">
            <span className="brand-icon">
              <Compass />
            </span>
            <div>
              <strong>{brand}</strong>
              <small>TRAVEL WORKSPACE</small>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {links
              .filter(
                ([key]) =>
                  user.role === "admin" ||
                  ["dashboard", "create", "saved"].includes(key),
              )
              .map(([key, title, Icon]) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    isActive={view === key}
                    onClick={() => navigate(key)}
                  >
                    <Icon size={18} />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="sidebar-contact">
            <Phone size={15} />
            <span>9909000642</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="topbar">
          <div>
            <SidebarTrigger />
            <span>
              Travel portal <span className="slash">/</span>{" "}
              {view === "preview"
                ? "Quotation preview"
                : links.find((l) => l[0] === view)?.[1]}
            </span>
          </div>
          <div className="user-chip">
            <span className="avatar">{user.name.slice(0, 1)}</span>
            <span>
              {user.name}
              <small>{user.role}</small>
            </span>
            <button
              aria-label="Sign out"
              className="icon-btn"
              onClick={async () => {
                try {
                  await api("auth", "POST", { action: "logout" });
                  setUser(null);
                  setItems([]);
                  setQuotes([]);
                  setQuote(null);
                  setDraft(undefined);
                  setView("dashboard");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="workspace">
          {error && (
            <div className="notice error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}
          {message && (
            <div className="notice" role="status">
              {message}
            </div>
          )}
          {view === "dashboard" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">YOUR WORKSPACE</p>
                  <h1>Welcome, {user.name.split(" ")[0]}.</h1>
                  <p>Everything you need for the next journey.</p>
                </div>
                <button className="primary" onClick={() => navigate("create")}>
                  <Plus size={18} />
                  Create quotation
                </button>
              </div>
              <section className="dashboard-feature">
                <img
                  src={cms?.images[0] || "/shimla-reference.jpeg"}
                  alt="Travel destination"
                />
                <div>
                  <span className="eyebrow">CURIOSITY TRAVEL</span>
                  <h2>
                    {cms?.name ||
                      "A little curiosity.\nAn extraordinary journey."}
                  </h2>
                  <p>
                    {cms?.description ||
                      "Turn your travel expertise into a beautifully planned itinerary."}
                  </p>
                  <button
                    className="white-btn"
                    onClick={() => navigate("create")}
                  >
                    Plan a journey
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
              <div className="stat-grid">
                {[
                  [FileText, "Saved quotations", quotes.length],
                  [
                    Building2,
                    "Hotels",
                    items.filter((i) => i.kind === "hotel" && i.active).length,
                  ],
                  [
                    Compass,
                    "Activities",
                    items.filter((i) => i.kind === "activity" && i.active)
                      .length,
                  ],
                  [
                    Car,
                    "Cab options",
                    items.filter((i) => i.kind === "vehicle" && i.active)
                      .length,
                  ],
                ].map(([Icon, label, value]: any) => (
                  <div className="stat-card" key={label}>
                    <span>
                      <Icon size={22} />
                    </span>
                    <div>
                      <strong>{value}</strong>
                      <p>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user.role === "admin" &&
                !items.some((i) => i.kind === "hotel") && (
                  <Panel
                    title="Set up your travel catalogue"
                    subtitle="Add your own contracted rates before creating live quotations."
                  >
                    <div className="setup-steps">
                      {[
                        ["state", "1. States & cities"],
                        ["meal", "2. Meal plans"],
                        ["hotel", "3. Hotels & monthly rates"],
                        ["vehicle", "4. Vehicles & daily rates"],
                        ["activity", "5. Sightseeing activities"],
                        ["agent", "6. Staff & agents"],
                      ].map(([v, t]) => (
                        <button
                          className="secondary"
                          key={v}
                          onClick={() => navigate(v)}
                        >
                          {t}
                          <ArrowRight size={15} />
                        </button>
                      ))}
                    </div>
                  </Panel>
                )}
              <Panel title="Recent quotations">
                {quotes.slice(0, 5).map((q) => (
                  <button
                    className="saved-row"
                    key={q.id}
                    onClick={() => openQuote(q.id)}
                  >
                    <span className="file-icon">
                      <FileText />
                    </span>
                    <span>
                      <strong>
                        {q.client || "Untitled draft"}{" "}
                        {q.status === "draft" && (
                          <span className="badge">Draft</span>
                        )}
                      </strong>
                      <small>
                        {q.start} · Created {q.created.slice(0, 10)}
                      </small>
                    </span>
                    <strong>{money(q.total)}</strong>
                    <ArrowRight size={18} />
                  </button>
                ))}
                {!quotes.length && (
                  <div className="empty">
                    <FileText />
                    <h3>Your first journey starts here</h3>
                    <p>
                      Saved quotations will appear here after you generate them.
                    </p>
                  </div>
                )}
              </Panel>
            </>
          )}
          {view === "create" && (
            <Builder
              key={builderKey}
              initial={draft}
              draftId={draftId}
              company={company}
              items={items}
              onError={setError}
              onGenerated={(q) => {
                setQuote(q);
                setView("preview");
                void refresh();
              }}
            />
          )}
          {view === "preview" && quote && (
            <Preview
              key={quote.id}
              q={quote}
              onUpdated={(q) => {
                setQuote(q);
                void refresh();
              }}
              onError={setError}
              onEdit={() => {
                setDraftId(undefined);
                setDraft(quote.draft);
                setBuilderKey((k) => k + 1);
                setView("create");
                setMessage(
                  "Editing a copy. Current rates apply when you generate the revised quotation.",
                );
              }}
            />
          )}
          {view === "saved" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">READY WHEN YOU ARE</p>
                  <h1>Saved quotations</h1>
                </div>
              </div>
              <Panel title="Quotation history">
                <Field label="Search quotations">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Field>
                {quotes
                  .filter((q) =>
                    (q.client + q.id)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((q) => (
                    <button
                      className="saved-row"
                      key={q.id}
                      onClick={() => openQuote(q.id)}
                    >
                      <span className="file-icon">
                        <FileText />
                      </span>
                      <span>
                        <strong>
                          {q.client || "Untitled draft"}{" "}
                          {q.status === "draft" && (
                            <span className="badge">Draft</span>
                          )}
                        </strong>
                        <small>
                          {q.start} · {q.created.slice(0, 10)}
                        </small>
                      </span>
                      <strong>{money(q.total)}</strong>
                      <ArrowRight size={18} />
                    </button>
                  ))}
                {!quotes.length && (
                  <div className="empty">No saved quotations yet.</div>
                )}
              </Panel>
            </>
          )}
          {user.role === "admin" && (view === "agent" || view === "staff") && (
            <Accounts key={view} role={view} onError={setError} />
          )}
          {user.role === "admin" && view in titles && (
            <Catalog
              key={view}
              kind={view as Kind}
              items={items}
              onError={setError}
              onSaved={async () => {
                await refresh();
                setMessage("Changes saved.");
              }}
            />
          )}
        </main>
        <footer className="app-footer">
          {brand} <span>Travel, thoughtfully planned.</span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
