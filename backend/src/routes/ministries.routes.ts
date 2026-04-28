import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/", async (_req, res) => {
  const ministries = [...store.ministries].sort((a, b) => a.name.localeCompare(b.name));

  return res.json(ministries);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR), async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string().min(2),
        description: z.string().optional(),
        leaderId: z.string().optional(),
      })
      .parse(req.body);

    const now = new Date().toISOString();
    const ministry = {
      id: createId("min"),
      name: data.name,
      description: data.description || null,
      leaderId: data.leaderId || null,
      createdAt: now,
      updatedAt: now,
    };

    store.ministries.push(ministry);
    return res.status(201).json(ministry);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/members", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const data = z.object({ memberId: z.string(), role: z.string().optional() }).parse(req.body);

    const link = {
      id: createId("mlk"),
      ministryId: params.id,
      memberId: data.memberId,
      role: data.role || null,
      joinedAt: new Date().toISOString(),
    };

    store.ministryMembers.push(link);

    return res.status(201).json(link);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id/members/:memberId", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res) => {
  const params = z.object({ id: z.string(), memberId: z.string() }).parse(req.params);

  const linkIndex = store.ministryMembers.findIndex(
    (item) => item.ministryId === params.id && item.memberId === params.memberId,
  );

  if (linkIndex < 0) {
    return res.status(404).json({ message: "Vinculo nao encontrado" });
  }

  store.ministryMembers.splice(linkIndex, 1);

  return res.status(204).send();
});

export default router;
