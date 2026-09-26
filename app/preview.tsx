"use client";
import { useState } from "react";
import {
  Download,
  Pencil,
  Car,
  MapPin,
  Check,
  CalendarDays,
} from "lucide-react";
import { type Quote, money, nights } from "@/lib/model";
import { Panel, Photo, Field, api } from "./ui";
export function Preview({
  q,
  onEdit,
  onError,
  onUpdated,
}: {
  q: Quote;
  onUpdated: (q: Quote) => void;
  onEdit: () => void;
  onError: (s: string) => void;
}) {
  const name = (id: string) => q.labels[id] || id;
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState("");
  const d = q.draft;
  const [editing, setEditing] = useState(false),
    [saving, setSaving] = useState(false),
    [content, setContent] = useState({
      client: d.client,
      inclusions: d.inclusions,
      exclusions: d.exclusions,
      notes: d.days.map((x) => ({ title: x.title, notes: x.notes })),
    });
  async function download() {
    setDownloading(true);
    try {
      const r = await fetch("/api/pdf?id=" + q.id);
      if (!r.ok) {
        const data: any = await r.json();
        throw Error(data.error || "PDF could not be generated.");
      }
      const blob = await r.blob();
      if (ready) URL.revokeObjectURL(ready);
      const url = URL.createObjectURL(blob);
      setReady(url);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "Quotation_" + d.client.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";
      a.click();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            QUOTATION / {q.id.slice(0, 8).toUpperCase()}
          </p>
          <h1>{d.cities.map((c) => name(c.city)).join(" & ")}</h1>
          <p>
            Prepared for {d.client} · {d.start} to {d.end}
          </p>
        </div>
        <div className="row-actions">
          <button className="secondary" onClick={() => setEditing(!editing)}>
            Edit notes
          </button>
          <a
            className="secondary"
            target="_blank"
            rel="noreferrer"
            href={"/api/pdf?id=" + q.id + "&preview=1"}
          >
            Preview PDF
          </a>
          <button className="secondary" onClick={onEdit}>
            <Pencil size={17} />
            Edit services / recalculate copy
          </button>
          <button className="primary" disabled={downloading} onClick={download}>
            <Download size={17} />
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
      </div>
      {editing && (
        <Panel title="Edit text" subtitle="Saved rates and totals stay fixed.">
          <Field label="Guest name">
            <input
              value={content.client}
              onChange={(e) =>
                setContent({ ...content, client: e.target.value })
              }
            />
          </Field>
          {content.notes.map((day, i) => (
            <div key={i}>
              <Field label={`Day ${i + 1} title`}>
                <input
                  value={day.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      notes: content.notes.map((x, n) =>
                        n === i ? { ...x, title: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field label={`Day ${i + 1} notes`}>
                <textarea
                  value={day.notes}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      notes: content.notes.map((x, n) =>
                        n === i ? { ...x, notes: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
            </div>
          ))}
          {(["inclusions", "exclusions"] as const).map((key) => (
            <Field key={key} label={key}>
              <textarea
                value={content[key]}
                onChange={(e) =>
                  setContent({ ...content, [key]: e.target.value })
                }
              />
            </Field>
          ))}
          <button
            className="primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const r = await api("quotes", "POST", {
                  ...content,
                  _id: q.id,
                  _action: "content",
                });
                onUpdated(r.quote);
                setEditing(false);
              } catch (e) {
                onError((e as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            Save text changes
          </button>
        </Panel>
      )}
      {ready && (
        <div className="notice">
          PDF is ready.{" "}
          <a href={ready} download={"Quotation_" + q.id.slice(0, 8) + ".pdf"}>
            Click here if your download did not start.
          </a>{" "}
          <a href={"/api/pdf?id=" + q.id} target="_blank" rel="noreferrer">
            Open direct download
          </a>
        </div>
      )}
      <div className="proposal-cover">
        <div>
          <p className="eyebrow">{q.company.name}</p>
          <h2>Your next chapter starts here.</h2>
          <p>
            {nights(d.start, d.end)} nights · {d.rooms} rooms · {d.adults}{" "}
            adults · {d.children + d.childrenWithoutBed} children
          </p>
        </div>
        {q.company.images[0] && (
          <img
            className="company-logo"
            src={q.company.images[0]}
            alt={q.company.name}
          />
        )}
      </div>
      <div className="builder-layout">
        <div>
          <Panel title="Your day-wise itinerary">
            {d.days.map((day, index) => (
              <div className="timeline-day" key={day.date}>
                <div className="timeline-marker">{index + 1}</div>
                <div className="timeline-content">
                  <h3>
                    Day {index + 1} · {day.title || name(day.city)}
                  </h3>
                  <p className="date-meta">{day.date}</p>
                  {day.activities.map((id) => {
                    const a = q.activities.find((x) => x.id === id);
                    return a ? (
                      <article className="activity-card" key={id}>
                        {a.images[0] && (
                          <Photo src={a.images[0]} alt={a.name} />
                        )}
                        <div>
                          <h4>{a.name}</h4>
                          <p className="preserve">
                            {a.description || "Details to be confirmed."}
                          </p>
                        </div>
                      </article>
                    ) : null;
                  })}
                  {day.notes && (
                    <p className="day-note preserve">{day.notes}</p>
                  )}
                  {!day.activities.length && !day.notes && (
                    <p>Leisure / activities to be confirmed.</p>
                  )}
                </div>
              </div>
            ))}
          </Panel>
          <Panel title="Your stays">
            {q.hotels.map((h, i) => (
              <article className="stay-card" key={i}>
                <Photo src={h.images[0]} alt={h.name} />
                <div>
                  <span className="stars">{"★".repeat(h.rating)}</span>
                  <h3>{h.name}</h3>
                  <p>
                    {name(h.city)} · {d.cities[i].nights} nights · {d.rooms}{" "}
                    rooms
                  </p>
                  <span className="badge">{name(d.meal)}</span>
                  <p className="preserve">{h.description}</p>
                </div>
              </article>
            ))}
          </Panel>
          {(d.inclusions || d.exclusions) && (
            <Panel title="Package details">
              <div className="form-grid">
                <div>
                  <h3>Inclusions</h3>
                  <p className="preserve">{d.inclusions || "Not specified."}</p>
                </div>
                <div>
                  <h3>Exclusions</h3>
                  <p className="preserve">{d.exclusions || "Not specified."}</p>
                </div>
              </div>
            </Panel>
          )}
          <Panel title="Terms & conditions">
            <p className="preserve">{q.company.terms}</p>
          </Panel>
        </div>
        <aside>
          <div className="teal-card">
            <Car />
            <h3>Pickup & drop</h3>
            <p>{q.vehicle?.name || "No daily cab"}</p>
            <div className="light-inset">
              <small>Pickup from</small>
              <strong>{name(d.pickup) || "Not selected"}</strong>
            </div>
            <div className="light-inset">
              <small>Drop to</small>
              <strong>{name(d.drop) || "Not selected"}</strong>
            </div>
            {q.vehicle && (
              <p>
                {d.vehicles} vehicle(s) · {d.cabDays} days
              </p>
            )}
          </div>
          <div className="teal-card">
            <h3>Special transfers</h3>
            {q.transfers.length ? (
              q.transfers.map((t) => <p key={t.id}>{t.name}</p>)
            ) : (
              <p>None selected</p>
            )}
          </div>
          <div className="panel">
            <h3>Costing details</h3>
            {q.lines.map((l, i) => (
              <div className="cost-row" key={i}>
                <span>{l.name}</span>
                <strong>{money(l.total)}</strong>
              </div>
            ))}
            <div className="cost-row">
              <span>Your quotation markup</span>
              <strong>{money(q.addedMarkup)}</strong>
            </div>
            <p className="hint">
              The client PDF includes the final selling price; markup is not
              listed.
            </p>
            <div className="total">
              <span>Total package</span>
              <strong>{money(q.total)}</strong>
            </div>
            {q.allocation?.map((r) => (
              <div className="cost-row" key={r.category}>
                <span>
                  {r.category} × {r.quantity}
                  <small>
                    {money(r.unitPrice)} per person
                    {r.rounding > 0 ? ` + ${money(r.rounding)} rounding` : ""}
                  </small>
                </span>
                <strong>{money(r.total)}</strong>
              </div>
            ))}
          </div>
          <div className="contact-card">
            <strong>{q.company.name}</strong>
            <a href={"tel:" + q.company.phone}>{q.company.phone}</a>
            <span>{q.company.email}</span>
          </div>
        </aside>
      </div>
    </>
  );
}
