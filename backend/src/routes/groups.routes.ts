import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { roleRequired } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const groups = await prisma.group.findMany({
    include: {
      members: {
        include: { member: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return res.json(groups);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string().min(2),
        category: z.string().min(2),
        leaderName: z.string().optional(),
        meetingDay: z.string().optional(),
        meetingTime: z.string().optional(),
        active: z.boolean().optional(),
      })
      .parse(req.body);

    const group = await prisma.group.create({ data });
    return res.status(201).json(group);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/members", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const data = z.object({ memberId: z.string() }).parse(req.body);

    const relation = await prisma.groupMember.create({
      data: {
        groupId: params.id,
        memberId: data.memberId,
      },
    });

    return res.status(201).json(relation);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/attendance", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const data = z
      .object({
        meetingDate: z.string().datetime(),
        present: z.number().int().min(0),
        visitors: z.number().int().min(0).optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const attendance = await prisma.attendance.create({
      data: {
        groupId: params.id,
        meetingDate: new Date(data.meetingDate),
        present: data.present,
        visitors: data.visitors || 0,
        notes: data.notes,
      },
    });

    return res.status(201).json(attendance);
  } catch (error) {
    return next(error);
  }
});

export default router;
