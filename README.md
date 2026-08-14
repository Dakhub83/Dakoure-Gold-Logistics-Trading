# Amandla Gold Logistics & Trading — Platform Prototype

Bilingual (EN/FR) front-end for a gold trading platform connecting Burkinabè
producers to international refineries. Sourcing operates from Ouagadougou;
counterparties are handled from New York.

- **Phase I** — public multi-page site + secure B2B intake
- **Phase II** — authenticated client portal (dashboard, document vault, live spot, shipment tracker)

Both phases live in one component, switched by the persistent tab system in the
masthead.

## Run it

The project is already scaffolded — Vite + React + Tailwind, configs in place.

```bash
npm install
npm run dev
```

Then open http://localhost:5173. Build with `npm run build`, check the output
with `npm run preview`.

If a dependency version fails to resolve, `npm install react@latest react-dom@latest lucide-react@latest`
will pull current releases; nothing in the code depends on a pinned version.

## Layout

```
index.html              Vite entry
vite.config.js          Vite + React plugin
tailwind.config.js      content globs only — no colour extension needed
postcss.config.js       tailwind + autoprefixer
src/main.jsx            React root
src/App.jsx             renders the platform
src/index.css           Tailwind directives + the `pagein` keyframes
src/AmandlaGoldPlatform.jsx   the entire platform (~1900 lines)
```

The gold `#D4AF37` and silver `#C9CDD4` accents are Tailwind arbitrary values
inside the component, so it stays portable — dropping it into another project
needs no config changes beyond the `pagein` keyframes in `index.css`.

## Version control

This project is **not yet a git repository** — git was not installed on the
machine it was scaffolded on. To initialise and publish:

