import { getTaxDataByYear } from "./dbService";

// ─────────────────────────────────────────────
// Input / Output Types
// ─────────────────────────────────────────────

export interface TaxInput {
  tax_year: number;
  employment_income: number;
  self_employment_income: number;
  investment_income: number;
  rrsp_contribution: number;
  other_deductions: number;
  other_credits: number;
}

export interface BracketBreakdown {
  bracket: string;
  rate: number;
  tax_amount: number;
}

export interface TaxResult {
  gross_income: number;
  net_income: number;
  federal_tax: number;
  ontario_tax: number;
  ontario_surtax: number;
  cpp_contribution: number;
  ei_premium: number;
  total_tax: number;
  total_deductions: number;
  effective_tax_rate: number;
  marginal_tax_rate: number;
  take_home_income: number;
  bracket_breakdown: BracketBreakdown[];
}

// ─────────────────────────────────────────────
// CPP / EI Constants (2024)
// ─────────────────────────────────────────────

const CPP_RATE = 0.0595;
const CPP_MAX_PENSIONABLE = 68500;
const CPP_BASIC_EXEMPTION = 3500;

const EI_RATE = 0.0166;
const EI_MAX_INSURABLE = 63200;

// ─────────────────────────────────────────────
// Helper: Apply tax brackets to an income amount
// ─────────────────────────────────────────────

const applyBrackets = (
  income: number,
  brackets: { min_income: number; max_income: number | null; rate: number }[]
): { total: number; breakdown: BracketBreakdown[] } => {
  let total = 0;
  const breakdown: BracketBreakdown[] = [];

  for (const bracket of brackets) {
    if (income <= bracket.min_income) break;

    const upper = bracket.max_income ?? Infinity;
    const taxable = Math.min(income, upper) - bracket.min_income;

    if (taxable <= 0) continue;

    const tax = taxable * bracket.rate;
    total += tax;

    breakdown.push({
      bracket: bracket.max_income
        ? `$${bracket.min_income.toLocaleString()} – $${bracket.max_income.toLocaleString()}`
        : `$${bracket.min_income.toLocaleString()}+`,
      rate: bracket.rate,
      tax_amount: Math.round(tax * 100) / 100,
    });
  }

  return { total, breakdown };
};

// ─────────────────────────────────────────────
// Main: calculateTax
// ─────────────────────────────────────────────

/**
 * Calculates federal + Ontario provincial tax for a given
 * income profile. Fetches bracket data from Azure SQL.
 */
export const calculateTax = async (input: TaxInput): Promise<TaxResult> => {
  const {
    tax_year,
    employment_income,
    self_employment_income,
    investment_income,
    rrsp_contribution,
    other_deductions,
    other_credits,
  } = input;

  // 1. Fetch tax reference data from DB
  const taxData = await getTaxDataByYear(tax_year);

  if (!taxData) {
    throw new Error(`No tax data found for year ${tax_year}. Ensure the database is seeded.`);
  }

  // 2. Gross income
  const gross_income =
    employment_income + self_employment_income + investment_income;

  // 3. CPP contribution (on employment income only)
  const cpp_contribution = Math.min(
    Math.max(0, employment_income - CPP_BASIC_EXEMPTION) * CPP_RATE,
    (CPP_MAX_PENSIONABLE - CPP_BASIC_EXEMPTION) * CPP_RATE
  );

  // 4. EI premium (on employment income only)
  const ei_premium = Math.min(employment_income, EI_MAX_INSURABLE) * EI_RATE;

  // 5. Total deductions (RRSP + other + CPP/EI are pre-tax)
  const total_deductions = rrsp_contribution + other_deductions;

  // 6. Net income (taxable income after deductions)
  const net_income = Math.max(0, gross_income - total_deductions);

  // 7. Federal tax
  const { total: federal_tax_raw, breakdown: federal_breakdown } =
    applyBrackets(net_income, taxData.federal_brackets);

  // Apply basic personal amount credit (federal)
  const federalBPA =
    taxData.credits.find((c) => c.slug === "basic-personal-amount")?.amount || 15705;
  const federal_tax = Math.max(0, federal_tax_raw - federalBPA * 0.15 - other_credits);

  // 8. Ontario tax
  const { total: ontario_tax_raw } = applyBrackets(
    net_income,
    taxData.ontario_brackets
  );

  // Apply Ontario basic personal amount credit
  const ontarioBPA =
    taxData.credits.find((c) => c.slug === "ontario-basic-personal")?.amount || 11865;
  const ontario_tax_before_surtax = Math.max(
    0,
    ontario_tax_raw - ontarioBPA * 0.0505
  );

  // 9. Ontario surtax
  let ontario_surtax = 0;
  if (taxData.ontario_surtax) {
    const { threshold_1, threshold_2, rate_1, rate_2 } = taxData.ontario_surtax;
    if (ontario_tax_before_surtax > threshold_1) {
      ontario_surtax +=
        (Math.min(ontario_tax_before_surtax, threshold_2) - threshold_1) * rate_1;
    }
    if (ontario_tax_before_surtax > threshold_2) {
      ontario_surtax +=
        (ontario_tax_before_surtax - threshold_2) * (rate_1 + rate_2);
    }
  }

  const ontario_tax = ontario_tax_before_surtax + ontario_surtax;

  // 10. Total tax
  const total_tax = federal_tax + ontario_tax + cpp_contribution + ei_premium;

  // 11. Take-home
  const take_home_income = Math.max(0, gross_income - total_tax);

  // 12. Rates
  const effective_tax_rate =
    gross_income > 0 ? total_tax / gross_income : 0;

  // Marginal rate = top federal bracket rate + top Ontario bracket rate
  const topFederalBracket = [...taxData.federal_brackets]
    .reverse()
    .find((b) => net_income > b.min_income);
  const topOntarioBracket = [...taxData.ontario_brackets]
    .reverse()
    .find((b) => net_income > b.min_income);

  const marginal_tax_rate =
    (topFederalBracket?.rate || 0) + (topOntarioBracket?.rate || 0);

  return {
    gross_income: Math.round(gross_income * 100) / 100,
    net_income: Math.round(net_income * 100) / 100,
    federal_tax: Math.round(federal_tax * 100) / 100,
    ontario_tax: Math.round(ontario_tax * 100) / 100,
    ontario_surtax: Math.round(ontario_surtax * 100) / 100,
    cpp_contribution: Math.round(cpp_contribution * 100) / 100,
    ei_premium: Math.round(ei_premium * 100) / 100,
    total_tax: Math.round(total_tax * 100) / 100,
    total_deductions: Math.round(total_deductions * 100) / 100,
    effective_tax_rate: Math.round(effective_tax_rate * 10000) / 10000,
    marginal_tax_rate: Math.round(marginal_tax_rate * 10000) / 10000,
    take_home_income: Math.round(take_home_income * 100) / 100,
    bracket_breakdown: federal_breakdown,
  };
};