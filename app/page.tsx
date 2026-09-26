"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Compass,
  ArrowRight,
  Phone,
  Hotel,
  Car,
  Route,
  Menu,
  X,
} from "lucide-react";
export default function Homepage() {
  const [open, setOpen] = useState(false),
    [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/public")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);
  return (
    <main className="public-home">
      <header className="public-nav">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Compass />
          </span>
          <div>
            <strong>{data?.company?.name || "Curiosity Travel"}</strong>
            <small>TRAVEL WORKSPACE</small>
          </div>
        </Link>
        <button
          className="icon-btn mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
          <a href="#destinations">Destinations</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <Link className="secondary" href="/portal">
            Staff / agent login <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <section className="public-hero">
        <img
          src={data?.cms?.images?.[0] || "/shimla-reference.jpeg"}
          alt="Green Himalayan mountain valley"
        />
        <div className="public-hero-shade" />
        <div className="public-hero-content">
          <p className="eyebrow">A WORLD OF POSSIBILITIES</p>
          <h1>
            {data?.cms?.name || "Every great journey starts with curiosity."}
          </h1>
          <p>
            {data?.cms?.description ||
              "From the first idea to the final itinerary, let’s make your next journey feel like yours."}
          </p>
          <div className="row-actions">
            <Link className="white-btn" href="/portal/quotes/new">
              Generate quotation <ArrowRight size={18} />
            </Link>
            <a className="hero-contact" href="tel:+919909000642">
              <Phone size={17} />
              Talk to our team
            </a>
          </div>
        </div>
      </section>
      <section className="public-section" id="destinations">
        <p className="eyebrow">WHERE NEXT?</p>
        <h2>Find your kind of escape.</h2>
        <div className="destination-grid">
          {[
            [
              "01",
              "Mountains & valleys",
              "Slow mornings, winding roads and a new view around every turn.",
            ],
            [
              "02",
              "Coasts & islands",
              "Sea breezes, island days and time to unwind.",
            ],
            [
              "03",
              "Culture & discovery",
              "Explore the places and stories that spark your curiosity.",
            ],
          ].map(([n, title, desc]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <a href="tel:+919909000642">Discuss your trip →</a>
            </article>
          ))}
        </div>
      </section>
      <section className="public-about" id="about">
        <div>
          <p className="eyebrow">CURIOSITY TRAVEL</p>
          <h2>
            A thoughtful plan.
            <br />
            Room for discovery.
          </h2>
          <p>
            We bring destinations, stays and day-by-day experiences into one
            clear proposal. Tell us who is travelling and what matters to you.
            We’ll help shape the details.
          </p>
        </div>
        <div className="service-grid">
          {[
            [
              Hotel,
              "Stays & meals",
              "Accommodation and meal plans to suit your trip.",
            ],
            [
              Car,
              "Transport & transfers",
              "Plan pickups, road journeys and departure.",
            ],
            [
              Route,
              "Personal itineraries",
              "See how each day fits together before you travel.",
            ],
          ].map(([Icon, title, desc]: any) => (
            <article key={title}>
              <Icon />
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="public-section">
        <p className="eyebrow">FROM IDEA TO ITINERARY</p>
        <h2>Your next trip, in three steps.</h2>
        <div className="process-grid">
          {[
            [
              "01",
              "Share your plans",
              "Tell us your dates, destinations and preferences.",
            ],
            [
              "02",
              "Shape the journey",
              "Review stays, transport and daily experiences.",
            ],
            [
              "03",
              "Review your proposal",
              "Check your quotation before confirming services.",
            ],
          ].map(([n, title, desc]) => (
            <article key={n}>
              <b>{n}</b>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="public-contact" id="contact">
        <div>
          <p className="eyebrow">LET’S PLAN SOMETHING</p>
          <h2>Where will curiosity take you?</h2>
          <p>Speak with our team about your next journey.</p>
        </div>
        <a href="tel:+919909000642" className="white-btn">
          <Phone size={18} />
          +91 9909000642
        </a>
      </section>
      <footer className="public-footer">
        <strong>Curiosity Travel</strong>
        <p>Travel, thoughtfully planned.</p>
        <Link href="/portal">Staff & agent workspace →</Link>
      </footer>
    </main>
  );
}
