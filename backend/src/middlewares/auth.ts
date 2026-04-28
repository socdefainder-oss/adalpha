import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, jwtSecret) as Express.UserPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido" });
  }
}

export function roleRequired(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Nao autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Sem permissao para esta acao" });
    }

    return next();
  };
}
