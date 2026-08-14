/**
 * Gold Corridor Logistics & Trading — Platform Prototype
 * ─────────────────────────────────────────────────────
 * Phase I  : Informational front-end + secure B2B lead-generation intake
 * Phase II : Authenticated client portal (dashboard, vault, spot, tracker)
 *
 * Fully bilingual (EN / FR). All UI copy resolves through the `T` dictionary.
 *
 * Requires: react, tailwindcss, lucide-react
 *   npm i lucide-react
 *
 * Palette (Swiss-African Institutional):
 *   navy   #0F172A  slate-900   dominant   — header, footer, premium blocks
 *   rail   #0B1120              deep navy  — utility rail, footer ground
 *   paper  #F8FAFC  slate-50    supporting — data workspaces
 *   gold   #D4AF37              accent     — buttons, active nodes, links, icons
 *   body   #334155  slate-700   typography
 * Semantic colour is kept separate from the accent: emerald = cleared,
 * amber = in transit, slate = pending.
 */

import React, {
  useState, useEffect, useRef, useMemo, useCallback, createContext, useContext,
} from "react";
import {
  Globe, LayoutDashboard, Gem, ShieldCheck, Scale, KeyRound, Lock, Check,
  CheckCircle2, Circle, CircleDot, ArrowRight, UploadCloud, FileText, X,
  Download, Eye, TrendingUp, TrendingDown, FolderLock, LineChart, Truck,
  Plane, MapPin, Quote, Clock, Info, FlaskConical, Factory,
  LogOut, Bell, RefreshCw, Users, Phone,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   1 · CONFIGURATION — replace the founder identities here
   ══════════════════════════════════════════════════════════════ */
export const FOUNDER = { name: "Arnaud Dakoure", initials: "AD", isPlaceholder: false };

/**
 * Hero backdrop.
 *
 * Leave as `null` to use the procedural molten-gold canvas — layered value
 * noise pushed through a temperature ramp (cold navy → ember → gold →
 * silver white-hot). No asset, no licensing, no network request.
 *
 * To use your own photograph of a pour instead, drop it in `src/assets/`
 * and set:
 *
 *   import pour from "./assets/molten-pour.jpg";
 *   export const HERO_IMAGE = pour;
 *
 * The scrim above it is tuned for a dark, low-key image with the bright
 * area low and to the right — that is what keeps the headline legible.
 * A bright or busy top-left will need the scrim stops adjusted.
 */
export const HERO_IMAGE = null;

const OZ_PER_KG = 32.1507466;

/* ══════════════════════════════════════════════════════════════
   2 · TRANSLATIONS — complete EN / FR parity
   ══════════════════════════════════════════════════════════════ */
export const T = {
  en: {
    code: "EN", locale: "en-GB",
    rail: { hours: "Mon–Fri · GMT and ET coverage", lang: "Language", secure: "Encrypted session" },
    brand: { sub: "Gold Logistics & Trading" },
    phase: { a: "Public Site & Intake", b: "Client Portal", atag: "Phase I", btag: "Phase II" },
    menu: { home: "Home", comply: "Compliance", services: "Services", founder: "Founder", contact: "Contact", cta: "Corporate Intake" },
    index: {
      eyebrow: "Where to go next",
      cards: [
        { p: "comply", i: "shield", t: "Compliance", d: "The three controls every allocation passes through, and the documents each one produces." },
        { p: "services", i: "gem", t: "Services", d: "Seven service lines, the basis each is charged on, and the approaches we decline outright." },
        { p: "founder", i: "users", t: "Founder", d: "Who signs, where he sits, and what he is personally accountable for." },
        { p: "contact", i: "phone", t: "Contact", d: "Two numbers, two named people, and no switchboard between you and them." },
      ],
    },

    hero: {
      eyebrow: "Licensed Burkinabè origination → North American and European refineries",
      t1: "Secured gold corridors, from the ", t2: "pit head", t3: " to the refinery gate.",
      lede: "Gold Corridor Logistics & Trading originates doré and semi-refined gold from licensed producers in Burkina Faso and delivers it — fully insured, escrow-settled and chain-of-custody documented — to LBMA accredited refineries. Sourcing operates from Ouagadougou; counterparties are handled from New York.",
      cta: "Initiate Corporate Intake", cta2: "Review Mandate Terms",
      note: "Counterparty onboarding is restricted to verified corporate entities. No retail, no cash settlement, no unallocated offers.",
    },
    stats: [
      { v: "14", l: "Licensed source partners under contract" },
      { v: "420 kg", l: "Cleared to refinery last quarter" },
      { v: "99.7%", l: "Origin assay vs. refinery settlement match" },
      { v: "96 h", l: "Median export clearance to refinery intake" },
    ],
    corridor: {
      title: "Active corridor", live: "Live",
      legs: [
        { t: "Origin — Ouagadougou, Burkina Faso", s: "Licensed artisanal and semi-mechanised producers", r: "ANEEMAS registered" },
        { t: "Transit — Ouagadougou Intl. (OUA)", s: "Sealed, insured air freight via Casablanca", r: "Brink's / Malca-Amit" },
        { t: "Delivery — New York (JFK)", s: "US CBP clearance, accredited refinery intake", r: "Assay in 48 h" },
      ],
    },

    comply: {
      eyebrow: "Compliance posture",
      h: "Trust is a document trail, not a handshake.",
      lede: "Every allocation moves through the same three controls. No exceptions are made for volume, urgency or relationship.",
      items: [
        { i: "shield", t: "AML / KYC Verified", b: "Full beneficial-ownership disclosure, sanctions and PEP screening against OFAC, EU and UN consolidated lists — completed on every counterparty before a single gram is allocated.", f: "Refreshed every 12 months", s: "Verified" },
        { i: "scale", t: "High-Risk Area Due Diligence", b: "Burkina Faso is a conflict-affected and high-risk area under the OECD framework, and we treat it as one. Enhanced Annex II due diligence, site-level source declaration and continuous chain-of-custody documentation run from mine site to refinery intake weight — the standard a US or EU refiner will demand before accepting Sahel doré.", f: "OECD CAHRA protocol · LBMA Responsible Gold", s: "Enhanced" },
        { i: "key", t: "Escrow Wire Settlement", b: "Funds are held by a regulated third-party escrow agent and released only against confirmed refinery assay. Neither party can move principal unilaterally at any point.", f: "US & EU escrow agents", s: "Active" },
      ],
    },

    services: {
      eyebrow: "What we do",
      h: "Not an introduction service. The pipework around the trade.",
      lede: "An introduction is worth nothing, and it is where this market's fraud lives. What a buyer pays for is certainty — that the metal exists, that it is legally exportable, that the assay is honest, and that funds cannot move until it is confirmed. Every service below is billed for work performed, never as a commission on a handshake.",
      seqLabel: "Order of work",
      items: [
        { n: "01", icon: "shield", t: "Counterparty Verification & Origination",
          d: "Every producer and every buyer is verified before a gram is allocated. Most fraudulent offers do not survive this stage — that is the point of it.",
          pts: ["Producer licence verification against the national register", "Beneficial-ownership tracing and corporate structure mapping", "Sanctions, PEP and adverse-media screening (OFAC / EU / UN / UK)", "Physical site verification at the pit or cooperative"],
          basis: "Fixed retainer per counterparty file" },
        { n: "02", icon: "users", t: "Verified Supplier Registry & Matched Sourcing",
          d: "A closed registry. Only licence-verified producers appear, and neither side receives the other's details until a mandate is signed.",
          pts: ["Buyer mandate desk — grade, volume, terms, destination", "Matched allocation against inspected available lots", "Verification status visible to both sides", "No broker chains: one counterparty, one mandate"],
          basis: "Buyer subscription or per-match fee" },
        { n: "03", icon: "flask", t: "Assay, Sealing & Chain of Custody",
          d: "Material is weighed under camera, assayed and sealed into numbered tamper-evident containers before it moves anywhere.",
          pts: ["Primary XRF assay at the processing hub", "Independent third-party assay (SGS, Bureau Veritas, Alex Stewart) on request", "Numbered tamper-evident sealing and pre-shipment inspection", "Continuous custody record from declaration to refinery intake"],
          basis: "Fixed fee per lot" },
        { n: "04", icon: "plane", t: "Export, Secure Freight & Insurance",
          d: "Permits, customs and armed movement handled end to end, under all-risk cover from the moment of sealing.",
          pts: ["Export permit and origin customs clearance", "Secure vaulting before departure", "Insured air freight via accredited carriers", "Import clearance and armed transport to the refinery gate"],
          basis: "Per-kilogram logistics fee; insurance at cost" },
        { n: "05", icon: "key", t: "Escrow & Settlement",
          d: "Funds sit with a regulated third-party agent and release only against confirmed refinery assay. Neither party can move principal alone.",
          pts: ["Regulated third-party escrow structuring", "Payment against assay, never against promise", "Documentary credit (DLC / SBLC) handling where required", "FX execution and settlement reconciliation"],
          basis: "Escrow administration fee" },
        { n: "06", icon: "factory", t: "Refinery Placement & Delivery",
          d: "Placement with LBMA Good Delivery refineries, through to allocated metal in your vault or sold on your instruction.",
          pts: ["Placement with accredited Good Delivery refineries", "Refining coordination, smelting and purity settlement", "Allocated vault delivery — New York, Zurich, Dubai, Singapore", "Onward sale of refined product on instruction"],
          basis: "Refining coordination fee" },
      ],
      cross: { tag: "Continuous", t: "Compliance, Documentation & Advisory",
        d: "Not a stage. This runs across every one of the six above, and the file it produces is what you are actually buying.",
        pts: ["OECD CAHRA and LBMA Responsible Gold conformance files", "Immutable document vault, seven-year retention", "Jurisdictional advisory across Burkina Faso, Mali and Niger", "US import advisory — CBP entry, FinCEN and OFAC exposure"] },
      refuse: { eyebrow: "Standing policy", t: "What we decline",
        lede: "Published because every serious buyer in this market has been burned by at least one of them. If an approach contains any of the following, we end the conversation.",
        th: ["Approach", "Why we decline"],
        rows: [
          ["FCO / “Full Corporate Offer” paperwork", "Not a real trade instrument. Legitimate transactions run LOI → ICPO → SPA."],
          ["Seller-mandate chains", "If there are four mandates between us and the metal, there is no metal."],
          ["Cash settlement, or payment before assay", "The single most common loss pattern in this trade."],
          ["“Gold already vaulted, ready to ship, CIF”", "Almost always fictitious. Real material starts at a pit, not in a vault."],
          ["Artisanal material declared above 96% purity", "Physically implausible. Genuine doré runs roughly 85–95%."],
          ["Refusal of independent assay", "There is no legitimate reason to refuse it."],
        ] },
    },

    founders: {
      eyebrow: "Meet the founder",
      h: "One name on the door, accountable for the whole corridor.",
      lede: "Gold Corridor is not a syndicate of intermediaries passing a consignment between them. It was founded and is run by one person covering both ends of the corridor — origination and producer relationships on the ground in Burkina Faso, and structuring, compliance and buyer relationships out of New York. When you contract with Gold Corridor, you are contracting with the person who signs.",
      badge: "Sole signatory",
      one: {
        role: "Founder & Managing Partner",
        bio: "Runs both sides of the business personally. Upstream, from Ouagadougou: producer licence verification, primary assay supervision at the processing hub, and export documentation with ANEEMAS and the mines ministry. Downstream, from New York: refinery accreditation, escrow structuring, insurance placement and the enhanced due-diligence files a US refiner requires before it will accept Sahel material. Fifteen years working directly with cooperative and semi-mechanised producers, and the sole point of contact for every counterparty the firm takes on.",
        facts: [
          "Ouagadougou for sourcing — direct producer and ANEEMAS relationships",
          "New York for counterparties — buyer-facing and signing",
          "Supervises primary XRF assay and sealing personally",
          "Holds the producer and ANEEMAS relationships directly",
        ],
      },
      msgTitle: "A message from the Managing Partner",
      quote: "I built Gold Corridor because I watched too many legitimate Burkinabè producers get shut out of formal markets — and too many serious buyers get burned by intermediaries who could not produce a single verifiable document. I do the unglamorous part myself: licensing, assay, customs, escrow, insurance. If a consignment cannot be documented end to end, I do not move it. That rule has cost me business. It has never cost me a client.",
      sigLabel: "Founder & Managing Partner", sigCo: "Gold Corridor Logistics & Trading",
    },

    intake: {
      eyebrow: "Corporate intake",
      h: "Begin counterparty onboarding.",
      lede: "This form opens a compliance file. The Managing Partner reviews every submission personally — you will not be routed to a call centre or a chatbot.",
      checklistT: "What you will need",
      checklist: [
        "Certificate of incorporation and registered address",
        "Beneficial-ownership declaration (25% and above)",
        "Letter of Intent stating volume, terms and destination",
        "Refinery or bank reference, where available",
        "Proof of funds or bank comfort letter",
      ],
      slaK: "48 h", slaV: "Median time from submission to the Managing Partner responding with either a term sheet or a specific reason for decline.",
      fs1: "Corporate identity", fs2: "Commercial requirement", fs3: "Documentation",
      f: {
        entity: "Corporate entity name", entityP: "Full registered legal name",
        country: "Country of registration", countryP: "Select jurisdiction",
        reg: "Company registration number", regP: "As shown on incorporation certificate",
        contact: "Authorised contact", contactP: "Full name and title",
        email: "Corporate email", emailP: "name@company.com",
        phone: "Direct line", phoneP: "+00 000 000 0000",
        cls: "Buyer classification", clsP: "Select classification",
        terms: "Sourcing terms",
        vol: "Target monthly volume", volP: "e.g. 25",
        unit: "Unit", firstShip: "Target first shipment", firstShipP: "Select window",
        dest: "Destination refinery / vault", destP: "Refinery name and city, if already accredited",
        notes: "Additional requirements", notesP: "Purity expectations, inspection preferences, escrow agent preference, or any structuring constraints we should know about before we respond.",
      },
      classes: ["Accredited refinery", "Bullion dealer / distributor", "Licensed broker / intermediary", "Private fund / family office", "Central bank / sovereign entity"],
      countries: ["United Arab Emirates", "Switzerland", "United Kingdom", "Türkiye", "India", "Singapore", "Hong Kong SAR", "Germany", "United States", "Other jurisdiction"],
      windows: ["Within 30 days", "30–60 days", "60–90 days", "Exploratory only"],
      units: ["Kilograms", "Troy ounces"],
      fob: { t: "FOB", s: "Title and risk transfer on handover to the carrier at Ouagadougou." },
      cif: { t: "CIF", s: "We carry cost and insured risk through to the destination airport." },
      dropT: "Attach Letter of Intent & corporate profile",
      dropS: "Drag files here or click to browse — PDF, DOCX, JPG · 25 MB per file",
      dropE: "AES-256 encrypted at rest · TLS 1.3 in transit",
      consent: "I confirm I am authorised to act for the entity named above, that the information provided is accurate, and I consent to AML/KYC screening including sanctions and politically-exposed-person checks.",
      footNote: "Submissions are logged to an immutable compliance register.",
      submit: "Submit corporate intake", submitting: "Encrypting and transmitting…",
      okT: "Intake received.",
      okB: "Your compliance file is open. The Managing Partner reviews this personally — you will hear from a named individual, not an autoresponder.",
      okRefL: "Compliance file reference",
      okSteps: [
        "Sanctions, PEP and beneficial-ownership screening begins within one business day.",
        "The Managing Partner responds within 48 hours with a term sheet or a specific reason for decline.",
        "On approval, your Client Portal credentials and document vault are issued.",
      ],
      okBtn: "Return to site",
    },

    contact: {
      eyebrow: "Contact",
      h: "Two desks, two time zones, a named person at each.",
      lede: "No switchboard and no intermediary. Either number reaches a named person directly.",
      callLabel: "Call",
      /* PLACEHOLDER CONTACT DETAILS — not real.
         Numbers use the 555-01xx range reserved for fictional use; the street
         names do not exist. Swap for live details before launch. */
      offices: [
        { city: "New York, United States",
          name: "Arnaud Dakoure", role: "Founder & Managing Partner",
          tel: "+1 (212) 555-0147", href: "+12125550147",
          addr: ["1 Bullion Court, Suite 900", "New York, NY 10004", "United States"],
          hours: "Mon–Fri · 09:00–18:00 ET" },
        { city: "Ouagadougou, Burkina Faso",
          name: "Dakoure Bertrand", role: "Ouagadougou representative",
          tel: "+226 25 55 01 47", href: "+22625550147",
          addr: ["01 BP 4471, Avenue du Négoce", "Ouagadougou, Kadiogo", "Burkina Faso"],
          hours: "Mon–Fri · 08:00–18:00 GMT" },
      ],
      note: "For a first approach, written contact is preferred — use the corporate intake form so your compliance file opens with the submission rather than after it.",
    },

    foot: {
      blurb: "Gold Corridor Logistics & Trading originates, documents and delivers responsibly-sourced Burkinabè gold to accredited refineries in North America and Europe.",
      c1: "Company", c1i: ["About Gold Corridor", "The Managing Partner", "Operating corridors", "Careers"],
      c2: "Compliance", c2i: ["AML / KYC policy", "LBMA Responsible Gold", "OECD due diligence", "Sanctions screening"],
      c3: "Contact", c3i: ["New York — +1 (212) 555-0147", "Ouagadougou — +226 25 55 01 47", "desk@goldcorridor.example"],
      legal: "© 2026 Gold Corridor Logistics & Trading. All rights reserved.",
      disc: "Interactive prototype. Prices, batches and documents shown are simulated for demonstration.",
    },

    portal: {
      client: "Hudson Bullion Corp.", role: "Accredited bullion dealer · Tier 1",
      navMain: "Workspace",
      nav: { overview: "Overview", docs: "My Documents", prices: "Live Spot Prices", ship: "Active Shipments" },
      secure: "Session encrypted end-to-end. Last sign-in from New York, 08:42 ET.",
      signout: "Sign out",

      ov: {
        crumb: "Portal / Overview", h: "Overview",
        s: "Consolidated position across your active allocations and open compliance items.",
        kpis: [
          { i: "gem", l: "Allocated this month", v: "38.4 kg", d: "of 50 kg contracted", g: "77% filled" },
          { i: "truck", l: "In transit", v: "2", d: "consignments moving", g: "On schedule" },
          { i: "flask", l: "Avg. settled purity", v: "99.31%", d: "last 6 consignments", g: "+0.04% QoQ" },
          { i: "lock", l: "Escrow held", v: "$3.42M", d: "released on assay", g: "Agent verified" },
        ],
        feedT: "Recent activity", feedS: "Last 7 days",
        feed: [
          { t: "Refinery assay confirmed — AGL-2608-01", s: "North American refiner reported 99.34% fine. Settlement instruction issued.", ts: "2 h ago" },
          { t: "Consignment AGL-2609-02 cleared export customs", s: "Ouagadougou Intl. — sealed and loaded, armed escort confirmed.", ts: "9 h ago" },
          { t: "Escrow funded — $1.18M", s: "Third-party agent confirmed receipt against consignment AGL-2609-02.", ts: "Yesterday" },
          { t: "KYC refresh completed", s: "Annual beneficial-ownership review closed with no findings.", ts: "3 days ago" },
          { t: "Primary assay filed — AGL-2609-03", s: "XRF at Ouagadougou hub: 92.6% doré, 14.2 kg gross. Awaiting export permit.", ts: "5 days ago" },
        ],
      },

      docs: {
        crumb: "Portal / My Documents", h: "Document Vault",
        s: "Every document issued or received against your account, retained for seven years.",
        vault: [{ v: "24", l: "Documents on file" }, { v: "3", l: "Awaiting your signature" }, { v: "7 yr", l: "Retention period" }],
        th: ["Document", "Consignment", "Issued", "Status", ""],
        st: { ok: "Countersigned", wait: "Awaiting signature", move: "Under review" },
        rows: [
          { n: "Letter of Intent — Q3 2026 allocation", m: "PDF · 412 KB", c: "—", d: "12 Aug 2026", s: "ok" },
          { n: "Primary assay certificate (XRF)", m: "PDF · 1.8 MB", c: "AGL-2609-03", d: "11 Aug 2026", s: "ok" },
          { n: "Export permit — ANEEMAS Burkina Faso", m: "PDF · 664 KB", c: "AGL-2609-02", d: "10 Aug 2026", s: "ok" },
          { n: "Air waybill & security manifest", m: "PDF · 288 KB", c: "AGL-2609-02", d: "10 Aug 2026", s: "ok" },
          { n: "Escrow release instruction", m: "PDF · 196 KB", c: "AGL-2608-01", d: "09 Aug 2026", s: "wait" },
          { n: "Refinery settlement statement", m: "PDF · 524 KB", c: "AGL-2608-01", d: "09 Aug 2026", s: "move" },
          { n: "Insurance certificate — all-risk marine/air", m: "PDF · 380 KB", c: "AGL-2609-02", d: "08 Aug 2026", s: "ok" },
          { n: "Beneficial ownership declaration 2026", m: "PDF · 244 KB", c: "—", d: "04 Aug 2026", s: "wait" },
        ],
        view: "View", dl: "Download",
      },

      px: {
        crumb: "Portal / Live Spot Prices", h: "Live Spot Prices",
        s: "Indicative pricing streamed against the London Fix. Contract pricing is struck at settlement, not at view.",
        fix: "London PM Fix reference", live: "Streaming", unit: "USD / troy ounce",
        units: [{ l: "Per troy ounce" }, { l: "Per kilogram" }, { l: "Per gram" }],
        disc: "Indicative only. Gold Corridor settles at the LBMA PM Fix on the date of refinery assay confirmation, less agreed refining and logistics deductions.",
        tblT: "Gold Corridor contract grid", tblS: "Applied to your Tier 1 accreditation",
        th: ["Grade", "Purity", "Deduction", "Net to you"],
        rows: [
          { g: "Doré bar — primary", p: "92.0–94.5%", d: -3.85 },
          { g: "Doré bar — premium", p: "94.5–96.0%", d: -3.20 },
          { g: "Semi-refined", p: "96.0–98.5%", d: -2.45 },
          { g: "Refined 995", p: "99.5%", d: -1.10 },
        ],
        sess: "Session range", open: "Session open", vol: "24 h change",
      },

      ship: {
        crumb: "Portal / Active Shipments", h: "Live Shipment Tracker",
        s: "Physical chain of custody for each active consignment, milestone by milestone.",
        pick: "Select consignment",
        cards: [{ l: "Gross weight" }, { l: "Declared fineness" }, { l: "Insured value" }, { l: "Est. refinery intake" }],
        st: { done: "Completed", live: "In progress", wait: "Pending" },
        note: "Milestones advance only when the supporting document is filed to your vault. A node cannot be marked complete without its certificate, permit or waybill attached.",
        steps: [
          { t: "Local Collection & Primary Assay", loc: "Processing Hub — Ouagadougou, Burkina Faso", b: "Material received from licensed producers, weighed under camera, XRF-assayed and sealed into numbered tamper-evident containers. Producer licences verified against the ANEEMAS register, with site-level source declaration filed for CAHRA due diligence.", kv: [["Primary assay", "92.6% Au"], ["Gross weight", "14.20 kg"], ["Seal series", "BF-88412-19"]] },
          { t: "Export Clearance & Secure Air Transit", loc: "Ouagadougou International (OUA) — Burkinabè Customs", b: "Export authorisation issued by the mines ministry, customs declaration cleared, consignment handed to accredited secure logistics under armed escort and all-risk cover. Routed via Casablanca for the transatlantic leg — there is no direct service.", kv: [["Export permit", "BF-MEMC-26-4471"], ["Carrier", "Malca-Amit"], ["AWB", "147-88214930"]] },
          { t: "Import Clearance & Armed Transport", loc: "John F. Kennedy International (JFK) — US CBP", b: "US Customs and Border Protection entry filed against the doré tariff line, seal integrity inspected on arrival, then armed vehicle transfer from the airside secure facility directly to the refinery intake bay. Seals broken only under refinery supervision.", kv: [["CBP entry", "CBP-2026-118204"], ["Escort", "New York secure convoy"], ["Seal check", "Intact on arrival"]] },
          { t: "Refinery Delivery, Smelting & Settlement", loc: "North American refiner — LBMA Good Delivery", b: "Refinery intake weight recorded, material melted and homogenised, final fire-assay determines settlement fineness. Escrow releases to the producer and to Gold Corridor against the assay certificate.", kv: [["Intake weight", "Pending"], ["Final assay", "Pending"], ["Escrow release", "Held"]] },
        ],
        consignments: [
          { id: "AGL-2609-02", meta: "14.20 kg doré · Ouagadougou → New York", stage: 2, cards: ["14.20 kg", "92.6% Au", "$1,182,400", "15 Aug 2026"] },
          { id: "AGL-2609-03", meta: "8.65 kg doré · Ouagadougou → Zurich", stage: 1, cards: ["8.65 kg", "91.4% Au", "$711,900", "19 Aug 2026"] },
          { id: "AGL-2608-01", meta: "22.40 kg doré · Ouagadougou → New York", stage: 4, cards: ["22.40 kg", "99.34% settled", "$1,864,200", "Settled 09 Aug"] },
        ],
      },
    },
  },

  fr: {
    code: "FR", locale: "fr-FR",
    rail: { hours: "Lun–Ven · couverture GMT et ET", lang: "Langue", secure: "Session chiffrée" },
    brand: { sub: "Logistique & Négoce d'Or" },
    phase: { a: "Site public & inscription", b: "Portail client", atag: "Phase I", btag: "Phase II" },
    menu: { home: "Accueil", comply: "Conformité", services: "Services", founder: "Fondateur", contact: "Contact", cta: "Inscription" },
    index: {
      eyebrow: "Où aller ensuite",
      cards: [
        { p: "comply", i: "shield", t: "Conformité", d: "Les trois contrôles que franchit chaque allocation, et les documents que chacun produit." },
        { p: "services", i: "gem", t: "Services", d: "Sept lignes de service, la base de facturation de chacune, et les approches que nous refusons." },
        { p: "founder", i: "users", t: "Fondateur", d: "Qui signe, où il se trouve, et ce dont il répond personnellement." },
        { p: "contact", i: "phone", t: "Contact", d: "Deux numéros, deux personnes nommées, et aucun standard entre vous et elles." },
      ],
    },

    hero: {
      eyebrow: "Sourcing burkinabè agréé → raffineries nord-américaines et européennes",
      t1: "Des corridors aurifères sécurisés, de la ", t2: "mine", t3: " à la porte de la raffinerie.",
      lede: "Gold Corridor Logistics & Trading source du doré et de l'or semi-affiné auprès de producteurs agréés du Burkina Faso et le livre — intégralement assuré, réglé sous séquestre et documenté de bout en bout — à des raffineries accréditées LBMA. Le sourcing opère depuis Ouagadougou ; les contreparties sont traitées depuis New York.",
      cta: "Initier l'inscription", cta2: "Consulter les conditions",
      note: "L'ouverture de compte est réservée aux entités corporatives vérifiées. Ni particuliers, ni règlement en espèces, ni offres non allouées.",
    },
    stats: [
      { v: "14", l: "Partenaires producteurs agréés sous contrat" },
      { v: "420 kg", l: "Livrés en raffinerie le trimestre dernier" },
      { v: "99,7 %", l: "Concordance essai d'origine / règlement" },
      { v: "96 h", l: "Délai médian dédouanement → raffinerie" },
    ],
    corridor: {
      title: "Corridor actif", live: "En direct",
      legs: [
        { t: "Origine — Ouagadougou, Burkina Faso", s: "Producteurs artisanaux et semi-mécanisés agréés", r: "Enregistré ANEEMAS" },
        { t: "Transit — Aéroport de Ouagadougou (OUA)", s: "Fret aérien scellé et assuré via Casablanca", r: "Brink's / Malca-Amit" },
        { t: "Livraison — New York (JFK)", s: "Dédouanement CBP, réception en raffinerie accréditée", r: "Essai sous 48 h" },
      ],
    },

    comply: {
      eyebrow: "Dispositif de conformité",
      h: "La confiance est une piste documentaire, pas une poignée de main.",
      lede: "Chaque allocation franchit les trois mêmes contrôles. Aucune exception n'est accordée pour le volume, l'urgence ou la relation.",
      items: [
        { i: "shield", t: "LAB / KYC vérifié", b: "Divulgation intégrale des bénéficiaires effectifs, criblage sanctions et PPE contre les listes consolidées OFAC, UE et ONU — effectué sur chaque contrepartie avant l'allocation du moindre gramme.", f: "Actualisé tous les 12 mois", s: "Vérifié" },
        { i: "scale", t: "Diligence renforcée zone à risque", b: "Le Burkina Faso est une zone de conflit ou à haut risque au sens du cadre de l'OCDE, et nous le traitons comme telle. Diligence renforcée Annexe II, déclaration de source au niveau du site et documentation continue de la chaîne de possession, du site minier au poids d'entrée en raffinerie — l'exigence de tout affineur américain ou européen avant d'accepter du doré sahélien.", f: "Protocole CAHRA de l'OCDE · LBMA Responsible Gold", s: "Renforcée" },
        { i: "key", t: "Règlement par séquestre", b: "Les fonds sont détenus par un agent de séquestre tiers réglementé et libérés uniquement contre essai de raffinerie confirmé. Aucune partie ne peut mouvementer le principal unilatéralement.", f: "Agents américains et européens", s: "Actif" },
      ],
    },

    services: {
      eyebrow: "Nos services",
      h: "Pas un service de mise en relation. La tuyauterie autour de la transaction.",
      lede: "Une mise en relation ne vaut rien, et c'est précisément là que prospère la fraude sur ce marché. Ce qu'un acheteur paie, c'est la certitude : que le métal existe, qu'il est légalement exportable, que l'essai est honnête et que les fonds ne peuvent bouger avant confirmation. Chaque service ci-dessous est facturé au travail effectué, jamais en commission sur une poignée de main.",
      seqLabel: "Ordre des opérations",
      items: [
        { n: "01", icon: "shield", t: "Vérification des contreparties & sourcing",
          d: "Chaque producteur et chaque acheteur est vérifié avant l'allocation du moindre gramme. La plupart des offres frauduleuses ne survivent pas à cette étape — c'est précisément son objet.",
          pts: ["Vérification des licences de production au registre national", "Traçage des bénéficiaires effectifs et cartographie des structures", "Criblage sanctions, PPE et médias défavorables (OFAC / UE / ONU / R.-U.)", "Vérification physique sur site, à la mine ou à la coopérative"],
          basis: "Honoraires fixes par dossier de contrepartie" },
        { n: "02", icon: "users", t: "Registre de producteurs vérifiés & appariement",
          d: "Un registre fermé. Seuls les producteurs à licence vérifiée y figurent, et aucune partie ne reçoit les coordonnées de l'autre avant la signature d'un mandat.",
          pts: ["Bureau des mandats acheteurs — qualité, volume, conditions, destination", "Allocation appariée sur les lots inspectés disponibles", "Statut de vérification visible des deux côtés", "Aucune chaîne de courtiers : une contrepartie, un mandat"],
          basis: "Abonnement acheteur ou commission par appariement" },
        { n: "03", icon: "flask", t: "Essai, mise sous scellés & chaîne de possession",
          d: "La matière est pesée sous caméra, analysée et scellée dans des conteneurs numérotés à indication d'effraction avant tout déplacement.",
          pts: ["Essai XRF primaire au hub de traitement", "Essai tiers indépendant (SGS, Bureau Veritas, Alex Stewart) sur demande", "Scellés numérotés à indication d'effraction et inspection avant expédition", "Registre de possession continu, de la déclaration à la réception en raffinerie"],
          basis: "Forfait par lot" },
        { n: "04", icon: "plane", t: "Exportation, fret sécurisé & assurance",
          d: "Permis, douanes et transport sous escorte pris en charge de bout en bout, sous couverture tous risques dès la mise sous scellés.",
          pts: ["Permis d'exportation et dédouanement à l'origine", "Mise en coffre sécurisée avant départ", "Fret aérien assuré par transporteurs accrédités", "Dédouanement à l'import et transport blindé jusqu'à la raffinerie"],
          basis: "Frais logistiques au kilogramme ; assurance au coût" },
        { n: "05", icon: "key", t: "Séquestre & règlement",
          d: "Les fonds sont déposés chez un agent tiers réglementé et libérés uniquement contre essai de raffinerie confirmé. Aucune partie ne peut mouvementer le principal seule.",
          pts: ["Montage de séquestre auprès d'un agent tiers réglementé", "Paiement contre essai, jamais contre promesse", "Traitement des crédits documentaires (DLC / SBLC) si requis", "Exécution des changes et rapprochement des règlements"],
          basis: "Frais d'administration du séquestre" },
        { n: "06", icon: "factory", t: "Placement en raffinerie & livraison",
          d: "Placement auprès de raffineries LBMA Good Delivery, jusqu'au métal alloué dans votre coffre ou vendu sur votre instruction.",
          pts: ["Placement auprès de raffineries Good Delivery accréditées", "Coordination de l'affinage, fonte et règlement du titre", "Livraison en coffre alloué — New York, Zurich, Dubaï, Singapour", "Revente du produit affiné sur instruction"],
          basis: "Frais de coordination d'affinage" },
      ],
      cross: { tag: "En continu", t: "Conformité, documentation & conseil",
        d: "Ce n'est pas une étape : cela traverse chacune des six ci-dessus, et le dossier ainsi constitué est ce que vous achetez réellement.",
        pts: ["Dossiers de conformité CAHRA (OCDE) et LBMA Responsible Gold", "Coffre documentaire inaltérable, conservation sept ans", "Conseil juridictionnel : Burkina Faso, Mali et Niger", "Conseil à l'import US — déclaration CBP, exposition FinCEN et OFAC"] },
      refuse: { eyebrow: "Politique permanente", t: "Ce que nous refusons",
        lede: "Publié parce que tout acheteur sérieux de ce marché s'est déjà brûlé sur au moins un de ces points. Si une approche comporte l'un des éléments suivants, nous mettons fin à la discussion.",
        th: ["Approche", "Motif du refus"],
        rows: [
          ["Documents « FCO » / « Full Corporate Offer »", "Ce n'est pas un instrument commercial réel. Une transaction légitime suit LOI → ICPO → SPA."],
          ["Chaînes de mandats vendeurs", "S'il y a quatre mandats entre nous et le métal, il n'y a pas de métal."],
          ["Règlement en espèces, ou paiement avant essai", "Le schéma de perte le plus courant de ce négoce."],
          ["« Or déjà en coffre, prêt à expédier, CIF »", "Presque toujours fictif. La matière réelle part d'une mine, pas d'un coffre."],
          ["Matière artisanale déclarée au-dessus de 96 % de pureté", "Physiquement invraisemblable. Le doré authentique titre environ 85 à 95 %."],
          ["Refus d'un essai indépendant", "Il n'existe aucune raison légitime de le refuser."],
        ] },
    },

    founders: {
      eyebrow: "Rencontrez le fondateur",
      h: "Un seul nom sur la porte, responsable de tout le corridor.",
      lede: "Gold Corridor n'est pas un assemblage d'intermédiaires se repassant une expédition. La société a été fondée et est dirigée par une seule personne, qui couvre les deux extrémités du corridor — le sourcing et les relations producteurs sur le terrain au Burkina Faso, ainsi que la structuration, la conformité et les relations acheteurs depuis New York. Contracter avec Gold Corridor, c'est contracter avec celui qui signe.",
      badge: "Signataire unique",
      one: {
        role: "Fondateur & associé gérant",
        bio: "Dirige personnellement les deux versants de l'activité. En amont, depuis Ouagadougou : vérification des licences de production, supervision de l'essai primaire au hub de traitement et documentation d'exportation auprès de l'ANEEMAS et du ministère des Mines. En aval, depuis New York : accréditation des raffineries, montage des séquestres, placement de l'assurance et constitution des dossiers de diligence renforcée qu'un affineur américain exige avant d'accepter de la matière sahélienne. Quinze ans de travail direct avec les coopératives et les producteurs semi-mécanisés, et interlocuteur unique de chaque contrepartie acceptée par la maison.",
        facts: [
          "Ouagadougou pour le sourcing — relations producteurs et ANEEMAS en direct",
          "New York pour les contreparties — face aux acheteurs, et signataire",
          "Supervise personnellement l'essai XRF et la mise sous scellés",
          "Détient en direct les relations producteurs et ANEEMAS",
        ],
      },
      msgTitle: "Message de l'associé gérant",
      quote: "J'ai créé Gold Corridor après avoir vu trop de producteurs burkinabè légitimes exclus des marchés formels — et trop d'acheteurs sérieux échaudés par des intermédiaires incapables de produire un seul document vérifiable. Je fais moi-même la partie ingrate : licences, essais, douanes, séquestre, assurance. Si une expédition ne peut être documentée de bout en bout, je ne la déplace pas. Cette règle m'a coûté des affaires. Elle ne m'a jamais coûté un client.",
      sigLabel: "Fondateur & associé gérant", sigCo: "Gold Corridor Logistics & Trading",
    },

    intake: {
      eyebrow: "Inscription corporative",
      h: "Ouvrez votre dossier de contrepartie.",
      lede: "Ce formulaire ouvre un dossier de conformité. L'associé gérant examine personnellement chaque soumission — vous ne serez orienté ni vers un centre d'appels ni vers un robot.",
      checklistT: "Pièces à prévoir",
      checklist: [
        "Extrait d'immatriculation et siège social",
        "Déclaration des bénéficiaires effectifs (25 % et plus)",
        "Lettre d'intention précisant volume, conditions et destination",
        "Référence bancaire ou de raffinerie, le cas échéant",
        "Preuve de fonds ou lettre de confort bancaire",
      ],
      slaK: "48 h", slaV: "Délai médian entre la soumission et la réponse de l'associé gérant : term sheet ou motif de refus précis.",
      fs1: "Identité corporative", fs2: "Besoin commercial", fs3: "Documentation",
      f: {
        entity: "Dénomination sociale", entityP: "Raison sociale complète",
        country: "Pays d'immatriculation", countryP: "Sélectionnez la juridiction",
        reg: "Numéro d'immatriculation", regP: "Tel qu'indiqué sur l'extrait",
        contact: "Contact habilité", contactP: "Nom complet et fonction",
        email: "Courriel professionnel", emailP: "nom@societe.com",
        phone: "Ligne directe", phoneP: "+00 000 000 0000",
        cls: "Classification acheteur", clsP: "Sélectionnez la classification",
        terms: "Conditions de sourcing",
        vol: "Volume mensuel cible", volP: "ex. 25",
        unit: "Unité", firstShip: "Première expédition visée", firstShipP: "Sélectionnez la fenêtre",
        dest: "Raffinerie / coffre de destination", destP: "Nom et ville de la raffinerie, si déjà accréditée",
        notes: "Exigences complémentaires", notesP: "Attentes de pureté, préférences d'inspection, choix d'agent de séquestre ou toute contrainte de structuration à connaître avant notre réponse.",
      },
      classes: ["Raffinerie accréditée", "Négociant / distributeur de lingots", "Courtier / intermédiaire agréé", "Fonds privé / family office", "Banque centrale / entité souveraine"],
      countries: ["Émirats arabes unis", "Suisse", "Royaume-Uni", "Turquie", "Inde", "Singapour", "Hong Kong RAS", "Allemagne", "États-Unis", "Autre juridiction"],
      windows: ["Sous 30 jours", "30–60 jours", "60–90 jours", "Exploratoire uniquement"],
      units: ["Kilogrammes", "Onces troy"],
      fob: { t: "FOB", s: "Transfert de propriété et de risque à la remise au transporteur à Ouagadougou." },
      cif: { t: "CIF", s: "Nous portons le coût et le risque assuré jusqu'à l'aéroport de destination." },
      dropT: "Joindre la lettre d'intention et le profil corporatif",
      dropS: "Glissez vos fichiers ici ou cliquez pour parcourir — PDF, DOCX, JPG · 25 Mo par fichier",
      dropE: "Chiffrement AES-256 au repos · TLS 1.3 en transit",
      consent: "Je confirme être habilité à agir pour l'entité désignée ci-dessus, que les informations fournies sont exactes, et je consens au criblage LAB/KYC incluant les contrôles sanctions et personnes politiquement exposées.",
      footNote: "Les soumissions sont consignées dans un registre de conformité inaltérable.",
      submit: "Soumettre l'inscription", submitting: "Chiffrement et transmission…",
      okT: "Inscription reçue.",
      okB: "Votre dossier de conformité est ouvert. L'associé gérant l'examine personnellement — vous recevrez la réponse d'une personne nommée, pas d'un répondeur automatique.",
      okRefL: "Référence du dossier de conformité",
      okSteps: [
        "Le criblage sanctions, PPE et bénéficiaires effectifs démarre sous un jour ouvré.",
        "L'associé gérant répond sous 48 heures par une term sheet ou un motif de refus précis.",
        "Après approbation, vos accès au portail client et à votre coffre documentaire sont émis.",
      ],
      okBtn: "Retour au site",
    },

    contact: {
      eyebrow: "Contact",
      h: "Deux bureaux, deux fuseaux, une personne nommée de chaque côté.",
      lede: "Ni standard téléphonique ni intermédiaire. Chaque numéro joint directement une personne nommée.",
      callLabel: "Appeler",
      /* COORDONNÉES FICTIVES — à remplacer avant la mise en ligne. */
      offices: [
        { city: "New York, États-Unis",
          name: "Arnaud Dakoure", role: "Fondateur & associé gérant",
          tel: "+1 (212) 555-0147", href: "+12125550147",
          addr: ["1 Bullion Court, Suite 900", "New York, NY 10004", "États-Unis"],
          hours: "Lun–Ven · 09h00–18h00 ET" },
        { city: "Ouagadougou, Burkina Faso",
          name: "Dakoure Bertrand", role: "Représentant à Ouagadougou",
          tel: "+226 25 55 01 47", href: "+22625550147",
          addr: ["01 BP 4471, Avenue du Négoce", "Ouagadougou, Kadiogo", "Burkina Faso"],
          hours: "Lun–Ven · 08h00–18h00 GMT" },
      ],
      note: "Pour un premier contact, l'écrit est préférable — utilisez le formulaire d'inscription afin que votre dossier de conformité s'ouvre avec la soumission plutôt qu'après.",
    },

    foot: {
      blurb: "Gold Corridor Logistics & Trading source, documente et livre de l'or burkinabè d'origine responsable aux raffineries accréditées d'Amérique du Nord et d'Europe.",
      c1: "Société", c1i: ["À propos de Gold Corridor", "L'associé gérant", "Corridors opérés", "Carrières"],
      c2: "Conformité", c2i: ["Politique LAB / KYC", "LBMA Responsible Gold", "Diligence raisonnable OCDE", "Criblage des sanctions"],
      c3: "Contact", c3i: ["New York — +1 (212) 555-0147", "Ouagadougou — +226 25 55 01 47", "desk@goldcorridor.example"],
      legal: "© 2026 Gold Corridor Logistics & Trading. Tous droits réservés.",
      disc: "Prototype interactif. Les cours, lots et documents affichés sont simulés à des fins de démonstration.",
    },

    portal: {
      client: "Hudson Bullion Corp.", role: "Négociant en lingots accrédité · Rang 1",
      navMain: "Espace de travail",
      nav: { overview: "Vue d'ensemble", docs: "Mes documents", prices: "Cours au comptant", ship: "Expéditions actives" },
      secure: "Session chiffrée de bout en bout. Dernière connexion depuis New York, 08h42 ET.",
      signout: "Déconnexion",

      ov: {
        crumb: "Portail / Vue d'ensemble", h: "Vue d'ensemble",
        s: "Position consolidée de vos allocations actives et de vos points de conformité ouverts.",
        kpis: [
          { i: "gem", l: "Alloué ce mois-ci", v: "38,4 kg", d: "sur 50 kg contractés", g: "77 % rempli" },
          { i: "truck", l: "En transit", v: "2", d: "expéditions en mouvement", g: "Dans les délais" },
          { i: "flask", l: "Pureté moyenne réglée", v: "99,31 %", d: "6 dernières expéditions", g: "+0,04 % T/T" },
          { i: "lock", l: "Sous séquestre", v: "3,42 M$", d: "libéré sur essai", g: "Agent vérifié" },
        ],
        feedT: "Activité récente", feedS: "7 derniers jours",
        feed: [
          { t: "Essai de raffinerie confirmé — AGL-2608-01", s: "L'affineur nord-américain a déclaré 99,34 % fin. Instruction de règlement émise.", ts: "il y a 2 h" },
          { t: "Expédition AGL-2609-02 dédouanée à l'export", s: "Aéroport de Ouagadougou — scellée et chargée, escorte armée confirmée.", ts: "il y a 9 h" },
          { t: "Séquestre approvisionné — 1,18 M$", s: "L'agent tiers a confirmé la réception au titre de l'expédition AGL-2609-02.", ts: "Hier" },
          { t: "Actualisation KYC achevée", s: "Revue annuelle des bénéficiaires effectifs clôturée sans réserve.", ts: "il y a 3 jours" },
          { t: "Essai primaire déposé — AGL-2609-03", s: "XRF au hub de Ouagadougou : doré à 92,6 %, 14,2 kg bruts. En attente du permis d'exportation.", ts: "il y a 5 jours" },
        ],
      },

      docs: {
        crumb: "Portail / Mes documents", h: "Coffre documentaire",
        s: "Chaque document émis ou reçu au titre de votre compte, conservé sept ans.",
        vault: [{ v: "24", l: "Documents au dossier" }, { v: "3", l: "En attente de votre signature" }, { v: "7 ans", l: "Durée de conservation" }],
        th: ["Document", "Expédition", "Émis le", "Statut", ""],
        st: { ok: "Contresigné", wait: "Signature attendue", move: "En cours d'examen" },
        rows: [
          { n: "Lettre d'intention — allocation T3 2026", m: "PDF · 412 Ko", c: "—", d: "12 août 2026", s: "ok" },
          { n: "Certificat d'essai primaire (XRF)", m: "PDF · 1,8 Mo", c: "AGL-2609-03", d: "11 août 2026", s: "ok" },
          { n: "Permis d'exportation — ANEEMAS Burkina", m: "PDF · 664 Ko", c: "AGL-2609-02", d: "10 août 2026", s: "ok" },
          { n: "Lettre de transport aérien & manifeste", m: "PDF · 288 Ko", c: "AGL-2609-02", d: "10 août 2026", s: "ok" },
          { n: "Instruction de libération du séquestre", m: "PDF · 196 Ko", c: "AGL-2608-01", d: "09 août 2026", s: "wait" },
          { n: "Relevé de règlement de raffinerie", m: "PDF · 524 Ko", c: "AGL-2608-01", d: "09 août 2026", s: "move" },
          { n: "Certificat d'assurance tous risques", m: "PDF · 380 Ko", c: "AGL-2609-02", d: "08 août 2026", s: "ok" },
          { n: "Déclaration des bénéficiaires 2026", m: "PDF · 244 Ko", c: "—", d: "04 août 2026", s: "wait" },
        ],
        view: "Consulter", dl: "Télécharger",
      },

      px: {
        crumb: "Portail / Cours au comptant", h: "Cours au comptant en direct",
        s: "Cotation indicative diffusée en référence au Fixing de Londres. Le prix contractuel est arrêté au règlement, non à l'affichage.",
        fix: "Référence Fixing PM de Londres", live: "En diffusion", unit: "USD / once troy",
        units: [{ l: "Par once troy" }, { l: "Par kilogramme" }, { l: "Par gramme" }],
        disc: "Indicatif uniquement. Gold Corridor règle au Fixing PM de la LBMA à la date de confirmation de l'essai de raffinerie, déduction faite des frais d'affinage et de logistique convenus.",
        tblT: "Grille contractuelle Gold Corridor", tblS: "Appliquée à votre accréditation Rang 1",
        th: ["Qualité", "Pureté", "Décote", "Net pour vous"],
        rows: [
          { g: "Lingot doré — primaire", p: "92,0–94,5 %", d: -3.85 },
          { g: "Lingot doré — premium", p: "94,5–96,0 %", d: -3.20 },
          { g: "Semi-affiné", p: "96,0–98,5 %", d: -2.45 },
          { g: "Affiné 995", p: "99,5 %", d: -1.10 },
        ],
        sess: "Amplitude de séance", open: "Ouverture de séance", vol: "Variation 24 h",
      },

      ship: {
        crumb: "Portail / Expéditions actives", h: "Suivi d'expédition en direct",
        s: "Chaîne de possession physique de chaque expédition active, jalon par jalon.",
        pick: "Sélectionner l'expédition",
        cards: [{ l: "Poids brut" }, { l: "Titre déclaré" }, { l: "Valeur assurée" }, { l: "Réception estimée" }],
        st: { done: "Terminé", live: "En cours", wait: "En attente" },
        note: "Un jalon n'avance que lorsque la pièce justificative est déposée dans votre coffre. Aucun nœud ne peut être marqué terminé sans son certificat, permis ou lettre de transport joint.",
        steps: [
          { t: "Collecte locale & essai primaire", loc: "Hub de traitement — Ouagadougou, Burkina Faso", b: "Matière reçue de producteurs agréés, pesée sous caméra, analysée par XRF et scellée dans des conteneurs numérotés à indication d'effraction. Licences des producteurs vérifiées au registre ANEEMAS, avec déclaration de source au niveau du site pour la diligence CAHRA.", kv: [["Essai primaire", "92,6 % Au"], ["Poids brut", "14,20 kg"], ["Série de scellés", "BF-88412-19"]] },
          { t: "Dédouanement export & fret aérien sécurisé", loc: "Aéroport international de Ouagadougou (OUA) — Douanes burkinabè", b: "Autorisation d'exportation délivrée par le ministère des Mines, déclaration en douane validée, expédition remise à un logisticien sécurisé accrédité sous escorte armée et couverture tous risques. Acheminement via Casablanca pour la traversée transatlantique — il n'existe pas de vol direct.", kv: [["Permis export", "BF-MEMC-26-4471"], ["Transporteur", "Malca-Amit"], ["LTA", "147-88214930"]] },
          { t: "Dédouanement import & transport sous escorte", loc: "Aéroport JFK (New York) — Douanes américaines (CBP)", b: "Déclaration d'entrée auprès du CBP américain sur la ligne tarifaire du doré, inspection de l'intégrité des scellés à l'arrivée, puis transfert en véhicule blindé depuis la zone sécurisée aéroportuaire jusqu'au quai de réception de la raffinerie. Scellés rompus uniquement sous supervision.", kv: [["Déclaration CBP", "CBP-2026-118204"], ["Escorte", "Convoi sécurisé de New York"], ["Contrôle scellés", "Intacts à l'arrivée"]] },
          { t: "Livraison, fonte & règlement de pureté", loc: "Affineur nord-américain — LBMA Good Delivery", b: "Poids d'entrée en raffinerie enregistré, matière fondue et homogénéisée, l'essai final au feu détermine le titre de règlement. Le séquestre libère les fonds au producteur et à Gold Corridor contre le certificat d'essai.", kv: [["Poids d'entrée", "En attente"], ["Essai final", "En attente"], ["Libération séquestre", "Bloquée"]] },
        ],
        consignments: [
          { id: "AGL-2609-02", meta: "14,20 kg doré · Ouagadougou → New York", stage: 2, cards: ["14,20 kg", "92,6 % Au", "1 182 400 $", "15 août 2026"] },
          { id: "AGL-2609-03", meta: "8,65 kg doré · Ouagadougou → Zurich", stage: 1, cards: ["8,65 kg", "91,4 % Au", "711 900 $", "19 août 2026"] },
          { id: "AGL-2608-01", meta: "22,40 kg doré · Ouagadougou → New York", stage: 4, cards: ["22,40 kg", "99,34 % réglé", "1 864 200 $", "Réglé le 9 août"] },
        ],
      },
    },
  },
};

/* ══════════════════════════════════════════════════════════════
   3 · I18N CONTEXT
   ══════════════════════════════════════════════════════════════ */
const I18n = createContext(null);
const useT = () => useContext(I18n);

/* ══════════════════════════════════════════════════════════════
   4 · PRIMITIVES
   ══════════════════════════════════════════════════════════════ */
const GOLD = "#D4AF37";

/* Silver — the second metal. Gold marks Gold Corridor and live/cleared state;
   silver marks the counterparty and the un-gilded (pending) state, so the
   two never collapse into one meaning. */
const SILVER = {
  base: "#C9CDD4",
  bright: "#EEF1F5",
  mid: "#A8AEB8",
  dim: "#7E8590",
  grad: "linear-gradient(150deg,#F2F4F8 0%,#C9CDD4 36%,#8E959F 66%,#DDE1E7 100%)",
};
const GOLD_GRAD = "linear-gradient(150deg,#E7CB63 0%,#D4AF37 42%,#9C7C22 100%)";

/* ── procedural molten metal ─────────────────────────────────
   Rendered into a deliberately tiny buffer and scaled up under a CSS
   blur: the upscale is the bloom. Cheap enough to run at ~29fps. */
const PERM = (() => {
  const p = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  for (let i = 0; i < 256; i++) p[256 + i] = p[i];
  return p;
})();
const fadeCurve = (t) => t * t * (3 - 2 * t);

function vnoise(x, y, z) {
  const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
  const u = fadeCurve(x - X), v = fadeCurve(y - Y), w = fadeCurve(z - Z);
  const xi = X & 255, yi = Y & 255, zi = Z & 255;

  const A = PERM[xi] + yi, B = PERM[xi + 1] + yi;
  const AA = PERM[A & 255] + zi, AB = PERM[(A + 1) & 255] + zi;
  const BA = PERM[B & 255] + zi, BB = PERM[(B + 1) & 255] + zi;

  const c000 = PERM[AA & 255], c001 = PERM[(AA + 1) & 255];
  const c010 = PERM[AB & 255], c011 = PERM[(AB + 1) & 255];
  const c100 = PERM[BA & 255], c101 = PERM[(BA + 1) & 255];
  const c110 = PERM[BB & 255], c111 = PERM[(BB + 1) & 255];

  const x00 = c000 + (c100 - c000) * u, x10 = c010 + (c110 - c010) * u;
  const x01 = c001 + (c101 - c001) * u, x11 = c011 + (c111 - c011) * u;
  const y0 = x00 + (x10 - x00) * v, y1 = x01 + (x11 - x01) * v;
  return (y0 + (y1 - y0) * w) / 255;
}

/* Temperature ramp. The top stop is silver, not gold — real metal goes
   white at its hottest, which is what seats the second metal in the image. */
const RAMP = [
  [0.0, 10, 14, 26], [0.26, 48, 26, 16], [0.44, 126, 62, 18], [0.58, 186, 120, 32],
  [0.72, 212, 175, 55], [0.86, 242, 219, 138], [1.0, 238, 241, 246],
];
function ramp(t, out) {
  const edge = (s) => { out[0] = s[1]; out[1] = s[2]; out[2] = s[3]; };
  if (t <= 0) { edge(RAMP[0]); return; }
  if (t >= 1) { edge(RAMP[RAMP.length - 1]); return; }
  for (let i = 1; i < RAMP.length; i++) {
    if (t <= RAMP[i][0]) {
      const a = RAMP[i - 1], b = RAMP[i], k = (t - a[0]) / (b[0] - a[0]);
      out[0] = a[1] + (b[1] - a[1]) * k;
      out[1] = a[2] + (b[2] - a[2]) * k;
      out[2] = a[3] + (b[3] - a[3]) * k;
      return;
    }
  }
}

function paintMolten(cv, buf, time, heat) {
  const W = cv.width, H = cv.height;
  const ctx = cv.getContext("2d", { alpha: false });
  const d = buf.data, rgb = [0, 0, 0];

  for (let y = 0; y < H; y++) {
    const ny = y / H;
    for (let x = 0; x < W; x++) {
      const nx = x / W;

      let n = 0, amp = 0.5, fx = 3.1, fy = 2.3;
      for (let o = 0; o < 3; o++) {
        n += vnoise(nx * fx, ny * fy - time * 0.3, time * 0.13 + o * 11.3) * amp;
        amp *= 0.5; fx *= 2.02; fy *= 2.02;
      }
      n /= 0.875;

      // the pour sits low-right; the headline side stays cool and legible
      let mask = ny * 1.24 + nx * 0.62 - 0.34;
      mask = mask < 0 ? 0 : mask > 1 ? 1 : mask;
      mask *= mask;

      let t = (n - 0.34) / 0.4;
      t = t * (0.3 + mask * 1.35) * heat;

      ramp(t, rgb);
      const i = (y * W + x) * 4;
      d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255;
    }
  }
  ctx.putImageData(buf, 0, 0);
}

function MoltenBackdrop({ still = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = still ? 150 : 168;
    cv.height = still ? 96 : 104;
    const buf = cv.getContext("2d", { alpha: false }).createImageData(cv.width, cv.height);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || reduce) { paintMolten(cv, buf, still ? 4.7 : 2.4, still ? 0.82 : 1); return; }

    let raf, last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 34) return;   // ~29fps; the blur hides the rest
      last = now;
      paintMolten(cv, buf, now / 1000, 1);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 block h-full w-full"
      style={{
        filter: still ? "blur(20px) saturate(.9)" : "blur(15px) saturate(1.12) contrast(1.05)",
        transform: still ? "scale(1.1)" : "scale(1.08)",
        opacity: still ? 0.42 : 0.92,
      }}
    />
  );
}

