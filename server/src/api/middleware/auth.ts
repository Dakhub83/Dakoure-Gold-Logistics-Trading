import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export interface AuthedRequest extends Request {
  user?: { id: string; role: string; orgId?: string };
}

/**
 * Stub Portal session check — verifies a bearer JWT and attaches the
 * decoded claims. Replace the signing/issuing side with the real Portal
 * login flow before this leaves the scaffold stage.
 */
export function requireSession(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "missing_session" });

  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      role: string;
      orgId?: string;
    };
    req.user = { id: payload.sub, role: payload.role, orgId: payload.orgId };
    next();
  } catch {
    return res.status(401).json({ error: "invalid_session" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "forbidden" });
    }
    next();
  };
}
