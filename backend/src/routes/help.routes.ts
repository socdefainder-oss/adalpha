import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";

const router = Router();

router.get("/", async (_req, res) => {
  return res.json({
    articles: [...store.helpArticles].sort((a, b) => a.title.localeCompare(b.title)),
    tickets: [...store.helpTickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
});

router.post("/tickets", async (req, res, next) => {
  try {
    const data = z.object({
      subject: z.string().min(3),
      category: z.string().min(2),
      message: z.string().min(10),
      requesterName: z.string().min(2),
      requesterEmail: z.string().email(),
      priority: z.string().min(2),
    }).parse(req.body);

    const ticket = {
      id: createId("tkt"),
      subject: data.subject,
      category: data.category,
      message: data.message,
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      priority: data.priority,
      status: "Aberto",
      createdAt: new Date().toISOString(),
    };

    store.helpTickets.push(ticket);
    return res.status(201).json(ticket);
  } catch (error) {
    return next(error);
  }
});

export default router;
