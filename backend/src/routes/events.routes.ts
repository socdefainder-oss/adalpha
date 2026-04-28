import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { roleRequired } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { eventDate: "asc" } });
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

    const event = await prisma.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  await prisma.event.delete({ where: { id: params.id } });
  return res.status(204).send();
});

export default router;
