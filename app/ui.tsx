"use client";
import { useId, type ReactNode } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
export const uid = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
export async function api(path: string, method = "GET", body?: unknown) {
  const r = await fetch("/api/" + path, {
    method,
    headers:
      body instanceof FormData ? {} : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data: any = await r.json();
  if (!r.ok) throw Error(data.error || "Request failed. Please try again.");
  return data;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Choice({
  label,
  value,
  onChange,
  options,
  empty = "Select…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  empty?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Select
        value={value || "__empty"}
        onValueChange={(v) => onChange(v === "__empty" ? "" : v)}
      >
        <SelectTrigger id={id} className="pick">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty">{empty}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  const id = useId();
  return (
    <label className="check" htmlFor={id}>
      <Checkbox
        id={id}
        checked={value}
        onCheckedChange={(v) => onChange(v === true)}
      />
      {label}
    </label>
  );
}
export function Photo({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return src ? (
    <img src={src} alt={alt} className={"photo " + className} />
  ) : (
    <div className={"photo no-photo " + className}>No photo uploaded</div>
  );
}
export function Upload({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  onError: (s: string) => void;
}) {
  return (
    <div className="upload">
      <Field label={label}>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              const f = new FormData();
              f.set("file", file);
              const data = await api("media", "POST", f);
              onChange(data.url);
            } catch (e) {
              onError((e as Error).message);
            }
          }}
        />
      </Field>
      {value && (
        <div className="upload-preview">
          <img src={value} alt={label} />
          <button
            type="button"
            className="text-btn"
            onClick={() => onChange("")}
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  );
}
export function Panel({
  number,
  title,
  subtitle,
  children,
}: {
  number?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-title">
        {number && <span className="step">{number}</span>}
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
