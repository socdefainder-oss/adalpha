import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { MemberStatus, Role } from "../types/domain";

const router = Router();

router.get("/", async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();

  const members = [...store.members]
    .filter((member) => {
      if (!q) return true;
      const text = q.toLowerCase();
      return member.fullName.toLowerCase().includes(text) || (member.email || "").toLowerCase().includes(text);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);

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

    const timestamp = new Date().toISOString();
    const member = {
      id: createId("mem"),
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      gender: data.gender || null,
      birthDate: data.birthDate || null,
      maritalStatus: data.maritalStatus || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      status: data.status || MemberStatus.ATIVO,
      baptized: data.baptized || false,
      convertedAt: data.convertedAt || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.members.push(member);

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

    const memberIndex = store.members.findIndex((entry) => entry.id === params.id);

    if (memberIndex < 0) {
      return res.status(404).json({ message: "Membro nao encontrado" });
    }

    const current = store.members[memberIndex];
    const updated = {
      ...current,
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      gender: data.gender || null,
      birthDate: data.birthDate || null,
      maritalStatus: data.maritalStatus || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      status: data.status || current.status,
      baptized: data.baptized ?? current.baptized,
      convertedAt: data.convertedAt || null,
      updatedAt: new Date().toISOString(),
    };

    store.members[memberIndex] = updated;

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", roleRequired(Role.ADMIN, Role.PASTOR), async (req, res) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  const memberIndex = store.members.findIndex((entry) => entry.id === params.id);

  if (memberIndex < 0) {
    return res.status(404).json({ message: "Membro nao encontrado" });
  }

  store.members.splice(memberIndex, 1);
  return res.status(204).send();
});

export default router;
