import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { roleRequired } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const ministries = await prisma.ministry.findMany({
    include: {
      members: {
        include: { member: true },
      },
    },
    orderBy: { name: "asc" },
  });

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

    const ministry = await prisma.ministry.create({ data });
    return res.status(201).json(ministry);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/members", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const data = z.object({ memberId: z.string(), role: z.string().optional() }).parse(req.body);

    const link = await prisma.ministryMember.create({
      data: {
        ministryId: params.id,
        memberId: data.memberId,
        role: data.role,
      },
    });

    return res.status(201).json(link);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id/members/:memberId", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res) => {
  const params = z.object({ id: z.string(), memberId: z.string() }).parse(req.params);

  await prisma.ministryMember.delete({
    where: {
      ministryId_memberId: {
        ministryId: params.id,
        memberId: params.memberId,
      },
    },
  });

  return res.status(204).send();
});

export default router;
