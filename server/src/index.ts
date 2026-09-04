import express from "express";
import { createServer } from "node:http";
import { config } from "./config.js";
import { carrierWebhookRouter } from "./webhooks/carriers.js";
import { logisticsUpdateRouter } from "./webhooks/logisticsUpdate.js";
import { consignmentsRouter } from "./api/routes/consignments.js";
import { assaysRouter } from "./api/routes/assays.js";
import { escrowRouter } from "./api/routes/escrow.js";
import { producersRouter } from "./api/routes/producers.js";
import { attachRealtimeGateway, sseHandler } from "./realtime/gateway.js";

const app = express();

// Webhook route needs the raw bytes for HMAC verification — mounted before
// the general JSON body parser, and only for this path.
app.use("/webhooks/carriers", express.raw({ type: "application/json", limit: "1mb" }));
app.use(carrierWebhookRouter);

app.use(express.json());
app.use(logisticsUpdateRouter);
app.use(consignmentsRouter);
app.use(assaysRouter);
app.use(escrowRouter);
app.use(producersRouter);
app.get("/realtime/consignments/:id/sse", sseHandler);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
attachRealtimeGateway(httpServer);

httpServer.listen(config.port, () => {
  console.log(`custody engine listening on :${config.port}`);
});
