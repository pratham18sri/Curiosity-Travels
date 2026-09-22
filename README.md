# Curiosity Travel Portal

Fresh staff and travel-agent quotation portal for Curiosity Travel, 9909000642.

## First use
Open the private Site while signed into the owner ChatGPT account. Create the owner login and a password of at least 12 characters. The server verifies the platform-supplied owner email against the configured OWNER_EMAIL before permitting initial setup. No default passwords or production demo rates are included.

Add states, cities, meal plans, pickup/drop points, hotels, daily cab rates, sightseeing activities, optional special transfers, and company/PDF details. Create staff and agents in their respective sections. Agent margins are applied server-side; original rates and assigned percentages are not returned to agents. Agents see only their own quotations. Site-level sharing remains private until the owner explicitly changes or grants visitor access; creating an application account does not override that outer access policy.

## Pricing
- Room per night includes two adults. Extra adults are part of total adult count, and extra-adult and child-bed charges apply each night.
- Hotel rates are selected for each night's actual calendar month/year.
- Cab prices are per vehicle/day, starting on arrival; include sufficient seats for adults and children.
- Activity prices are per adult and per child. Regular activity transport is included in the cab; selected special transfers add their separate package amount.
- Missing rates block generation instead of silently using zero. Enter zero explicitly for an included service.
- Assigned agent uplift applies to the source service rates; the quotation's own fixed/percentage markup applies afterwards.
- The PDF shows a package total and explicitly labelled per-guest average, not invented separate adult/child tariffs.

## Itineraries and PDFs
Auto-build draws from the active activity catalogue, using city, arrival/departure/enroute stage, suggested city day and activity duration. It is a catalogue-based suggestion, not a live route, opening-hour or availability check. Review each day and edit notes before generating. Saved quotations retain their quoted rates and content. Editing creates a new quotation using current rates.

PDF export runs on the server and downloads a PDF attachment with cover, trip summary, day details, hotels, cab/transfers, price, inclusions/exclusions and terms. Uploaded JPG/PNG files are supported up to 5 MB each; a PDF's selected photos must total no more than 30 MB.

## Runtime
Vinext/React, Cloudflare-compatible Worker, D1 (`DB`) and R2 (`MEDIA`). Schema-only migrations are in drizzle/. Runtime configuration is managed by Sites. Keep OWNER_EMAIL configured for first owner setup. ADMIN_SETUP_KEY is an optional development/bootstrap fallback and is not configured in production. Never commit runtime secrets.

## Validation
TypeScript and production builds passed. API-handler integration tests exercised real SQLite queries with a local in-memory D1 adapter: initial setup, session cookies, login/logout, cross-month pricing, child/extra adult prices, missing rates, agent uplift, staff base prices, admin-only access, quote/PDF tenant isolation, saved quote retrieval and PDF bytes. PDF sample pages were rendered and visually inspected. Browser inspection confirmed the login/setup screen. Authenticated UI end-to-end checks remain for the owner after first setup.
