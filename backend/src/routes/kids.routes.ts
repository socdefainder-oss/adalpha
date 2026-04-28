import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/", async (_req, res) => {
  const kids = [...store.kids].sort((a, b) => a.fullName.localeCompare(b.fullName));
  return res.json(kids);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res, next) => {
  try {
    const data = z.object({
      fullName: z.string().min(3),
      birthDate: z.string().min(8),
      guardianName: z.string().min(3),
      guardianPhone: z.string().min(8),
      classroom: z.string().min(2),
      allergies: z.string().optional(),
      checkInAuthorized: z.boolean().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const now = new Date().toISOString();
    const kid = {
      id: createId("kid"),
      fullName: data.fullName,
      birthDate: data.birthDate,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      classroom: data.classroom,
      allergies: data.allergies || null,
      checkInAuthorized: data.checkInAuthorized ?? true,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    store.kids.push(kid);
    return res.status(201).json(kid);
  } catch (error) {
    return next(error);
  }
});

export default router;