```bash
git init
git add .
git commit -m "Initial commit: Amandla Gold platform front-end"
git branch -M main
git remote add origin <YOUR-REPO-URL>
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `dist/` and `.env*`. Check that
nothing sensitive has been added since before the first push.

**Contact details in this repo are deliberately fake** — see Contact below. Real
numbers and addresses should go in only once you have decided whether the
repository is public, and git history keeps whatever you commit even if you
delete it in a later commit.

## Pages

Phase I is a **multi-page site**, not a long scroll. `page` state selects one of:

| Page | Content |
|---|---|
| `home` | Hero, corridor panel, stats, and an index of the other pages |
| `comply` | The three compliance controls |
| `services` | Seven service lines + the declined-approaches table |
| `founder` | Founder block and the Managing Partner's message |
| `contact` | The two office cards |
| `intake` | The corporate intake form |

The brand mark and the "Home" link both return to `home`. Every navigation
scrolls to the top, and the `key={page}` on the wrapper restarts the enter
animation on each route change.

### This is client-side routing, with the trade-offs that implies

There are no URLs. `/services` does not exist, the browser back button does not
step between pages, and a page cannot be linked to or bookmarked.

**That matters commercially more than it looks.** Search engines cannot index
pages that have no address, so a buyer searching for a Burkina Faso gold
supplier will never land on your Services page. Before this goes live, swap the
`page` state for a real router:

```bash
npm install react-router-dom
```

Replace the `switch (page)` block with `<Routes>` / `<Route path="/services" …>`
and the nav buttons with `<NavLink>`. The page components themselves need no
changes — they are already self-contained. Add server-side rendering or
pre-rendering if search visibility matters, since a pure client-side SPA still
indexes poorly.

## Services

`Services` renders seven service lines plus a published refusals policy.

**The numbering is load-bearing.** 01–06 are numbered because that genuinely is
the order the work happens in — verify, match, assay, ship, settle, deliver. The
seventh block (compliance and documentation) is deliberately **unnumbered and
full-width**, because it is not a stage; it runs across all six. Numbering that
does not encode a real sequence is decoration, so if you reorder these, keep the
numbers matching the actual workflow or drop them.

Each card carries a **billing basis** line. That is a positioning decision, not
filler: it states that fees are charged for work performed rather than as
commission on an introduction, which is what separates this from broker-chain
operators.

The **"What we decline"** table is a trust device. Publishing the refusals
converts better than a services list in this market, because every serious buyer
has been burned by at least one of the listed patterns. The rose accent is the
only place semantic red appears on the public site — keep it that way, or it
stops meaning "refused".

Copy lives in `T.en.services` / `T.fr.services`.

## Contact

`Contact` renders two office cards from `T.*.contact.offices`. Phone numbers are
real `tel:` links so they dial on mobile, and addresses use a semantic
`<address>` element.

### The contact details are placeholders

**Every number and address in `T.*.contact.offices` is fake.** They are safe to
commit and safe to publish:

| Field | Placeholder | Why it is safe |
|---|---|---|
| New York phone | `+1 (212) 555-0147` | `555-0100`–`555-0199` is reserved for fictional use in North America |
| Ouagadougou phone | `+226 25 55 01 47` | Mirrors the same reserved pattern |
| New York address | 1 Bullion Court, Suite 900 | No such street exists in New York |
| Ouagadougou address | 01 BP 4471, Avenue du Négoce | No such avenue exists in Ouagadougou |

The founder names are real and intentionally so — the site's whole argument is
that a named person is accountable.

When you swap in live details, decide the New York address carefully. A
residential address on a site advertising high-value physical gold movements is
a personal security exposure, not just a privacy one; the usual fix is a
registered-agent or virtual-office address for public display, keeping the
residential one for legal filings and KYC packs.

### Other decisions

- **Dakoure Bertrand's role is deliberately neutral.** He is labelled
  "Ouagadougou representative" — a location, not a function. The offices carry
  no functional labels at all, by request. Worth knowing what this costs: a
  buyer landing on the page cannot tell which number to call for what, so
  whichever line rings more will absorb both kinds of enquiry. If that becomes
  friction, the fix is a single routing sentence above the cards rather than
  re-labelling the offices themselves.

Because of this, the founder credibility point "on-site at every collection" was
changed to "direct producer and ANEEMAS relationships" — nobody can be in New
York and at every Ouagadougou collection. The remaining claim, "supervises
primary XRF assay and sealing personally", may also need to move to Bertrand or
be reworded.

## Corridor

**Ouagadougou (sourcing) → New York (buyers).** Physical routing is
OUA → Casablanca → JFK; there is no direct service, and the tracker copy says so.
Burkina Faso is landlocked, so every handover in the corridor is at an **airport,
never a port** — the Incoterm descriptions were rewritten accordingly.

### Verify before publishing

Everything below was written from general knowledge and materially affects the
business. Confirm each before this page is public:

- **Burkinabè licensing.** The site names **ANEEMAS** (artisanal mining agency)
  and the mines ministry as the export authorities. Burkina Faso also has
  **SONASP**, a state precious-substances company that may hold purchase or
  export rights over artisanal gold, and the mining code was revised recently.
  Confirm who actually issues your export authorisation.
- **Incoterms.** FOB and CIF are *maritime* terms. For air freight from a
  landlocked origin the correct Incoterms are **FCA** and **CIP**. The labels
  were kept because they were specified, but a refinery or insurer will notice.
- **CAHRA status.** Burkina Faso is a conflict-affected and high-risk area under
  the OECD framework. The compliance block states this openly and positions
  enhanced due diligence as the product. This is deliberate — many LBMA refiners
  apply heightened scrutiny to Sahel doré, and some decline it outright.
- **US import exposure.** Importing African doré attracts significant scrutiny
  (CBP entry, FinCEN/BSA, OFAC). Take US counsel before the first shipment.
- **No LBMA Good Delivery refinery is in New York City.** US accredited refiners
  are elsewhere in the country, so New York is the commercial and vault hub, not
  the refining point. The copy says "North American refiner" for this reason.
- **Named third parties** — SGS, Bureau Veritas, Alex Stewart, Brink's,
  Malca-Amit — are illustrative. "Hudson Bullion Corp." is fictional demo data.
  Replace with real counterparties or remove the names.

## The founder

Amandla is a **sole-principal** firm. The founder is defined once at the top of
`AmandlaGoldPlatform.jsx`:

```js
export const FOUNDER = { name: "Arnaud Dakoure", initials: "AD", isPlaceholder: false };
```

Setting `isPlaceholder: true` renders the name with a dotted gold underline to
flag it as unfilled — useful while a value is still pending.

The role, biography and credibility points live in `T.en.founders.one` and
`T.fr.founders.one`; the quote is `T.*.founders.quote`.

`FounderBlock` is deliberately **not** a card in a grid. A lone card in a
two-column layout reads as though a second one failed to render, so a single
principal gets a portrait column — medallion, "Sole signatory" plate — beside a
full-width biography with the credibility points in two columns beneath it.
Adding a second principal later means reverting to a two-up grid, not dropping
another card next to this one.

Every reference to leadership is singular and first-person in the quote ("I
built Amandla…", "I do the unglamorous part myself"). If the firm takes on a
partner, the strings to revisit are: `founders.*`, `intake.lede`,
`intake.slaV`, `intake.okB`, `intake.okSteps[1]`, and `foot.c1i[1]` — in both
languages.

## Brand mark

`BrandMark` renders two cast bars — gold crowning silver — as inline SVG with a
struck top face, a specular highlight edge, a hallmark line, and a radial glow
that separates it from the navy masthead. It replaced a generic gem icon in a
gold square, which read as an icon rather than as bullion and had almost no
contrast against the header.

The `id` prop **must be unique per instance** (`"mast"`, `"foot"`). The gradients
are referenced by id, and duplicates in one document silently cross-wire the
fills.

## Editing copy

Every string resolves through the `T` dictionary — `T.en` and `T.fr` are
structurally identical. Adding a key to one means adding it to the other; nothing
falls back silently, so a missing key surfaces immediately in development.

To add a third language, add `T.de` (etc.) with the same shape and extend the
`["en", "fr"]` array in `UtilityRail`.

## Design tokens

| Role | Value | Use |
|---|---|---|
| Dominant | `slate-900` `#0F172A` | masthead, footer, premium blocks |
| Deep navy | `#0B1120` | utility rail, footer ground |
| Supporting | `slate-50` `#F8FAFC` | data workspaces, content backgrounds |
| Accent — gold | `#D4AF37` | buttons, cleared tracker nodes, links, icons |
| Accent — silver | `#C9CDD4` | pending state, counterparty identity, ghost buttons |
| Body text | `slate-700` `#334155` | running copy |

