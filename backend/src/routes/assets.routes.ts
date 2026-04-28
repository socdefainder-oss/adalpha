import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/", async (_req, res) => {
  const assets = [...store.assets].sort((a, b) => a.itemName.localeCompare(b.itemName));
  return res.json(assets);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res, next) => {
  try {
    const data = z.object({
      itemName: z.string().min(2),
      category: z.string().min(2),
      location: z.string().min(2),
      acquisitionDate: z.string().min(8),
      acquisitionValue: z.number().min(0),
      condition: z.string().min(2),
      responsible: z.string().optional(),
      serialNumber: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const now = new Date().toISOString();
    const asset = {
      id: createId("ast"),
      itemName: data.itemName,
      category: data.category,
      location: data.location,
      acquisitionDate: data.acquisitionDate,
      acquisitionValue: data.acquisitionValue,
      condition: data.condition,
      responsible: data.responsible || null,
      serialNumber: data.serialNumber || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    store.assets.push(asset);
    return res.status(201).json(asset);
  } catch (error) {
    return next(error);
  }
});

export default router;
