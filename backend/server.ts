import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { requireAuth } from "./middleware/auth";
import { LlmNotConfiguredError } from "./services/llm";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import mealRoutes from "./routes/meals";
import aiRoutes from "./routes/ai";
import dietPlanRoutes from "./routes/dietPlans";
import foodRoutes from "./routes/foods";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Public routes
app.use("/api/auth", authRoutes);

// Everything below requires a logged-in user (requireAuth sets req.userId)
app.use("/api/profile", requireAuth, profileRoutes);
app.use("/api/meals", requireAuth, mealRoutes);
app.use("/api/ai", requireAuth, aiRoutes);
app.use("/api/diet-plans", requireAuth, dietPlanRoutes);
app.use("/api/foods", requireAuth, foodRoutes);

// One place that turns errors into JSON responses
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({ error: `Invalid input: ${first.path.join(".") || "value"} - ${first.message}` });
  }
  if (err instanceof LlmNotConfiguredError) return res.status(503).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : "Something went wrong" });
};
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`NutrAI API running on http://localhost:${port}`));
