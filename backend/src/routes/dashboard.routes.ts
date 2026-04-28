import { Router } from "express";
import { store } from "../lib/store";

const router = Router();

router.get("/overview", async (_req, res) => {
  const totalMembers = store.members.length;
  const menCount = store.members.filter((member) => (member.gender || "").toUpperCase() === "M").length;
  const womenCount = store.members.filter((member) => (member.gender || "").toUpperCase() === "F").length;

  const recentMembers = [...store.members]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((member) => ({
      id: member.id,
      fullName: member.fullName,
      createdAt: member.createdAt,
      status: member.status,
    }));

  const groups = [...store.groups].sort((a, b) => a.name.localeCompare(b.name));
  const ministries = [...store.ministries].sort((a, b) => a.name.localeCompare(b.name));
  const events = [...store.events].sort((a, b) => a.eventDate.localeCompare(b.eventDate)).slice(0, 8);
  const transactions = store.transactions;

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
    modules: {
      kids: store.kids.length,
      courses: store.courses.length,
      assets: store.assets.length,
      media: store.mediaItems.length,
      helpTickets: store.helpTickets.filter((ticket) => ticket.status === "Aberto").length,
    },
    recentMembers,
    groups: {
      stats: groupStats,
      categories: groups.map((group) => ({
        id: group.id,
        name: group.name,
        category: group.category,
        members: store.groupMembers.filter((item) => item.groupId === group.id).length,
      })),
    },
    ministries: ministries.map((m) => ({
      id: m.id,
      name: m.name,
      members: store.ministryMembers.filter((item) => item.ministryId === m.id).length,
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
