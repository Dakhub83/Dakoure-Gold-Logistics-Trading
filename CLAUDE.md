# CLAUDE.md

Guidance for Claude Code working in this repository.

**Read [README.md](README.md) first.** It is the product and design brief — colour
semantics, copy rules, the reasoning behind each page, and a list of commercial
claims that must be verified before publishing. This file covers only the
operational things the README does not.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

Two things bite on a fresh clone:

1. **npm blocks esbuild's install script.** Vite cannot start until it runs.
   `package.json` carries an `allowScripts` entry for this, but if npm still
   warns, run `npm approve-scripts esbuild && npm rebuild esbuild`.

2. **`npm run dev` fails if the folder path contains `&`.** npm shells scripts
   through `cmd.exe`, which reads `&` as a command separator, so the path is
   truncated and you get `Cannot find module '…\vite\bin\vite.js'`. Either
   rename the folder or bypass npm: `node node_modules/vite/bin/vite.js`.

## Architecture

The entire platform is one file — `src/GoldCorridorPlatform.jsx`, ~2250 lines.
`main.jsx` → `App.jsx` → that component. Everything below is internal to it.

Two phases share the component, switched by `view` in the masthead:

- **Phase I** — public site (`home`, `comply`, `services`, `founder`, `contact`,
  `intake`), selected by `page` state
- **Phase II** — authenticated portal (`Overview`, `Documents`, `Prices`,
  `Shipments`)

### Routing is client-side state, not URLs

`page` is a `useState`, not a route. There are no addresses — `/services` does
not exist, back does not step between pages, nothing can be linked or
bookmarked, and search engines cannot index any page but the root. The README
explains why this matters commercially and how to swap in `react-router-dom`.

**Practical consequence when testing:** a page can only be reached by clicking.
Navigating to a URL will not get you there.

### Copy lives in the `T` dictionary

Every user-facing string resolves through `T.en` / `T.fr`, which are
structurally identical. Adding a key to one means adding it to the other —
there is no fallback, so a missing key surfaces immediately. Never hardcode a
display string into a component.

The EN/FR toggle is fully wired and switches the whole tree, including the
utility rail and nav.

## Gotchas

- **`BrandMark` needs a unique `id` per instance** (`"mast"`, `"foot"`). Its
  gradients are referenced by id; duplicates in one document silently
  cross-wire the fills.
- **Don't add colours to `tailwind.config.js`.** Gold `#D4AF37` and silver
  `#C9CDD4` are deliberately arbitrary values inside the component to keep it
  portable. The two metals carry meaning — see the README before using either.
- **Rose is reserved.** It appears only in the "What we decline" table. Using it
  elsewhere costs it its meaning.
- **The service numbering 01–06 encodes the real order of work.** The seventh
  block is unnumbered and full-width on purpose, because it spans all six.
- **Contact details are deliberately fake** and safe to commit — reserved
  `555-01xx` numbers and non-existent streets. Founder names are real and
  intentionally so. Do not swap in live details without reading the security
  note in the README.

## Data is simulated

`useSpot()` is a bounded random walk, not a feed. Consignments, documents and
activity are static fixtures in `T.*.portal`. Swapping in real sources changes
no component signatures. The footer labels the site a prototype — keep that
label until the data is real.

## Verification

There is no test suite and no linter configured. To confirm a change works,
run the app and drive it. Because navigation is state-based, that means
clicking through — for headless checks, Chrome needs `--headless=new` (plain
`--headless` silently writes no screenshot) driven over the DevTools Protocol.
