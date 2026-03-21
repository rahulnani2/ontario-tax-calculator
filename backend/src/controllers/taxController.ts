// taxController.ts — named exports only, no default export
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { calculateTax } from "../services/taxCalculationService";
import { getTaxDataByYear } from "../services/dbService";

// ─────────────────────────────────────────────
// Zod Validation Schema
// ─────────────────────────────────────────────

const TaxCalculationSchema = z.object({
  tax_year: z
    .number({
      required_error: "tax_year is required",
      invalid_type_error: "tax_year must be a number",
    })
    .int("tax_year must be an integer")
    .min(2020, "tax_year must be 2020 or later")
    .max(2026, "tax_year must be 2026 or earlier"),

  employment_income: z
    .number({
      required_error: "employment_income is required",
      invalid_type_error: "employment_income must be a number",
    })
    .min(0, "employment_income cannot be negative"),

  self_employment_income: z
    .number({ invalid_type_error: "self_employment_income must be a number" })
    .min(0, "self_employment_income cannot be negative")
    .default(0),

  investment_income: z
    .number({ invalid_type_error: "investment_income must be a number" })
    .min(0, "investment_income cannot be negative")
    .default(0),

  rrsp_contribution: z
    .number({ invalid_type_error: "rrsp_contribution must be a number" })
    .min(0, "rrsp_contribution cannot be negative")
    .max(29210, "rrsp_contribution cannot exceed the annual limit of $29,210")
    .default(0),

  other_deductions: z
    .number({ invalid_type_error: "other_deductions must be a number" })
    .min(0, "other_deductions cannot be negative")
    .default(0),

  other_credits: z
    .number({ invalid_type_error: "other_credits must be a number" })
    .min(0, "other_credits cannot be negative")
    .default(0),
});

// Infer TypeScript type from Zod schema
export type TaxCalculationInput = z.infer<typeof TaxCalculationSchema>;

// ─────────────────────────────────────────────
// POST /api/calculate
// ─────────────────────────────────────────────

/**
 * Accepts income and deduction inputs, validates them,
 * runs the tax calculation, and returns a full tax breakdown.
 */
export const calculateTaxHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Parse and validate request body
  const parseResult = TaxCalculationSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errors = parseResult.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
    return;
  }

  // 2. Call calculation service
  try {
    const result = await calculateTax(parseResult.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error); // Passed to errorHandler middleware
  }
};

// ─────────────────────────────────────────────
// GET /api/tax-data/:year
// ─────────────────────────────────────────────

/**
 * Returns all tax reference data (brackets, deductions, credits)
 * for the requested tax year. Returns 404 if year not found.
 */
export const getTaxDataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const yearParam = parseInt(req.params.year, 10);

  // Validate year param
  if (isNaN(yearParam) || yearParam < 2020 || yearParam > 2026) {
    res.status(400).json({
      success: false,
      error: "Invalid year. Must be an integer between 2020 and 2026.",
    });
    return;
  }

  try {
    const taxData = await getTaxDataByYear(yearParam);

    if (!taxData) {
      res.status(404).json({
        success: false,
        error: `No tax data found for year ${yearParam}. Ensure the database is seeded.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: taxData,
    });
  } catch (error) {
    next(error); // Passed to errorHandler middleware
  }
};