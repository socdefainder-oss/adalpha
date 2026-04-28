import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/overview", async (_req, res) => {
  const [
    totalMembers,
    menCount,
    womenCount,
    recentMembers,
    groups,
    ministries,
    events,
    transactions,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { gender: { equals: "M", mode: "insensitive" } } }),
    prisma.member.count({ where: { gender: { equals: "F", mode: "insensitive" } } }),
    prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, fullName: true, createdAt: true, status: true },
    }),
    prisma.group.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        active: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.ministry.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({ orderBy: { eventDate: "asc" }, take: 8 }),
    prisma.transaction.findMany(),
  ]);

  const income = transactions
    .filter((t) => t.type === "ENTRADA")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "SAIDA")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const groupStats = {
    total: groups.length,
    active: groups.filter((g) => g.active).length,
    inactive: groups.filter((g) => !g.active).length,
  };

  return res.json({
    people: {
      total: totalMembers,
      men: menCount,
      women: womenCount,
    },
    recentMembers,
    groups: {
      stats: groupStats,
      categories: groups.map((group) => ({
        id: group.id,
        name: group.name,
        category: group.category,
        members: group._count.members,
      })),
    },
    ministries: ministries.map((m) => ({
      id: m.id,
      name: m.name,
      members: m._count.members,
    })),
    finance: {
      income,
      expense,
      balance: income - expense,
    },
    events,
  });
});

export default router;
