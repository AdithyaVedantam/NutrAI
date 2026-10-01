import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { analyzeMeal, chatWithAssistant } from "../services/llm";

const router = Router();

// POST /api/ai/analyze-meal  { description }  -> validated nutrition estimate (not saved yet)
router.post(
  "/analyze-meal",
  asyncHandler(async (req, res) => {
    const { description } = z.object({ description: z.string().trim().min(2).max(500) }).parse(req.body);
    const analysis = await analyzeMeal(description);
    res.json({ analysis });
  })
);

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(10)
    .default([]),
  dayStart: z.string().datetime(), // the user's local "today", sent by the browser
  dayEnd: z.string().datetime(),
});

// POST /api/ai/chat -> the server builds the context (profile + today's intake) and asks the LLM
router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message, history, dayStart, dayEnd } = chatSchema.parse(req.body);
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId } });
    if (!profile) return res.status(400).json({ error: "Please complete your profile first" });

    const totals = await prisma.meal.aggregate({
      where: { userId: req.userId, eatenAt: { gte: new Date(dayStart), lte: new Date(dayEnd) } },
      _sum: { calories: true, protein: true },
    });

    const reply = await chatWithAssistant(
      {
        name: profile.name,
        goal: profile.goal,
        diet: profile.diet.replace("_", "-"),
        targetCalories: profile.targetCalories,
        proteinG: profile.proteinG,
        caloriesToday: totals._sum.calories ?? 0,
        proteinToday: Math.round(totals._sum.protein ?? 0),
      },
      history,
      message
    );
    res.json({ reply });
  })
);

export default router;
