export interface TaxCalculationInput {
  tax_year: number;
  employment_income: number;
  self_employment_income: number;
  investment_income: number;
  rrsp_contribution: number;
  other_deductions: number;
  other_credits: number;
}

export interface TaxBracket {
  minIncome: number;
  maxIncome: number | null;
  rate: number;
}

export interface SurtaxConfig {
  threshold1: number;
  threshold2: number | null;
  rate1: number;
  rate2: number | null;
}

export interface BracketBreakdownItem {
  bracket: string;
  rate: number;
  tax_amount: number;
}

export interface TaxCalculationResponse {
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
  bracket_breakdown: BracketBreakdownItem[];
}

export interface TaxDataResponse {
  year: number;
  federalBrackets: TaxBracket[];
  ontarioBrackets: TaxBracket[];
  ontarioSurtax: SurtaxConfig | null;
}

export interface CreateSessionRequest {
  inputs: TaxCalculationInput;
  results: TaxCalculationResponse;
}

export interface SessionResponse {
  token: string;
  inputs: TaxCalculationInput;
  results: TaxCalculationResponse;
  createdAt: string;
  updatedAt: string;
}

