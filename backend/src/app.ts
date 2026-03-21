import express from "express";
import cors from "cors";
import taxRoutes from "./routes/taxRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use(requestLogger);

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api", taxRoutes);

// ─────────────────────────────────────────────
// Global Error Handler (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

export default app;