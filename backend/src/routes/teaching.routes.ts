import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role } from "../types/domain";

const router = Router();

router.get("/courses", async (_req, res) => {
  const courses = [...store.courses].sort((a, b) => a.title.localeCompare(b.title));
  return res.json(courses);
});

router.post("/courses", roleRequired(Role.ADMIN, Role.PASTOR, Role.LIDER, Role.SECRETARIA), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(3),
      category: z.string().min(2),
      teacherName: z.string().min(3),
      room: z.string().optional(),
      workloadHours: z.number().int().min(1),
      startDate: z.string().min(8),
      endDate: z.string().optional(),
      active: z.boolean().optional(),
      material: z.string().optional(),
      enrolledCount: z.number().int().min(0).optional(),
    }).parse(req.body);

    const now = new Date().toISOString();
    const course = {
      id: createId("crs"),
      title: data.title,
      category: data.category,
      teacherName: data.teacherName,
      room: data.room || null,
      workloadHours: data.workloadHours,
      startDate: data.startDate,
      endDate: data.endDate || null,
      active: data.active ?? true,
      material: data.material || null,
      enrolledCount: data.enrolledCount ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    store.courses.push(course);
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
});

export default router;
