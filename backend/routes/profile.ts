import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { calculateTargets } from "../services/nutrition";

const router = Router();

const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  age: z.number().int().min(13).max(100),
  sex: z.enum(["male", "female"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  diet: z.enum(["vegetarian", "non_vegetarian", "vegan", "eggetarian"]),
});

// GET /api/profile -> the logged-in user's email + profile (profile is null before onboarding)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, profile: true },
    });
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user: { id: user.id, email: user.email }, profile: user.profile });
  })
);

// PUT /api/profile -> create or update the profile; targets are calculated here (not by the AI)
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const data = profileSchema.parse(req.body);
    const targets = calculateTargets(data);
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      create: { userId: req.userId!, ...data, ...targets },
      update: { ...data, ...targets },
    });
    res.json({ profile });
  })
);

export default router;
