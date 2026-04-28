import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/", async (_req, res) => {
  const groups = [...store.groups].sort((a, b) => a.name.localeCompare(b.name));

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

    const now = new Date().toISOString();
    const group = {
      id: createId("grp"),
      name: data.name,
      category: data.category,
      leaderName: data.leaderName || null,
      meetingDay: data.meetingDay || null,
      meetingTime: data.meetingTime || null,
      active: data.active ?? true,
      createdAt: now,
      updatedAt: now,
    };

    store.groups.push(group);
    return res.status(201).json(group);
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/members", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER), async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const data = z.object({ memberId: z.string() }).parse(req.body);

    const relation = {
      id: createId("glk"),
      groupId: params.id,
      memberId: data.memberId,
      joinedAt: new Date().toISOString(),
    };

    store.groupMembers.push(relation);

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

    const attendance = {
      id: createId("att"),
      groupId: params.id,
      meetingDate: data.meetingDate,
      present: data.present,
      visitors: data.visitors || 0,
      notes: data.notes || null,
    };

    store.attendances.push(attendance);

    return res.status(201).json(attendance);
  } catch (error) {
    return next(error);
  }
});

export default router;
