import { MemberStatus, Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { roleRequired } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();

  const members = await prisma.member.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return res.json(members);
});

router.post("/", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res, next) => {
  try {
    const schema = z.object({
      fullName: z.string().min(3),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      gender: z.string().optional(),
      birthDate: z.string().datetime().optional(),
      maritalStatus: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      status: z.nativeEnum(MemberStatus).optional(),
      baptized: z.boolean().optional(),
      convertedAt: z.string().datetime().optional(),
    });

    const data = schema.parse(req.body);

    const member = await prisma.member.create({
      data: {
        ...data,
        email: data.email || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        convertedAt: data.convertedAt ? new Date(data.convertedAt) : null,
      },
    });

    return res.status(201).json(member);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", roleRequired(Role.ADMIN, Role.PASTOR, Role.SECRETARIA), async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);

    const schema = z.object({
      fullName: z.string().min(3),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      gender: z.string().optional(),
      birthDate: z.string().datetime().optional().nullable(),
      maritalStatus: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      status: z.nativeEnum(MemberStatus).optional(),
      baptized: z.boolean().optional(),
      convertedAt: z.string().datetime().optional().nullable(),
    });

    const data = schema.parse(req.body);

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        ...data,
        email: data.email || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        convertedAt: data.convertedAt ? new Date(data.convertedAt) : null,
      },
    });

    return res.json(member);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", roleRequired(Role.ADMIN, Role.PASTOR), async (req, res) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  await prisma.member.delete({ where: { id: params.id } });
  return res.status(204).send();
});

export default router;