const Eyebrow = ({ children, onNavy }) => (
  <div className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] ${onNavy ? "text-[#D4AF37]" : "text-[#B8952E]"}`}>
    {children}
  </div>
);

const TONE = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  move: "bg-amber-50 text-amber-700 border-amber-200",
  wait: "bg-[#C9CDD4]/10 text-[#7E8590] border-[#C9CDD4]",
  gold: "bg-[#D4AF37]/10 text-[#B8952E] border-[#D4AF37]/40",
};

const Pill = ({ tone = "ok", icon: Icon, children }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${TONE[tone]}`}>
    {Icon && <Icon size={11} strokeWidth={2.2} />}
    {children}
  </span>
);

const Button = ({ variant = "gold", icon: Icon, children, className = "", ...rest }) => {
  const base = "inline-flex items-center justify-center gap-2.5 rounded-sm px-6 py-3.5 text-[13.5px] font-bold tracking-[0.015em] transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]";
  const skin = {
    gold: "bg-[#D4AF37] text-[#0B1120] shadow-[0_10px_26px_-14px_rgba(212,175,55,0.9)] hover:bg-[#E0BC46] hover:-translate-y-px",
    // struck silver bar beside the gold one — the palette's thesis statement
    ghost: "border border-[#EEF1F5] text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_10px_26px_-14px_rgba(201,205,212,.85)] hover:brightness-[1.07] hover:-translate-y-px",
    outline: "border border-slate-300 bg-white text-slate-900 hover:border-[#D4AF37] hover:text-[#B8952E]",
  }[variant];
  // gold stays a flat fill so its hover class still applies; only the
  // silver ghost needs an inline gradient
  const style = variant === "ghost" ? { background: SILVER.grad } : undefined;
  return <button style={style} className={`${base} ${skin} ${className}`} {...rest}>{children}{Icon && <Icon size={16} />}</button>;
};

