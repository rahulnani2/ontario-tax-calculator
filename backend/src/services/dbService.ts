import * as sql from "mssql";
import { getPool } from "../config/azureConfig";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TaxBracket {
  id: number;
  min_income: number;
  max_income: number | null; // null = no upper limit (top bracket)
  rate: number;
}

export interface OntarioSurtax {
  threshold_1: number;
  threshold_2: number;
  rate_1: number;
  rate_2: number;
}

export interface Deduction {
  id: number;
  name: string;
  slug: string;
  max_amount: number | null;
  description: string;
}

export interface Credit {
  id: number;
  name: string;
  slug: string;
  amount: number;
  is_refundable: boolean;
}

export interface TaxYearData {
  year: number;
  federal_brackets: TaxBracket[];
  ontario_brackets: TaxBracket[];
  ontario_surtax: OntarioSurtax;
  deductions: Deduction[];
  credits: Credit[];
}

// ─────────────────────────────────────────────
// getTaxDataByYear
// ─────────────────────────────────────────────

/**
 * Fetches all tax reference data for a given year from Azure SQL.
 * Returns null if no tax_year record exists for that year.
 */
export const getTaxDataByYear = async (
  year: number
): Promise<TaxYearData | null> => {
  const pool = await getPool();

  // 1. Resolve tax_year_id
  const yearResult = await pool
    .request()
    .input("year", sql.Int, year)
    .query("SELECT id FROM tax_years WHERE year = @year AND is_active = 1");

  if (yearResult.recordset.length === 0) {
    return null;
  }

  const taxYearId: number = yearResult.recordset[0].id;
  const req = () => pool.request().input("tax_year_id", sql.Int, taxYearId);

  // 2. Parallel queries for all reference data
  const [
    federalResult,
    ontarioResult,
    surtaxResult,
    deductionsResult,
    creditsResult,
  ] = await Promise.all([
    req().query<TaxBracket>(
      `SELECT id, min_income, max_income, rate
       FROM federal_brackets
       WHERE tax_year_id = @tax_year_id
       ORDER BY min_income ASC`
    ),
    req().query<TaxBracket>(
      `SELECT id, min_income, max_income, rate
       FROM ontario_brackets
       WHERE tax_year_id = @tax_year_id
       ORDER BY min_income ASC`
    ),
    req().query<OntarioSurtax>(
      `SELECT threshold_1, threshold_2, rate_1, rate_2
       FROM ontario_surtax
       WHERE tax_year_id = @tax_year_id`
    ),
    req().query<Deduction>(
      `SELECT id, name, slug, max_amount, description
       FROM deductions
       WHERE tax_year_id = @tax_year_id`
    ),
    req().query<Credit>(
      `SELECT id, name, slug, amount, is_refundable
       FROM credits
       WHERE tax_year_id = @tax_year_id`
    ),
  ]);

  return {
    year,
    federal_brackets: federalResult.recordset,
    ontario_brackets: ontarioResult.recordset,
    ontario_surtax: surtaxResult.recordset[0],
    deductions: deductionsResult.recordset,
    credits: creditsResult.recordset,
  };
};