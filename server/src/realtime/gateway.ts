import type { Server as HttpServer } from "node:http";
import type { Request, Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import {
  eventBus,
  CONSIGNMENT_UPDATED,
  type ConsignmentUpdatedPayload,
} from "../events/bus.js";

/**
 * Realtime push, spec §2.3. The Portal opens one WebSocket and joins a room
 * per viewed consignment; clients that can't hold a socket open (corporate
 * firewalls) fall back to the SSE endpoint below. Same message shape,
 * one direction, never a full re-fetch.
 */

type Room = Set<WebSocket>;
const rooms = new Map<string, Room>();

function roomFor(consignmentId: string): Room {
  let room = rooms.get(consignmentId);
  if (!room) {
    room = new Set();
    rooms.set(consignmentId, room);
  }
  return room;
}

function broadcast(payload: ConsignmentUpdatedPayload): void {
  const room = rooms.get(payload.consignmentId);
  if (!room || room.size === 0) return;
  const message = JSON.stringify(payload);
  for (const socket of room) {
    if (socket.readyState === WebSocket.OPEN) socket.send(message);
  }
}

export function attachRealtimeGateway(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/realtime" });

  wss.on("connection", (socket, req) => {
    // /realtime/consignments/:id?ticket=<short-lived JWT>
    const url = new URL(req.url ?? "", "http://localhost");
    const match = url.pathname.match(/^\/consignments\/([^/]+)$/);
    if (!match) {
      socket.close(1008, "expected /realtime/consignments/:id");
      return;
    }
    const consignmentId = match[1];
    // TODO: verify url.searchParams.get("ticket") against the Portal session
    // before joining — omitted here to keep the scaffold runnable without
    // a live auth service.

    const room = roomFor(consignmentId);
    room.add(socket);

    socket.on("close", () => {
      room.delete(socket);
      if (room.size === 0) rooms.delete(consignmentId);
    });
  });

  eventBus.subscribe(CONSIGNMENT_UPDATED, (payload) =>
    broadcast(payload as ConsignmentUpdatedPayload)
  );

  return wss;
}

/** SSE fallback: GET /realtime/consignments/:id/sse */
export function sseHandler(req: Request, res: Response): void {
  const consignmentId = req.params.id;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  const unsubscribe = eventBus.subscribe(CONSIGNMENT_UPDATED, (raw) => {
    const payload = raw as ConsignmentUpdatedPayload;
    if (payload.consignmentId !== consignmentId) return;
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  req.on("close", unsubscribe);
}
