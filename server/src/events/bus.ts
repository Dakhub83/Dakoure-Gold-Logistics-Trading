import { EventEmitter } from "node:events";

/**
 * Minimal pub/sub contract. The spec's target transport is Redis Streams +
 * Pub/Sub for multi-instance fan-out; this in-memory implementation
 * satisfies the same interface for local dev and single-instance
 * deployments. Swap in a Redis-backed EventBus behind this interface
 * when running more than one API process — no caller changes.
 */
export interface EventBus {
  publish(channel: string, payload: unknown): void;
  subscribe(channel: string, handler: (payload: unknown) => void): () => void;
}

export class InMemoryEventBus implements EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  publish(channel: string, payload: unknown): void {
    this.emitter.emit(channel, payload);
  }

  subscribe(channel: string, handler: (payload: unknown) => void): () => void {
    this.emitter.on(channel, handler);
    return () => this.emitter.off(channel, handler);
  }
}

export const eventBus: EventBus = new InMemoryEventBus();

export const CONSIGNMENT_UPDATED = "consignment.updated";

export interface ConsignmentUpdatedPayload {
  type: "stage_advanced";
  consignmentId: string;
  stage: number;
  status: "live" | "done";
}
