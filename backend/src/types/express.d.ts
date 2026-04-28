import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      sub: string;
      role: Role;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
