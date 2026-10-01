import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

const mealSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mealType: z.enum(["breakfast", "lunch", "snack", "dinner"]),
  calories: z.number().min(0).max(5000).transform(Math.round),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(800),
  fat: z.number().min(0).max(400),
  source: z.enum(["manual", "ai"]).default("manual"),
  eatenAt: z.string().datetime().optional(),
});

const rangeSchema = z.object({ from: z.string().datetime(), to: z.string().datetime() });

// GET /api/meals?from=<ISO>&to=<ISO> -> this user's meals in a time range
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { from, to } = rangeSchema.parse(req.query);
    const meals = await prisma.meal.findMany({
      where: { userId: req.userId, eatenAt: { gte: new Date(from), lte: new Date(to) } },
      orderBy: { eatenAt: "asc" },
    });
    res.json({ meals });
  })
);

// POST /api/meals
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { eatenAt, ...data } = mealSchema.parse(req.body);
    const meal = await prisma.meal.create({
      data: { ...data, userId: req.userId!, eatenAt: eatenAt ? new Date(eatenAt) : new Date() },
    });
    res.status(201).json({ meal });
  })
);

// PUT /api/meals/:id  (where userId = me, so nobody can edit someone else's meal)
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { eatenAt, ...data } = mealSchema.parse(req.body);
    const result = await prisma.meal.updateMany({
      where: { id: Number(req.params.id), userId: req.userId },
      data: { ...data, ...(eatenAt ? { eatenAt: new Date(eatenAt) } : {}) },
    });
    if (result.count === 0) return res.status(404).json({ error: "Meal not found" });
    res.json({ ok: true });
  })
);

// DELETE /api/meals/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await prisma.meal.deleteMany({ where: { id: Number(req.params.id), userId: req.userId } });
    if (result.count === 0) return res.status(404).json({ error: "Meal not found" });
    res.json({ ok: true });
  })
);

export default router;
