import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middlewares/auth";
import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword, signToken } from "../utils/auth";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.nativeEnum(Role).optional(),
    });

    const data = schema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ message: "Email ja cadastrado" });
    }

    const usersCount = await prisma.user.count();
    const role = usersCount === 0 ? Role.ADMIN : data.role || Role.SECRETARIA;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: await hashPassword(data.password),
        role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const data = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciais invalidas" });
    }

    const validPassword = await comparePassword(data.password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais invalidas" });
    }

    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, name: true, email: true, role: true },
  });

  return res.json(user);
});

export default router;
