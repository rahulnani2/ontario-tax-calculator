import { Request, Response, NextFunction } from "express";

/**
 * Logs method, path, status code, and response time for every request.
 * Compatible with Azure App Service log streaming.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? "ERROR" :
                     res.statusCode >= 400 ? "WARN"  : "INFO";

    console.log(
      `[${logLevel}] ${new Date().toISOString()} | ${req.method} ${req.path} | ${res.statusCode} | ${duration}ms`
    );
  });

  next();
};