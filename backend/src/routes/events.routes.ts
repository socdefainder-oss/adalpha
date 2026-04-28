import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/", async (_req, res) => {
  const events = [...store.events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  return res.json(events);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(2),
        description: z.string().optional(),
        eventDate: z.string().datetime(),
        location: z.string().optional(),
        category: z.string().min(2),
      })
      .parse(req.body);

    const now = new Date().toISOString();
    const event = {
      id: createId("evt"),
      title: data.title,
      description: data.description || null,
      eventDate: data.eventDate,
      location: data.location || null,
      category: data.category,
      createdAt: now,
      updatedAt: now,
    };

    store.events.push(event);

    return res.status(201).json(event);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  const eventIndex = store.events.findIndex((entry) => entry.id === params.id);

  if (eventIndex < 0) {
    return res.status(404).json({ message: "Evento nao encontrado" });
  }

  store.events.splice(eventIndex, 1);
  return res.status(204).send();
});

export default router;
