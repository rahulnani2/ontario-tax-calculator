import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./app";
import { closePool } from "./config/azureConfig";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown — closes DB pool on CTRL+C or Azure App Service stop
process.on("SIGTERM", async () => {
  console.log("[SERVER] SIGTERM received — shutting down gracefully");
  await closePool();
  server.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
  console.log("[SERVER] SIGINT received — shutting down gracefully");
  await closePool();
  server.close(() => process.exit(0));
});
