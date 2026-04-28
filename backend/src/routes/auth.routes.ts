import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { authRequired } from "../middlewares/auth";
import { Role } from "../types/domain";
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

    const existing = store.users.find((user) => user.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email ja cadastrado" });
    }

    const usersCount = store.users.length;
    const role = usersCount === 0 ? Role.ADMIN : data.role || Role.SECRETARIA;

    const user = {
      id: createId("usr"),
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      role,
      createdAt: new Date().toISOString(),
    };

    store.users.push(user);

    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
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

    const user = store.users.find((entry) => entry.email.toLowerCase() === data.email.toLowerCase());

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
  const user = store.users.find((entry) => entry.id === req.user!.sub);

  if (!user) {
    return res.status(404).json({ message: "Usuario nao encontrado" });
  }

  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export default router;
