import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error handling middleware.
 * Catches anything passed via next(error) from controllers.
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;

  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error:
      statusCode === 500
        ? "An unexpected server error occurred. Please try again later."
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};