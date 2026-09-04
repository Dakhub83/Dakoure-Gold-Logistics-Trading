# Custody & Matching Engine

Backend for the Chain-of-Custody & Trade Matching Engine spec (Node + TypeScript + Express + Prisma). Implements:

- **Schema** (`prisma/schema.prisma`) — full model set from spec §1: `lots`, `seals`, `assays`, `custody_events`, `consignments`, `trade_contracts`, `escrow_accounts`/`escrow_transactions`, `signatures`, plus supporting tables.
- **Webhook ingestion** (`src/webhooks/`) — HMAC-verified, idempotent carrier event intake, mapped to custody-step effects (`src/webhooks/mapping.ts`), matching spec §2.2's table exactly.
- **Realtime push** (`src/realtime/gateway.ts`) — WebSocket rooms per consignment, with an SSE fallback, per spec §2.3.
- **Escrow state machine** (`src/escrow/stateMachine.ts`) — pure, dependency-free implementation of the `Draft → … → Settled` diagram from spec §3, including the 2-of-3 signer quorum gate.

## Local setup

```bash
cp .env.example .env      # fill in a real DATABASE_URL and webhook secrets
npm install
npm run prisma:generate
npm run prisma:migrate    # requires a running Postgres instance
npm run prisma:seed       # seeds producer/comptoir/carrier + consignment AGL-2609-02
npm run dev
```

## Tests

The domain logic (state machine, carrier-event mapping, current-stage math, webhook signature verification) is pure and has no database dependency, so it runs without any infrastructure:

```bash
npm test
```

## What's stubbed, on purpose

- **Realtime auth** — `attachRealtimeGateway` accepts any `?ticket=` without verifying it against a live Portal session; wire that up before this leaves the scaffold.
- **Signature algorithm** — `escrow/service.ts` writes a placeholder `signatureHash`; swap in real detached-signature verification (Ed25519 per the schema default) once signer key distribution exists.
- **Event transport** — `src/events/bus.ts` is in-memory (fine for one process / local dev). It's a two-method interface (`publish`/`subscribe`); swap in a Redis-backed implementation behind the same interface to fan out across multiple API instances, as spec §0 assumes in production.
