import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { generateDietPlan } from "../services/llm";

const router = Router();

// GET /api/diet-plans -> saved plans, newest first
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const plans = await prisma.dietPlan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    res.json({ plans });
  })
);

// POST /api/diet-plans/generate  { mealsCount } -> asks the LLM, validates, saves, returns the plan
router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const { mealsCount } = z.object({ mealsCount: z.number().int().min(3).max(6) }).parse(req.body);
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId } });
    if (!profile) return res.status(400).json({ error: "Please complete your profile first" });

    const content = await generateDietPlan(profile, mealsCount);
    const plan = await prisma.dietPlan.create({ data: { userId: req.userId!, mealsCount, content } });
    res.status(201).json({ plan });
  })
);

export default router;
