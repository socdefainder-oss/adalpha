import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/", async (_req, res) => {
  const items = [...store.mediaItems].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return res.json(items);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER, Role.SECRETARIA), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(2),
      category: z.string().min(2),
      platform: z.string().min(2),
      publishDate: z.string().min(8),
      responsible: z.string().min(2),
      status: z.string().min(2),
      url: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const now = new Date().toISOString();
    const item = {
      id: createId("mid"),
      title: data.title,
      category: data.category,
      platform: data.platform,
      publishDate: data.publishDate,
      responsible: data.responsible,
      status: data.status,
      url: data.url || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    store.mediaItems.push(item);
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

export default router;
