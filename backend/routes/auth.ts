import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { signToken } from "../middleware/auth";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

// POST /api/auth/signup  -> creates a user (password is hashed, never stored as plain text)
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    res.status(201).json({ token: signToken(user.id) });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !ok) return res.status(401).json({ error: "Incorrect email or password" });
    res.json({ token: signToken(user.id) });
  })
);

export default router;
