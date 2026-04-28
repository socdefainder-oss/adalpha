import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "../types/domain";

const jwtSecret = process.env.JWT_SECRET || "";

export async function hashPassword(value: string) {
  return bcrypt.hash(value, 10);
}

export async function comparePassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export function signToken(payload: { sub: string; role: Role; email: string }) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
}
