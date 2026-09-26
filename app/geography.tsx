"use client";
import { useState } from "react";
import { api, Field } from "./ui";
export function GeographyLookup({
  kind,
  state,
  country,
  onCountry,
  onSelect,
}: {
  kind: string;
  state: string;
  country: string;
  onCountry: (v: string) => void;
  onSelect: (v: string) => void;
}) {
  const [names, setNames] = useState<string[]>([]),
    [countries, setCountries] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function load(level: string) {
    setBusy(true);
    setError("");
    try {
      const r = await api(
        "geography?" + new URLSearchParams({ level, country, state }),
      );
      level === "countries" ? setCountries(r.names) : setNames(r.names);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <h2>Find a {kind}</h2>
      <p className="hint">
        Use the location directory, or enter the name manually below.
      </p>
      <div className="form-grid">
        <Field label="Country">
          <input
            list="countries"
            value={country}
            onChange={(e) => {
              onCountry(e.target.value);
              setNames([]);
            }}
          />
          <datalist id="countries">
            {countries.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>
        <div className="row-actions">
          <button
            disabled={busy}
            className="secondary"
            onClick={() => load("countries")}
          >
            Load countries
          </button>
          <button
            disabled={busy || (kind === "city" && !state)}
            className="secondary"
            onClick={() => load(kind === "state" ? "states" : "cities")}
          >
            {busy ? "Loading…" : "Find locations"}
          </button>
        </div>
      </div>
      {kind === "city" && !state && (
        <p className="hint">Select a state in Details first.</p>
      )}
      {names.length > 0 && (
        <Field label="Search locations">
          <input list="locations" onChange={(e) => onSelect(e.target.value)} />
          <datalist id="locations">
            {names.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>
      )}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
    </section>
  );
}
