import { Router } from "express";
import { foods } from "../data/foods";

const router = Router();

// GET /api/foods -> the small local food dataset
router.get("/", (_req, res) => {
  res.json({ foods });
});

export default router;
