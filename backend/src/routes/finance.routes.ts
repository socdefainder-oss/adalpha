import { Router } from "express";
import { z } from "zod";
import { createId, store } from "../lib/store";
import { roleRequired } from "../middlewares/auth";
import { Role, TransactionType } from "../types/domain";

const router = Router();

router.get("/transactions", async (_req, res) => {
  const transactions = [...store.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 100);

  return res.json(transactions);
});

router.post("/transactions", roleRequired(Role.ADMIN, Role.PASTOR, Role.TESOUREIRO), async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(2),
        description: z.string().optional(),
        amount: z.number().positive(),
        date: z.string().datetime(),
        type: z.nativeEnum(TransactionType),
        category: z.string().min(2),
      })
      .parse(req.body);

    const now = new Date().toISOString();
    const transaction = {
      id: createId("trx"),
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      date: data.date,
      type: data.type,
      category: data.category,
      createdAt: now,
      updatedAt: now,
    };

    store.transactions.push(transaction);

    return res.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
});

router.get("/summary", async (_req, res) => {
  const transactions = store.transactions;

  const summary = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount);
      if (t.type === "ENTRADA") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 },
  );

  return res.json(summary);
});

export default router;