const Panel = ({ title, sub, action, children, bodyClass = "p-6" }) => (
  <section className="rounded-sm border border-slate-200 bg-white">
    {(title || action) && (
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          {title && <h3 className="text-[14.5px] font-bold tracking-tight text-slate-900">{title}</h3>}
          {sub && <p className="mt-1 text-[11.8px] text-slate-500">{sub}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={bodyClass}>{children}</div>
  </section>
);

const LivePulse = ({ label }) => (
  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </span>
    {label}
  </span>
);

/**
 * Brand mark — two cast bars, gold crowning silver.
 *
 * A generic icon inside a gold square read as an icon, not as bullion. A bar
 * with a struck top face, a specular edge and a hallmark reads as metal, and
 * the radial glow lifts it off the navy masthead.
 *
 * `id` must be unique per rendered instance: duplicate gradient ids in one
 * document silently cross-wire the fills.
 */
function BrandMark({ id, className = "h-[46px] w-[46px]" }) {
  return (
    <div className={`relative grid shrink-0 place-items-center ${className}`}>
      <span
        className="absolute -inset-2 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(212,175,55,.34) 0%,rgba(212,175,55,.10) 45%,rgba(212,175,55,0) 70%)" }}
      />
      <svg
        viewBox="0 0 44 44" aria-hidden="true" focusable="false"
        className="relative h-full w-full"
        style={{ filter: "drop-shadow(0 3px 7px rgba(0,0,0,.55)) drop-shadow(0 0 12px rgba(212,175,55,.30))" }}
      >
        <defs>
          <linearGradient id={`agl-g-${id}`} x1="0" y1="0" x2=".42" y2="1">
            <stop offset="0" stopColor="#F9EDB2" />
            <stop offset=".28" stopColor="#E5C75C" />
            <stop offset=".60" stopColor="#C39B27" />
            <stop offset="1" stopColor="#8B6A14" />
          </linearGradient>
          <linearGradient id={`agl-s-${id}`} x1="0" y1="0" x2=".42" y2="1">
            <stop offset="0" stopColor="#FCFDFE" />
            <stop offset=".30" stopColor="#DADEE5" />
            <stop offset=".64" stopColor="#A3AAB5" />
            <stop offset="1" stopColor="#737A86" />
          </linearGradient>
        </defs>
        {/* silver bar, bearing the weight */}
        <path d="M10.5 24.5 H33.5 L37 34.5 H7 Z" fill={`url(#agl-s-${id})`} />
        <path d="M10.5 24.5 H33.5 L34.2 26.4 H9.8 Z" fill="#FFFFFF" opacity=".5" />
        {/* gold bar, crowning */}
        <path d="M13 10 H31 L34 20.5 H10 Z" fill={`url(#agl-g-${id})`} />
        <path d="M13 10 H31 L31.6 12 H12.4 Z" fill="#FFF7D4" opacity=".7" />
        {/* struck hallmark on the gold face */}
        <path d="M15.6 15.4 H28.4" stroke="#6B5210" strokeWidth="1.5" strokeLinecap="round" opacity=".38" />
      </svg>
    </div>
  );
}

const FounderName = ({ f }) =>
  f.isPlaceholder
    ? <span className="border-b-[1.5px] border-dotted border-[#D4AF37] pb-px text-[#D4AF37]">{f.name}</span>
    : <>{f.name}</>;

/* ══════════════════════════════════════════════════════════════
   5 · SHARED CHROME
   ══════════════════════════════════════════════════════════════ */
function UtilityRail({ lang, setLang }) {
  const L = useT();
  return (
    <div className="border-b border-white/5 bg-[#0B1120]">
      <div className="mx-auto flex h-[38px] w-full max-w-[1240px] items-center justify-between gap-5 px-7">
        <div className="hidden items-center gap-5 text-[11.5px] text-slate-400 md:flex">
          <span className="flex items-center gap-2"><Clock size={13} className="text-[#D4AF37]/80" />{L.rail.hours}</span>
          <span className="flex items-center gap-2"><Lock size={13} className="text-[#D4AF37]/80" />{L.rail.secure}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{L.rail.lang}</span>
          <div className="flex overflow-hidden rounded-sm border border-[#D4AF37]/30" role="group" aria-label={L.rail.lang}>
            {["en", "fr"].map((k) => (
              <button
                key={k}
                onClick={() => setLang(k)}
                aria-pressed={lang === k}
                className={`px-3.5 py-1 font-mono text-[10.5px] font-semibold tracking-[0.14em] transition ${
                  lang === k ? "bg-[#D4AF37] text-[#0B1120]" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* A second tier rather than crowding the masthead: brand and phase switcher
   stay legible, and the page links get room to breathe. */
function SubNav({ page, setPage }) {
  const M = useT().menu;
  const links = [["home", M.home], ["comply", M.comply], ["services", M.services], ["founder", M.founder], ["contact", M.contact]];

  return (
    <div className="border-t border-white/[0.06] bg-black/[0.26]">
      <nav aria-label="Pages" className="mx-auto flex h-[50px] w-full max-w-[1240px] items-center gap-0.5 overflow-x-auto px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            aria-current={page === id ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-sm px-4 py-2.5 text-[13px] transition ${
              page === id
                ? "font-semibold text-[#D4AF37] after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:bg-[#D4AF37] after:content-['']"
                : "font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setPage("intake")}
          className="ml-auto shrink-0 whitespace-nowrap rounded-sm px-[18px] py-2.5 text-[12.5px] font-bold text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.4)] transition hover:brightness-[1.07]"
          style={{ background: GOLD_GRAD }}
        >
          {M.cta}
        </button>
      </nav>
    </div>
  );
}

/* Home is the hero plus an index of the other pages — without it a landing
   page with no scroll gives the visitor nowhere obvious to go. */
const INDEX_ICONS = { shield: ShieldCheck, gem: Gem, users: Users, phone: Phone };

function HomeIndex({ setPage }) {
  const L = useT().index;
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-[1240px] px-7">
        <div className="mb-[18px]"><Eyebrow>{L.eyebrow}</Eyebrow></div>
        <div className="grid gap-5 md:grid-cols-2">
          {L.cards.map((c) => {
            const Icon = INDEX_ICONS[c.i];
            return (
              <button
                key={c.p}
                onClick={() => setPage(c.p)}
                className="flex w-full items-start gap-[18px] border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-[0_12px_30px_-22px_rgba(15,23,42,.5)]"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center bg-slate-900 text-[#D4AF37]"><Icon size={19} /></div>
                <div className="min-w-0">
                  <h3 className="text-[16.5px] font-bold tracking-tight text-slate-900">{c.t}</h3>
                  <p className="mt-1.5 text-[13.2px] leading-relaxed text-slate-600">{c.d}</p>
                </div>
                <ArrowRight size={17} className="mt-3 shrink-0 text-[#D4AF37]" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Masthead({ view, setView, page, setPage }) {
  const L = useT();
  const tabs = [
    { k: "a", icon: Globe, label: L.phase.a, tag: L.phase.atag },
    { k: "b", icon: LayoutDashboard, label: L.phase.b, tag: L.phase.btag },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-[#D4AF37]/15 bg-slate-900">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-7 px-7 py-3">
        <button onClick={() => setPage("home")} aria-label="Gold Corridor — home" className="flex items-center gap-3.5 text-left">
          <BrandMark id="mast" />
          <div>
            <div className="text-[19px] font-bold leading-none tracking-[0.16em] text-white">GOLD CORRIDOR</div>
            <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.19em] text-[#D4AF37]">{L.brand.sub}</div>
          </div>
        </button>
        <nav role="tablist" aria-label="Platform phase" className="flex w-full gap-1.5 rounded-sm border border-white/10 bg-white/[0.045] p-1.5 sm:w-auto">
          {tabs.map(({ k, icon: Icon, label, tag }) => (
            <button
              key={k}
              role="tab"
              aria-selected={view === k}
              onClick={() => { setView(k); window.scrollTo(0, 0); }}
              /* Phase I is Gold Corridor's own storefront — gold. Phase II is the
                 client's workspace — silver. The switcher carries the split. */
              style={view === k ? { background: k === "b" ? SILVER.grad : GOLD_GRAD } : undefined}
              className={`flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-[1px] px-4 py-2.5 text-[12.5px] font-semibold transition sm:flex-none ${
                view === k
                  ? "text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.5)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
              <span className="hidden rounded-[1px] border border-current px-1.5 py-px font-mono text-[9px] tracking-[0.14em] opacity-55 lg:inline">{tag}</span>
            </button>
          ))}
        </nav>
      </div>
      {view === "a" && <SubNav page={page} setPage={setPage} />}
    </header>
  );
}

function SiteFooter() {
  const L = useT().foot;
  const col = (h, items) => (
    <div>
      <h5 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[#D4AF37]">{h}</h5>
      <ul className="flex flex-col gap-2.5 text-[13px]">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
  return (
    <footer className="border-t border-[#D4AF37]/15 bg-[#0B1120] pb-8 pt-14 text-slate-400">
      <div className="mx-auto w-full max-w-[1240px] px-7">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark id="foot" className="h-[34px] w-[34px]" />
              <div className="text-[16px] font-bold tracking-[0.16em] text-white">GOLD CORRIDOR</div>
            </div>
            <p className="mt-4 max-w-[38ch] text-[13px] leading-relaxed">{L.blurb}</p>
          </div>
          {col(L.c1, L.c1i)}
          {col(L.c2, L.c2i)}
          {col(L.c3, L.c3i)}
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-5 border-t border-white/[0.07] pt-6 text-[11.5px] text-slate-500">
          <span>{L.legal}</span><span>{L.disc}</span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   6 · PHASE A — PUBLIC SITE
   ══════════════════════════════════════════════════════════════ */
function Hero({ onIntake, onTerms }) {
  const L = useT();
  const legIcons = [MapPin, Plane, Factory];
  return (
    <section className="relative isolate overflow-hidden bg-slate-900 py-20 text-white">
      {HERO_IMAGE ? (
        <img src={HERO_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <MoltenBackdrop />
      )}

      {/* Scrim: near-opaque navy on the headline side, opening up over the
          pour. This is what keeps the type legible over a live backdrop. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg,#0F172A 6%,rgba(15,23,42,.94) 30%,rgba(15,23,42,.62) 58%,rgba(15,23,42,.30) 100%)," +
            "linear-gradient(180deg,rgba(15,23,42,.55) 0%,rgba(15,23,42,0) 38%,rgba(15,23,42,.72) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px)",
          backgroundSize: "100% 46px",
          maskImage: "linear-gradient(180deg,#000,transparent 78%)",
          WebkitMaskImage: "linear-gradient(180deg,#000,transparent 78%)",
        }}
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1240px] px-7">
        <div className="grid items-start gap-16 lg:grid-cols-[1.32fr_0.88fr]">
          <div>
            <Eyebrow onNavy>{L.hero.eyebrow}</Eyebrow>
            <h1 className="mt-5 text-balance text-[clamp(34px,4.3vw,55px)] font-bold leading-[1.06] tracking-[-0.03em] text-white">
              {L.hero.t1}<em className="not-italic text-[#D4AF37]">{L.hero.t2}</em>{L.hero.t3}
            </h1>
            <p className="mt-6 max-w-[64ch] text-[16.5px] leading-[1.72] text-slate-300">{L.hero.lede}</p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button icon={ArrowRight} onClick={onIntake}>{L.hero.cta}</Button>
              <Button variant="ghost" onClick={onTerms}>{L.hero.cta2}</Button>
            </div>
            <p className="mt-5 flex items-start gap-2 text-[12px] text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0 text-[#D4AF37]" />{L.hero.note}
            </p>
          </div>

          <aside className="relative border border-[#C9CDD4]/30 bg-slate-900/60 p-6 backdrop-blur-md backdrop-saturate-150">
            <span className="absolute inset-x-0 top-0 h-px opacity-75" style={{ background: SILVER.grad }} />
            <div className="flex items-center justify-between border-b border-[#C9CDD4]/15 pb-4">
              <Eyebrow onNavy>{L.corridor.title}</Eyebrow>
              <LivePulse label={L.corridor.live} />
            </div>
            {L.corridor.legs.map((leg, i) => {
              const Icon = legIcons[i];
              return (
                <div key={leg.t} className={`flex items-start gap-3.5 py-4 ${i ? "border-t border-dashed border-white/10" : ""}`}>
                  {/* metal at rest is gold; metal in transit is silver */}
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center border ${
                      i === 1 ? "border-[#EEF1F5] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
                              : "border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37]"}`}
                    style={i === 1 ? { background: SILVER.grad } : undefined}
                  ><Icon size={15} /></div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-100">{leg.t}</div>
                    <div className="mt-0.5 text-[11.5px] text-slate-400">{leg.s}</div>
                  </div>
                  <div className="ml-auto whitespace-nowrap font-mono text-[11px] text-[#D4AF37]">{leg.r}</div>
                </div>
              );
            })}
          </aside>
        </div>

        <div
          className="relative z-[2] mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4"
          style={{ background: "linear-gradient(90deg,#D4AF37 0%,rgba(212,175,55,.5) 34%,#C9CDD4 72%,#A8AEB8 100%)" }}
        >
          {L.stats.map((s) => (
            <div key={s.l} className="bg-slate-900 px-5 py-6">
              <div className="font-mono text-[26px] font-semibold tabular-nums tracking-tight text-[#D4AF37]">{s.v}</div>
              <div className="mt-2 text-[11.5px] leading-snug text-slate-400">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compliance({ innerRef }) {
  const L = useT().comply;
  const icons = { shield: ShieldCheck, scale: Scale, key: KeyRound };
  return (
    <section ref={innerRef} id="comply" className="scroll-mt-[140px] border-y border-slate-200 bg-white py-20">
      <div className="mx-auto w-full max-w-[1240px] px-7">
        <header className="mb-11 max-w-[70ch]">
          <Eyebrow>{L.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 text-balance text-[clamp(25px,3vw,35px)] font-bold tracking-tight text-slate-900">{L.h}</h2>
          <p className="mt-4 text-[16.5px] leading-[1.72] text-slate-600">{L.lede}</p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {L.items.map((it) => {
            const Icon = icons[it.i];
            return (
              <article key={it.t} className="relative flex flex-col gap-3.5 border border-slate-200 bg-white p-7">
                {/* bimetallic rule — the palette stated literally, gold pouring into silver */}
                <span
                  className="absolute -left-px -right-px -top-px h-[3px]"
                  style={{ background: "linear-gradient(90deg,#9C7C22 0%,#D4AF37 22%,#E7CB63 40%,#EEF1F5 64%,#A8AEB8 100%)" }}
                />
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="grid h-11 w-11 place-items-center text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.65),0_0_0_1px_rgba(126,133,144,.35)]"
                    style={{ background: SILVER.grad }}
                  ><Icon size={20} /></div>
                  <Pill tone="ok" icon={CheckCircle2}>{it.s}</Pill>
                </div>
                <h3 className="text-[16px] font-bold text-slate-900">{it.t}</h3>
                <p className="text-[13.5px] leading-relaxed text-slate-600">{it.b}</p>
                <div className="mt-auto border-t border-dashed border-slate-200 pt-3.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-slate-500">{it.f}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const SERVICE_ICONS = { shield: ShieldCheck, users: Users, flask: FlaskConical, plane: Plane, key: KeyRound, factory: Factory };

/**
 * Services.
 *
 * Numbered 01–06 because this genuinely is the order the work happens in —
 * verify, match, assay, ship, settle, deliver. The seventh block is
 * deliberately unnumbered and full-width: compliance is not a stage, it runs
 * across all six. Numbering that does not encode a real sequence is decoration.
 */
function Services({ innerRef }) {
  const L = useT().services;
  return (
    <section ref={innerRef} id="services" className="scroll-mt-[140px] bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-[1240px] px-7">
        <header className="mb-11 max-w-[70ch]">
          <Eyebrow>{L.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 text-balance text-[clamp(25px,3vw,35px)] font-bold tracking-tight text-slate-900">{L.h}</h2>
          <p className="mt-4 text-[16.5px] leading-[1.72] text-slate-600">{L.lede}</p>
        </header>

        <div className="mb-3.5"><Eyebrow>{L.seqLabel}</Eyebrow></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {L.items.map((s) => {
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <article key={s.n} className="flex flex-col gap-3 border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.08em] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_0_0_1px_rgba(126,133,144,.32)]"
                    style={{ background: SILVER.grad }}
                  >{s.n}</span>
                  <div className="ml-auto grid h-[38px] w-[38px] shrink-0 place-items-center bg-slate-900 text-[#D4AF37]"><Icon size={17} /></div>
                </div>
                <h3 className="text-[15.5px] font-bold leading-snug text-slate-900">{s.t}</h3>
                <p className="text-[13.4px] leading-relaxed text-slate-600">{s.d}</p>
                <div className="mt-0.5 flex flex-col gap-2">
                  {s.pts.map((p) => (
                    <div key={p} className="flex gap-2.5 text-[12.6px] leading-snug text-slate-600">
                      <Check size={13} className="mt-0.5 shrink-0 text-[#D4AF37]" /><span>{p}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto border-t border-dashed border-slate-200 pt-3.5 font-mono text-[10.5px] tracking-[0.07em] text-slate-500">
                  <b className="font-semibold text-[#B8952E]">{s.basis}</b>
                </div>
              </article>
            );
          })}

          <div className="relative grid items-start gap-8 border border-[#D4AF37]/15 bg-slate-900 p-8 text-white md:col-span-2 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.4fr)] xl:col-span-3">
            <span
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ background: "linear-gradient(90deg,#D4AF37 0%,#E7CB63 30%,#EEF1F5 66%,#A8AEB8 100%)" }}
            />
            <div>
              <span
                className="mb-3.5 inline-block px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
                style={{ background: SILVER.grad }}
              >{L.cross.tag}</span>
              <h3 className="text-[19px] font-bold text-white">{L.cross.t}</h3>
              <p className="mt-3 text-[13.6px] leading-[1.7] text-slate-400">{L.cross.d}</p>
            </div>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {L.cross.pts.map((p) => (
                <div key={p} className="flex gap-2.5 text-[12.8px] leading-snug text-slate-400">
                  <Check size={14} className="mt-0.5 shrink-0 text-[#D4AF37]" /><span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Publishing the refusals is itself a trust service — every serious
            buyer in this market has been burned by at least one of them. */}
        <div className="mt-9 border border-slate-200 bg-white">
          <header className="border-b border-l-[3px] border-slate-200 border-l-rose-700 px-7 py-6">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-rose-700">{L.refuse.eyebrow}</div>
            <h3 className="mt-2.5 text-[20px] font-bold tracking-tight text-slate-900">{L.refuse.t}</h3>
            <p className="mt-3 max-w-[78ch] text-[13.6px] leading-relaxed text-slate-600">{L.refuse.lede}</p>
          </header>

          <div className="hidden gap-[18px] border-b border-slate-200 bg-slate-50 px-7 py-3 font-mono text-[9.8px] font-semibold uppercase tracking-[0.13em] text-slate-500 md:grid md:grid-cols-[auto_minmax(0,.9fr)_minmax(0,1.3fr)]">
            <span className="w-[22px]" /><span>{L.refuse.th[0]}</span><span>{L.refuse.th[1]}</span>
          </div>

          {L.refuse.rows.map(([flag, why], i) => (
            <div
              key={flag}
              className={`grid grid-cols-[auto_1fr] items-start gap-x-[14px] gap-y-2.5 px-7 py-4 hover:bg-slate-50 md:grid-cols-[auto_minmax(0,.9fr)_minmax(0,1.3fr)] md:gap-[18px] ${i ? "border-t border-slate-100" : ""}`}
            >
              <div className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border border-rose-200 bg-rose-50 text-rose-700"><X size={12} /></div>
              <div className="text-[13.6px] font-bold leading-snug text-slate-900">{flag}</div>
              <div className="col-start-2 text-[13px] leading-relaxed text-slate-600 md:col-start-3">{why}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * A single principal gets a portrait column, not half of a two-up grid — the
 * layout has to look composed for one, never like a second card went missing.
 */
function FounderBlock({ data, badge }) {
  return (
    <article className="relative grid items-start gap-10 border border-[#D4AF37]/15 bg-white/[0.032] p-10 lg:grid-cols-[auto_1fr]">
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: "linear-gradient(90deg,#D4AF37 0%,#E7CB63 30%,#EEF1F5 66%,#A8AEB8 100%)" }}
      />

      <div className="flex w-auto flex-row items-center gap-[18px] lg:w-[156px] lg:flex-col lg:gap-[18px]">
        {/* bimetallic medallion — gold face, silver rim */}
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-[22px] font-bold tracking-[0.07em] text-[#0B1120] lg:h-[104px] lg:w-[104px] lg:text-[27px]"
          style={{
            background: GOLD_GRAD,
            boxShadow: `0 0 0 1px rgba(255,255,255,.4), 0 0 0 3px #0F172A, 0 0 0 8px ${SILVER.base}`,
            outline: "1px solid rgba(255,255,255,.35)",
            outlineOffset: "7px",
          }}
        >
          {FOUNDER.initials}
        </div>
        <div
          className="px-3 py-1.5 text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
          style={{ background: SILVER.grad }}
        >
          {badge}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="text-[clamp(24px,2.6vw,31px)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
          <FounderName f={FOUNDER} />
        </h3>
        <div className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.15em] text-[#D4AF37]">{data.role}</div>
        <p className="mt-5 max-w-[70ch] text-[14.6px] leading-[1.75] text-slate-400">{data.bio}</p>
        <div className="mt-6 grid gap-x-6 gap-y-3 border-t border-dashed border-white/[0.13] pt-5 sm:grid-cols-2">
          {data.facts.map((f) => (
            <div key={f} className="flex items-start gap-2.5 text-[12.8px] leading-snug text-slate-400">
              <Check size={14} className="mt-1 shrink-0 text-[#D4AF37]" /><span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function Founders() {
  const L = useT().founders;
  return (
    <section id="founder" className="relative isolate scroll-mt-[140px] overflow-hidden bg-slate-900 py-20 text-white">
      <MoltenBackdrop still />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#0F172A 0%,rgba(15,23,42,.90) 26%,rgba(15,23,42,.90) 74%,#0F172A 100%)," +
            "linear-gradient(90deg,rgba(15,23,42,.85) 0%,rgba(15,23,42,.35) 55%,rgba(15,23,42,.8) 100%)",
        }}
      />
      <div className="relative z-[2] mx-auto w-full max-w-[1240px] px-7">
        <header className="mb-11 max-w-[70ch]">
          <Eyebrow onNavy>{L.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 text-balance text-[clamp(25px,3vw,35px)] font-bold tracking-tight text-white">{L.h}</h2>
          <p className="mt-4 text-[16.5px] leading-[1.72] text-slate-300">{L.lede}</p>
        </header>

        <FounderBlock data={L.one} badge={L.badge} />

        <div className="mt-7 grid items-start gap-6 border border-l-[3px] border-[#D4AF37]/15 border-l-[#D4AF37] bg-white/[0.04] p-9 md:grid-cols-[auto_1fr]">
          <Quote size={34} className="shrink-0 text-[#D4AF37]/55" />
          <div>
            <Eyebrow onNavy>{L.msgTitle}</Eyebrow>
            <blockquote className="mt-3.5 text-[19.5px] leading-[1.56] tracking-tight text-slate-100">“{L.quote}”</blockquote>
            <div className="mt-6 flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-[0.09em] text-slate-400">
              <span className="font-semibold text-[#D4AF37]">{FOUNDER.name}</span>
              <span>{L.sigLabel}</span>
              <span>{L.sigCo}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── intake form ───────────────────────────────────────────── */
const labelCls = "font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500";
const inputCls = "w-full rounded-sm border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:bg-white focus:ring-[3px] focus:ring-[#D4AF37]/10";

const Field = ({ id, label, required = true, children }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className={labelCls}>{label} {required && <span className="text-[#D4AF37]">*</span>}</label>
    {children}
  </div>
);

function Fieldset({ n, title, children, first }) {
  return (
    <div className={first ? "" : "mt-8 border-t border-slate-200 pt-7"}>
      <div className="mb-5 flex items-center gap-3">
        <div
          className="grid h-[26px] w-[26px] shrink-0 place-items-center font-mono text-[11.5px] font-bold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_0_0_1px_rgba(126,133,144,.35)]"
          style={{ background: SILVER.grad }}
        >{n}</div>
        <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function fmtSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function IntakeForm({ innerRef, onSuccess }) {
  const L = useT().intake;
  const [form, setForm] = useState({});
  const [terms, setTerms] = useState("FOB");
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const picker = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const addFiles = (list) => setFiles((f) => [...f, ...[...list].map((x) => ({ n: x.name, s: fmtSize(x.size) }))]);

  const submit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity() || !consent) { e.currentTarget.reportValidity(); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onSuccess(`AGL-INT-2608-${Math.floor(1000 + Math.random() * 8999)}`);
      setForm({}); setFiles([]); setConsent(false);
    }, 1150);
  };

  const Seg = ({ k, data }) => (
    <button
      type="button"
      onClick={() => setTerms(k)}
      aria-pressed={terms === k}
      className={`rounded-sm border p-4 text-left transition ${terms === k ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
    >
      <div className="flex items-center justify-between gap-2 text-[13.5px] font-bold text-slate-900">
        <span>{data.t}</span>
        {terms === k ? <CheckCircle2 size={16} className="text-[#D4AF37]" /> : <Circle size={16} className="text-slate-300" />}
      </div>
      <div className="mt-1 text-[11.5px] leading-snug text-slate-500">{data.s}</div>
    </button>
  );

  return (
    <section ref={innerRef} id="intake" className="scroll-mt-[140px] bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-[1240px] px-7">
        <header className="mb-11 max-w-[70ch]">
          <Eyebrow>{L.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 text-balance text-[clamp(25px,3vw,35px)] font-bold tracking-tight text-slate-900">{L.h}</h2>
          <p className="mt-4 text-[16.5px] leading-[1.72] text-slate-600">{L.lede}</p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[0.86fr_1.34fr] lg:gap-12">
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[104px]">
            <div className="flex flex-col gap-3 border border-slate-200 bg-white p-6">
              <h4 className={labelCls}>{L.checklistT}</h4>
              {L.checklist.map((c) => (
                <div key={c} className="flex gap-3 text-[13.4px] leading-relaxed text-slate-600">
                  <CheckCircle2 size={15} className="mt-1 shrink-0 text-[#D4AF37]" /><span>{c}</span>
                </div>
              ))}
            </div>
            <div
              className="bg-slate-900 p-6 text-white"
              style={{ borderTop: "3px solid transparent", borderImage: "linear-gradient(90deg,#D4AF37 0%,#E7CB63 38%,#EEF1F5 70%,#A8AEB8 100%) 1" }}
            >
              <div
                className="font-mono text-[34px] tabular-nums text-transparent"
                style={{ background: SILVER.grad, WebkitBackgroundClip: "text", backgroundClip: "text" }}
              >{L.slaK}</div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-slate-400">{L.slaV}</p>
            </div>
          </aside>

          <form onSubmit={submit} noValidate className="border border-slate-200 bg-white p-9">
            <Fieldset first n="1" title={L.fs1}>
              <div className="grid gap-[18px] sm:grid-cols-2">
                <Field id="entity" label={L.f.entity}><input id="entity" required className={inputCls} placeholder={L.f.entityP} value={form.entity || ""} onChange={set("entity")} /></Field>
                <Field id="country" label={L.f.country}>
                  <select id="country" required className={inputCls} value={form.country || ""} onChange={set("country")}>
                    <option value="" disabled>{L.f.countryP}</option>
                    {L.countries.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field id="reg" label={L.f.reg}><input id="reg" required className={inputCls} placeholder={L.f.regP} value={form.reg || ""} onChange={set("reg")} /></Field>
                {/* id is contactName, not plain contact — the latter would
                    collide with the Contact section anchor and hijack the
                    nav link, since getElementById returns the first match */}
                <Field id="contactName" label={L.f.contact}><input id="contactName" required className={inputCls} placeholder={L.f.contactP} value={form.contactName || ""} onChange={set("contactName")} /></Field>
                <Field id="email" label={L.f.email}><input id="email" type="email" required className={inputCls} placeholder={L.f.emailP} value={form.email || ""} onChange={set("email")} /></Field>
                <Field id="phone" label={L.f.phone}><input id="phone" type="tel" required className={inputCls} placeholder={L.f.phoneP} value={form.phone || ""} onChange={set("phone")} /></Field>
              </div>
            </Fieldset>

            <Fieldset n="2" title={L.fs2}>
              <div className="grid gap-[18px] sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id="cls" label={L.f.cls}>
                    <select id="cls" required className={inputCls} value={form.cls || ""} onChange={set("cls")}>
                      <option value="" disabled>{L.f.clsP}</option>
                      {L.classes.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <div className={`${labelCls} mb-2`}>{L.f.terms} <span className="text-[#D4AF37]">*</span></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Seg k="FOB" data={L.fob} /><Seg k="CIF" data={L.cif} />
                  </div>
                </div>
                <Field id="vol" label={L.f.vol}><input id="vol" type="number" min="1" required className={inputCls} placeholder={L.f.volP} value={form.vol || ""} onChange={set("vol")} /></Field>
                <Field id="unit" label={L.f.unit}>
                  <select id="unit" required className={inputCls} value={form.unit || ""} onChange={set("unit")}>
                    <option value="" disabled>{L.units[0]}</option>
                    {L.units.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </Field>
                <Field id="window" label={L.f.firstShip}>
                  <select id="window" required className={inputCls} value={form.window || ""} onChange={set("window")}>
                    <option value="" disabled>{L.f.firstShipP}</option>
                    {L.windows.map((w) => <option key={w}>{w}</option>)}
                  </select>
                </Field>
                <Field id="dest" label={L.f.dest} required={false}><input id="dest" className={inputCls} placeholder={L.f.destP} value={form.dest || ""} onChange={set("dest")} /></Field>
                <div className="sm:col-span-2">
                  <Field id="notes" label={L.f.notes} required={false}>
                    <textarea id="notes" rows={4} className={`${inputCls} resize-y leading-relaxed`} placeholder={L.f.notesP} value={form.notes || ""} onChange={set("notes")} />
                  </Field>
                </div>
              </div>
            </Fieldset>

            <Fieldset n="3" title={L.fs3}>
              <button
                type="button"
                onClick={() => picker.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
                className={`w-full rounded-sm border-[1.5px] border-dashed px-6 py-8 text-center transition ${over ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-slate-300 bg-slate-50 hover:border-[#D4AF37] hover:bg-[#D4AF37]/[0.06]"}`}
              >
                <div
                  className="mx-auto mb-3.5 grid h-12 w-12 place-items-center text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.65),0_0_0_1px_rgba(126,133,144,.35)]"
                  style={{ background: SILVER.grad }}
                ><UploadCloud size={20} /></div>
                <div className="text-[14px] font-bold text-slate-900">{L.dropT}</div>
                <div className="mt-1.5 text-[12px] text-slate-500">{L.dropS}</div>
                <div className="mt-3.5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-emerald-600">
                  <Lock size={12} />{L.dropE}
                </div>
              </button>
              <input ref={picker} type="file" multiple hidden onChange={(e) => e.target.files?.length && addFiles(e.target.files)} />

              {files.length > 0 && (
                <div className="mt-3.5 flex flex-col gap-2">
                  {files.map((f, i) => (
                    <div key={`${f.n}-${i}`} className="flex items-center gap-3 rounded-sm border border-slate-200 bg-white px-3.5 py-3">
                      <FileText size={16} className="shrink-0 text-[#D4AF37]" />
                      <div className="truncate text-[13px] font-semibold text-slate-900">{f.n}</div>
                      <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {f.s} <Lock size={10} className="text-emerald-600" /> AES-256
                      </span>
                      <button type="button" aria-label={`Remove ${f.n}`} onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}
                        className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-start gap-3 border border-slate-200 bg-slate-50 p-4">
                <input id="consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]" />
                <label htmlFor="consent" className="text-[12.6px] leading-relaxed text-slate-600">{L.consent}</label>
              </div>
            </Fieldset>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-2 text-[11.6px] text-slate-500">
                <ShieldCheck size={14} className="text-[#D4AF37]" />{L.footNote}
              </div>
              <Button type="submit" disabled={busy} icon={busy ? RefreshCw : ArrowRight}>
                {busy ? L.submitting : L.submit}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Contact({ innerRef }) {
  const L = useT().contact;
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <section ref={innerRef} id="contact" className="scroll-mt-[140px] border-y border-slate-200 bg-white py-20">
      <div className="mx-auto w-full max-w-[1240px] px-7">
        <header className="mb-11 max-w-[70ch]">
          <Eyebrow>{L.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 text-balance text-[clamp(25px,3vw,35px)] font-bold tracking-tight text-slate-900">{L.h}</h2>
          <p className="mt-4 text-[16.5px] leading-[1.72] text-slate-600">{L.lede}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {L.offices.map((o) => (
            <article key={o.city} className="flex flex-col gap-4 border border-slate-200 bg-white p-7">
              <div className="text-[21px] font-bold leading-tight tracking-[-0.018em] text-slate-900">{o.city}</div>

              <div className="flex items-center gap-3.5 border-t border-dashed border-slate-200 pt-3.5">
                <div
                  className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-[13px] font-bold tracking-wide text-[#0B1120]"
                  style={{ background: GOLD_GRAD, boxShadow: `0 0 0 1px rgba(255,255,255,.4), 0 0 0 2px #fff, 0 0 0 4px ${SILVER.base}` }}
                >{initials(o.name)}</div>
                <div>
                  <div className="text-[15px] font-bold text-slate-900">{o.name}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.13em] text-[#B8952E]">{o.role}</div>
                </div>
              </div>

              <a
                href={`tel:${o.href}`}
                aria-label={`${L.callLabel} ${o.name}`}
                className="inline-flex items-center gap-3 rounded-sm border border-slate-200 bg-slate-50 px-3.5 py-3 font-mono text-[17px] tabular-nums tracking-[0.02em] text-slate-900 transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                <Phone size={16} className="shrink-0 text-[#D4AF37]" />
                {o.tel}
              </a>

              <div className="flex gap-3 text-[13.2px] leading-relaxed text-slate-600">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#D4AF37]" />
                <address className="not-italic">
                  {o.addr.map((line) => <div key={line}>{line}</div>)}
                </address>
              </div>

              <div className="mt-auto flex items-center gap-2.5 border-t border-dashed border-slate-200 pt-3.5 font-mono text-[10.5px] tracking-[0.08em] text-slate-500">
                <Clock size={13} className="shrink-0 text-[#7E8590]" />{o.hours}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex gap-3 rounded-sm border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-4 text-[12.7px] leading-relaxed text-slate-600">
          <Info size={16} className="mt-0.5 shrink-0 text-[#B8952E]" /><span>{L.note}</span>
        </div>
      </div>
    </section>
  );
}

function SuccessOverlay({ reference, onClose }) {
  const L = useT().intake;
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={L.okT}
      className="fixed inset-0 z-[90] grid place-items-center bg-[#0B1120]/90 p-6 backdrop-blur-md">
      <div className="w-full max-w-[560px] border border-[#D4AF37]/35 bg-slate-900 p-11 text-center shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]">
        <div
          className="mx-auto mb-6 grid h-[78px] w-[78px] place-items-center rounded-full text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_0_0_4px_#0F172A,0_0_0_6px_#D4AF37]"
          style={{ background: SILVER.grad }}
        >
          <Check size={36} strokeWidth={2.4} />
        </div>
        <h2 className="text-[27px] font-bold text-white">{L.okT}</h2>
        <p className="mt-3.5 text-[14.5px] leading-relaxed text-slate-400">{L.okB}</p>

        <div className="mt-6 border border-dashed border-[#D4AF37]/35 bg-white/[0.045] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{L.okRefL}</div>
          <div className="mt-1.5 font-mono text-[20px] tracking-[0.06em] text-[#D4AF37]">{reference}</div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 text-left">
          {L.okSteps.map((s) => (
            <div key={s} className="flex gap-3 text-[13px] leading-snug text-slate-400">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#D4AF37]" /><span>{s}</span>
            </div>
          ))}
        </div>

        <Button className="mt-7 w-full" onClick={onClose}>{L.okBtn}</Button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   7 · PHASE B — CLIENT PORTAL
   ══════════════════════════════════════════════════════════════ */
function useSpot() {
  const [spot, setSpot] = useState(() => {
    let v = 2404.15; const hist = [];
    for (let i = 0; i < 72; i++) { v += (Math.random() - 0.48) * 4.2; hist.push(v); }
    return { px: v, open: 2404.15, hi: 2431.9, lo: 2399.2, dir: 1, hist };
  });

  useEffect(() => {
    const id = setInterval(() => {
      setSpot((s) => {
        const drift = (Math.random() - 0.5) * 3.4;
        const px = Math.max(2280, Math.min(2560, s.px + drift));
        const hist = [...s.hist, px].slice(-200);
        return { ...s, px, hist, dir: drift >= 0 ? 1 : -1, hi: Math.max(s.hi, px), lo: Math.min(s.lo, px) };
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return spot;
}

function Sparkline({ data }) {
  const ref = useRef(null);
  const draw = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const x = cv.getContext("2d"); x.scale(dpr, dpr);
    const d = data.slice(-72), w = r.width, h = r.height;
    const min = Math.min(...d), max = Math.max(...d), span = max - min || 1;
    const PX = (i) => (i / (d.length - 1)) * w;
    const PY = (v) => h - 8 - ((v - min) / span) * (h - 16);

    x.clearRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,.055)"; x.lineWidth = 1;
    for (let g = 1; g < 4; g++) { const y = (h / 4) * g; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }

    const grad = x.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(212,175,55,.30)"); grad.addColorStop(1, "rgba(212,175,55,0)");
    x.beginPath(); x.moveTo(0, h); d.forEach((v, i) => x.lineTo(PX(i), PY(v)));
    x.lineTo(w, h); x.closePath(); x.fillStyle = grad; x.fill();

    x.beginPath(); d.forEach((v, i) => (i ? x.lineTo(PX(i), PY(v)) : x.moveTo(PX(i), PY(v))));
    x.strokeStyle = GOLD; x.lineWidth = 1.7; x.lineJoin = "round"; x.stroke();

    const ex = PX(d.length - 1), ey = PY(d[d.length - 1]);
    x.beginPath(); x.arc(ex, ey, 5.5, 0, Math.PI * 2); x.fillStyle = "rgba(212,175,55,.22)"; x.fill();
    x.beginPath(); x.arc(ex, ey, 2.6, 0, Math.PI * 2); x.fillStyle = GOLD; x.fill();
  }, [data]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return <div className="mt-4 h-[78px]"><canvas ref={ref} className="block h-full w-full" /></div>;
}

function SpotCard({ spot, locale }) {
  const L = useT().portal.px;
  const nf = (n, d) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const chg = spot.px - spot.open, pct = (chg / spot.open) * 100, up = chg >= 0;

  return (
    <div className="rounded-sm border border-[#D4AF37]/15 bg-slate-900 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <Eyebrow onNavy>XAU / USD</Eyebrow>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400">{L.fix}</div>
        </div>
        <LivePulse label={L.live} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className={`font-mono text-[44px] font-semibold tabular-nums tracking-[-0.03em] transition-colors duration-500 ${spot.dir >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          ${nf(spot.px, 2)}
        </div>
        <div className="pb-2 font-mono text-[12px] text-slate-400">{L.unit}</div>
        <div className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[12px] font-semibold ${
          up ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-rose-400/30 bg-rose-400/10 text-rose-400"}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {up ? "+" : "−"}{nf(Math.abs(chg), 2)} ({nf(Math.abs(pct), 2)}%)
        </div>
      </div>

      <Sparkline data={spot.hist} />

      <div className="mt-5 grid gap-px border border-[#D4AF37]/15 bg-[#D4AF37]/15 sm:grid-cols-3">
        {[nf(spot.px, 2), nf(spot.px * OZ_PER_KG, 0), nf((spot.px * OZ_PER_KG) / 1000, 2)].map((v, i) => (
          <div key={i} className="bg-slate-900 px-4 py-3.5">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500">{L.units[i].l}</div>
            <div className="mt-1.5 font-mono text-[17px] tabular-nums text-[#D4AF37]">${v}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11.4px] leading-snug text-slate-500">
        <Info size={13} className="mt-0.5 shrink-0 text-[#D4AF37]" />{L.disc}
      </p>
    </div>
  );
}

function Stepper({ stage, compact }) {
  const L = useT().portal.ship;
  return (
    <div className="grid gap-7 lg:grid-cols-4 lg:gap-0">
      {L.steps.map((s, i) => {
        const n = i + 1;
        const status = n < stage ? "done" : n === stage ? "live" : "wait";
        const fill = n < stage ? "100%" : n === stage ? "50%" : "0%";
        const last = i === L.steps.length - 1;

        return (
          <div key={s.t} className="relative pl-[52px] lg:px-4 lg:pl-4 lg:first:pl-0 lg:last:pr-0">
            {/* silver ahead of the shipment, gold behind it — the
                consignment gilds the route as it clears each milestone */}
            {!last && (
              <>
                <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-[#C9CDD4] lg:hidden">
                  <div className="w-full bg-[#D4AF37] transition-[height] duration-700" style={{ height: fill }} />
                </div>
                <div className="absolute left-0 right-0 top-[17px] hidden h-0.5 bg-[#C9CDD4] lg:block">
                  <div className="h-full bg-[#D4AF37] transition-[width] duration-700" style={{ width: fill }} />
                </div>
              </>
            )}

            <div
              className={`absolute left-0 top-0 z-[2] grid h-9 w-9 place-items-center rounded-full border-2 lg:relative lg:mb-[18px] ${
                status === "done" ? "border-[#D4AF37] text-[#0B1120]"
                : status === "live" ? "border-[#D4AF37] bg-white text-[#D4AF37] shadow-[0_0_0_6px_rgba(212,175,55,0.12)]"
                : "border-[#A8AEB8] text-slate-900"}`}
              style={
                status === "done" ? { background: GOLD_GRAD }
                : status === "wait" ? { background: SILVER.grad }
                : undefined
              }
            >
              {status === "done" ? <Check size={16} strokeWidth={3} /> : status === "live" ? <CircleDot size={16} /> : <Circle size={16} />}
            </div>

            <div className={`font-mono text-[10px] uppercase tracking-[0.16em] ${status === "wait" ? "text-slate-400" : "text-[#B8952E]"}`}>
              {String(n).padStart(2, "0")}
            </div>
            <h4 className={`mt-2 text-[14px] font-bold leading-snug tracking-tight ${status === "wait" ? "text-slate-400" : "text-slate-900"}`}>{s.t}</h4>
            <div className="mt-2 flex items-start gap-1.5 text-[11.8px] text-slate-500">
              <MapPin size={12} className={`mt-0.5 shrink-0 ${status === "wait" ? "text-slate-300" : "text-[#D4AF37]"}`} />
              <span>{s.loc}</span>
            </div>

            {!compact && (
              <>
                <p className={`mt-2.5 text-[12.4px] leading-relaxed ${status === "wait" ? "text-slate-400" : "text-slate-500"}`}>{s.b}</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {s.kv.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border border-slate-100 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px]">
                      <span className="text-slate-400">{k}</span><b className="font-semibold text-slate-900">{v}</b>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-3">
              {status === "done" ? <Pill tone="ok" icon={CheckCircle2}>{L.st.done}</Pill>
                : status === "live" ? <Pill tone="move" icon={Truck}>{L.st.live}</Pill>
                : <Pill tone="wait" icon={Clock}>{L.st.wait}</Pill>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const KPI_ICONS = { gem: Gem, truck: Truck, flask: FlaskConical, lock: Lock };

function Overview({ spot, locale, goShip }) {
  const P = useT().portal;
  const L = P.ov;
  const first = P.ship.consignments[0];
  return (
    <>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-slate-400">{L.crumb}</div>
      <header className="mb-6 mt-2.5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="text-[27px] font-bold tracking-tight text-slate-900">{L.h}</h2>
          <p className="mt-2 text-[13.5px] text-slate-500">{L.s}</p>
        </div>
        <Pill tone="gold" icon={Bell}>3</Pill>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {L.kpis.map((k) => {
          const Icon = KPI_ICONS[k.i];
          return (
            <div key={k.l} className="relative overflow-hidden rounded-sm border border-slate-200 bg-white px-5 py-5">
              <span
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: "linear-gradient(180deg,#D4AF37 0%,#E7CB63 42%,#EEF1F5 78%,#A8AEB8 100%)" }}
              />
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em] text-slate-500">
                <Icon size={13} className="text-[#D4AF37]" />{k.l}
              </div>
              <div className="mt-2.5 font-mono text-[27px] font-semibold tabular-nums tracking-tight text-slate-900">{k.v}</div>
              <div className="mt-1.5 text-[11.6px] text-slate-500">{k.d} · <b className="font-bold text-emerald-600">{k.g}</b></div>
            </div>
          );
        })}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col gap-5">
          <SpotCard spot={spot} locale={locale} />
          <Panel
            title={first.id}
            sub={first.meta}
            action={<Button variant="outline" icon={ArrowRight} className="px-4 py-2.5 text-[12px]" onClick={goShip}>{P.ship.h}</Button>}
          >
            <Stepper stage={first.stage} compact />
          </Panel>
        </div>

        <Panel title={L.feedT} sub={L.feedS} bodyClass="px-6 py-1.5">
          {L.feed.map((f, i) => (
            <div key={f.t} className={`flex gap-3.5 py-4 ${i ? "border-t border-slate-100" : ""}`}>
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#B8952E]"><Check size={13} /></div>
              <div className="min-w-0">
                <div className="text-[13.2px] font-semibold leading-snug text-slate-900">{f.t}</div>
                <div className="mt-1 text-[12px] text-slate-500">{f.s}</div>
              </div>
              <div className="ml-auto whitespace-nowrap pt-0.5 font-mono text-[10.5px] text-slate-400">{f.ts}</div>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function Documents() {
  const L = useT().portal.docs;
  const icons = [FolderLock, KeyRound, ShieldCheck];
  const pillFor = (s) =>
    s === "ok" ? <Pill tone="ok" icon={CheckCircle2}>{L.st.ok}</Pill>
    : s === "wait" ? <Pill tone="move" icon={Clock}>{L.st.wait}</Pill>
    : <Pill tone="wait" icon={Eye}>{L.st.move}</Pill>;

  return (
    <>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-slate-400">{L.crumb}</div>
      <header className="mb-6 mt-2.5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="text-[27px] font-bold tracking-tight text-slate-900">{L.h}</h2>
          <p className="mt-2 text-[13.5px] text-slate-500">{L.s}</p>
        </div>
        <Pill tone="move" icon={Clock}>{L.vault[1].v} · {L.st.wait}</Pill>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {L.vault.map((v, i) => {
          const Icon = icons[i];
          return (
            <div key={v.l} className="flex items-center gap-3.5 border border-slate-200 bg-white p-5">
              <div
                className="grid h-[42px] w-[42px] shrink-0 place-items-center text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.65),0_0_0_1px_rgba(126,133,144,.35)]"
                style={{ background: SILVER.grad }}
              ><Icon size={17} /></div>
              <div>
                <div className="font-mono text-[21px] font-semibold text-slate-900">{v.v}</div>
                <div className="mt-0.5 text-[11.8px] text-slate-500">{v.l}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-sm border border-slate-200 bg-white">
        <table className="w-full border-collapse text-[13.4px]">
          <thead>
            <tr>{L.th.map((h, i) => (
              <th key={i} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-left font-mono text-[9.8px] font-semibold uppercase tracking-[0.13em] text-slate-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {L.rows.map((r) => (
              <tr key={r.n} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3.5">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center border border-slate-200 bg-slate-100 text-[#B8952E]"><FileText size={15} /></div>
                    <div>
                      <div className="font-bold text-slate-900">{r.n}</div>
                      <div className="mt-0.5 font-mono text-[10.5px] text-slate-400">{r.m}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">{r.c}</td>
                <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">{r.d}</td>
                <td className="px-4 py-3.5">{pillFor(r.s)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button title={L.view} className="grid h-[30px] w-[30px] place-items-center rounded-sm border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-[#D4AF37] hover:text-[#B8952E]"><Eye size={14} /></button>
                    <button title={L.dl} className="grid h-[30px] w-[30px] place-items-center rounded-sm border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-[#D4AF37] hover:text-[#B8952E]"><Download size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Prices({ spot, locale }) {
  const L = useT().portal.px;
  const nf = (n, d) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const kg = spot.px * OZ_PER_KG;
  const chg = spot.px - spot.open, up = chg >= 0;

  return (
    <>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-slate-400">{L.crumb}</div>
      <header className="mb-6 mt-2.5">
        <h2 className="text-[27px] font-bold tracking-tight text-slate-900">{L.h}</h2>
        <p className="mt-2 max-w-[70ch] text-[13.5px] text-slate-500">{L.s}</p>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-5">
          <SpotCard spot={spot} locale={locale} />
          <Panel bodyClass="grid gap-5 p-6 sm:grid-cols-3">
            {[
              { l: L.open, v: `$${nf(spot.open, 2)}`, c: "text-slate-900" },
              { l: L.sess, v: `$${nf(spot.lo, 2)} – $${nf(spot.hi, 2)}`, c: "text-slate-900" },
              { l: L.vol, v: `${up ? "+" : "−"}${nf(Math.abs(chg), 2)}`, c: up ? "text-emerald-600" : "text-rose-600" },
            ].map((x) => (
              <div key={x.l}>
                <div className="font-mono text-[10px] uppercase tracking-[0.13em] text-slate-500">{x.l}</div>
                <div className={`mt-2 font-mono text-[19px] font-semibold tabular-nums ${x.c}`}>{x.v}</div>
              </div>
            ))}
          </Panel>
        </div>

        <Panel title={L.tblT} sub={L.tblS} bodyClass="overflow-x-auto p-0">
          <table className="w-full border-collapse text-[13.4px]">
            <thead>
              <tr>{L.th.map((h, i) => (
                <th key={h} className={`whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[9.8px] font-semibold uppercase tracking-[0.13em] text-slate-500 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {L.rows.map((r) => (
                <tr key={r.g} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{r.g}</td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">{r.p}</td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-rose-700">{nf(r.d, 2)}%</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900">
                    ${nf(kg * (1 + r.d / 100), 0)} <span className="font-normal text-slate-400">/kg</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}

function Shipments() {
  const L = useT().portal.ship;
  const [idx, setIdx] = useState(0);
  const c = L.consignments[idx];

  return (
    <>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-slate-400">{L.crumb}</div>
      <header className="mb-6 mt-2.5">
        <h2 className="text-[27px] font-bold tracking-tight text-slate-900">{L.h}</h2>
        <p className="mt-2 max-w-[70ch] text-[13.5px] text-slate-500">{L.s}</p>
      </header>

      <Eyebrow>{L.pick}</Eyebrow>
      <div className="mb-6 mt-3 flex flex-wrap gap-2.5">
        {L.consignments.map((x, i) => (
          <button key={x.id} onClick={() => setIdx(i)} aria-pressed={idx === i}
            className={`min-w-[210px] rounded-sm border bg-white px-4 py-3.5 text-left transition ${
              idx === i ? "border-[#D4AF37] ring-[3px] ring-[#D4AF37]/10" : "border-slate-200 hover:border-[#D4AF37]/40"}`}>
            <div className="font-mono text-[12.5px] font-semibold tracking-wide text-slate-900">{x.id}</div>
            <div className="mt-1 text-[11.5px] text-slate-500">{x.meta}</div>
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        {c.cards.map((v, i) => (
          <div key={i} className="bg-white px-[18px] py-4">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.13em] text-slate-500">{L.cards[i].l}</div>
            <div className="mt-1.5 font-mono text-[16px] font-semibold tabular-nums text-slate-900">{v}</div>
          </div>
        ))}
      </div>

      <Panel bodyClass="p-7"><Stepper stage={c.stage} /></Panel>

      <div className="mt-6 flex gap-3 rounded-sm border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-4 text-[12.7px] leading-relaxed text-slate-600">
        <Info size={16} className="mt-0.5 shrink-0 text-[#B8952E]" /><span>{L.note}</span>
      </div>
    </>
  );
}

function Portal({ locale }) {
  const P = useT().portal;
  const [tab, setTab] = useState("overview");
  const spot = useSpot();

  const nav = [
    { k: "overview", icon: LayoutDashboard, label: P.nav.overview },
    { k: "docs", icon: FolderLock, label: P.nav.docs, count: "24" },
    { k: "prices", icon: LineChart, label: P.nav.prices },
    { k: "ship", icon: Truck, label: P.nav.ship, count: "2" },
  ];

  return (
    <div className="grid min-h-[calc(100vh-114px)] bg-slate-100 lg:grid-cols-[264px_1fr]">
      <aside className="flex flex-wrap items-center gap-4 border-r border-[#D4AF37]/15 bg-slate-900 px-5 py-4 lg:flex-col lg:items-stretch lg:gap-6 lg:px-[18px] lg:py-6">
        {/* the signed-in counterparty is silver; Gold Corridor's own mark stays
            gold, so the two identities never read as the same entity */}
        <div className="flex items-center gap-3.5 border border-[#C9CDD4]/15 bg-white/[0.045] p-4">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center text-[14px] font-bold tracking-wide text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,.5)]"
            style={{ background: SILVER.grad }}
          >HR</div>
          <div className="min-w-0">
            <div className="text-[13.4px] font-bold leading-tight text-white">{P.client}</div>
            <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#D4AF37]">{P.role}</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-wrap gap-1 lg:flex-none lg:flex-col">
          <div className="hidden px-3 pb-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500 lg:block">{P.navMain}</div>
          {nav.map(({ k, icon: Icon, label, count }) => (
            <button key={k} onClick={() => { setTab(k); window.scrollTo(0, 0); }} aria-current={tab === k}
              className={`relative flex w-auto items-center gap-3 rounded-sm px-3 py-2.5 text-left text-[13.4px] transition lg:w-full ${
                tab === k ? "bg-[#D4AF37]/10 font-bold text-[#D4AF37]" : "font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
              {tab === k && <span className="absolute inset-y-2 left-0 w-0.5 bg-[#D4AF37]" />}
              <Icon size={16} className="shrink-0" />
              <span>{label}</span>
              {count && <span className={`ml-auto rounded-full px-1.5 font-mono text-[10.5px] ${tab === k ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-white/10 text-slate-300"}`}>{count}</span>}
            </button>
          ))}
        </nav>

        <div className="flex w-full flex-col gap-3 lg:mt-auto">
          <div className="flex items-start gap-2.5 border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-[11.5px] leading-snug text-emerald-300">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-400" /><span>{P.secure}</span>
          </div>
          <button className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13.4px] text-slate-400 transition hover:bg-white/5 hover:text-slate-200">
            <LogOut size={16} />{P.signout}
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-5 pb-14 pt-7 lg:px-8">
        {tab === "overview" && <Overview spot={spot} locale={locale} goShip={() => setTab("ship")} />}
        {tab === "docs" && <Documents />}
        {tab === "prices" && <Prices spot={spot} locale={locale} />}
        {tab === "ship" && <Shipments />}
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   8 · ROOT
   ══════════════════════════════════════════════════════════════ */
export default function GoldCorridorPlatform() {
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("a");
  const [page, setPage] = useState("home");
  const [reference, setReference] = useState(null);

  const L = useMemo(() => T[lang], [lang]);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // every navigation lands at the top of the new page
  const goTo = useCallback((next) => { setPage(next); window.scrollTo(0, 0); }, []);
  const goView = useCallback((next) => { setView(next); window.scrollTo(0, 0); }, []);

  /* Each nav item is its own page. `key` on the wrapper restarts the
     enter animation on every route change. */
  const CurrentPage = () => {
    switch (page) {
      case "comply": return <Compliance />;
      case "services": return <Services />;
      case "founder": return <Founders />;
      case "contact": return <Contact />;
      case "intake": return <IntakeForm onSuccess={setReference} />;
      default:
        return (
          <>
            <Hero onIntake={() => goTo("intake")} onTerms={() => goTo("comply")} />
            <HomeIndex setPage={goTo} />
          </>
        );
    }
  };

  return (
    <I18n.Provider value={L}>
      <div className="min-h-screen bg-slate-50 font-sans text-[15px] leading-relaxed text-slate-700 antialiased">
        <UtilityRail lang={lang} setLang={setLang} />
        <Masthead view={view} setView={goView} page={page} setPage={goTo} />

        {view === "a" ? (
          <>
            <main key={page} className="min-h-[calc(100vh-340px)] animate-[pagein_.32s_ease] motion-reduce:animate-none">
              <CurrentPage />
            </main>
            <SiteFooter />
            {reference && <SuccessOverlay reference={reference} onClose={() => setReference(null)} />}
          </>
        ) : (
          <Portal locale={L.locale} />
        )}
      </div>
    </I18n.Provider>
  );
}