Semantic status colour is deliberately kept **separate** from the metals so
"in progress" never reads as "branded": emerald = cleared, amber = in transit.

### The two metals

Silver is not decoration — it carries meaning, and the two metals never overlap:

- **Gold is Amandla, and it is the cleared state.** The ingot mark, the primary
  button, the Phase I tab, a completed milestone, the rail *behind* a shipment,
  metal at rest in the corridor panel.
- **Silver is the counterparty, and it is the un-gilded state.** The secondary
  button, the Phase II tab, the signed-in client's avatar (against Amandla's
  gold mark, so the two entities never read as one), a pending milestone, the
  rail *ahead* of a shipment, metal *in transit*, and the supporting
  infrastructure chrome — compliance tiles, form step numbers, the upload
  target, vault counters.

Silver is always a **gradient with a highlight-to-shadow sweep**, never a flat
grey fill. Flat grey at low opacity reads as absence, not as metal — that is
the difference between silver being in the palette and silver being visible.
Where the two metals meet on one element (compliance card rules, KPI bars, the
stats divider) the gradient runs gold → silver in that order.

The shipment tracker is where this pays off literally: the route runs silver and
turns gold as the consignment clears each milestone. The founders' medallions are
bimetallic — gold face, silver rim, identical for both partners so neither metal
implies rank.

## Hero backdrop

`HERO_IMAGE` at the top of the component controls it.

Left as `null`, the hero renders a **procedural molten pour** on canvas: three
octaves of value noise drifting upward, pushed through a temperature ramp that
runs cold navy → ember → deep orange → gold → **silver white-hot**. Real metal
goes white at its hottest, which is what seats the second metal in the image.
The buffer is only 168×104 and is scaled up under a CSS blur — the upscale *is*
the bloom, which is why it costs almost nothing at ~29fps. It honours
`prefers-reduced-motion` by painting a single frame.

To use a real photograph instead:

```js
import pour from "./assets/molten-pour.jpg";
export const HERO_IMAGE = pour;
```

The scrim over it is tuned for a dark, low-key image with the bright area low
and to the right — that is what keeps the headline legible. A bright or busy
top-left will need the scrim gradient stops adjusted in `Hero`.

A second, static, heavily dimmed instance sits behind the founders band for
continuity. It never animates.

## Simulated data

The spot price ticker is a bounded random walk in `useSpot()` seeded at the
London PM Fix reference, updating every 2.2 s and driving both the headline
price and the canvas sparkline. Consignments, documents and activity are static
fixtures in `T.*.portal`. Swap `useSpot()` for your price feed and the fixtures
for API responses — no component signatures change.
