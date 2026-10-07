/** Share of gross monthly income that total car costs should stay within. */
export const CAR_BUDGET_INCOME_SHARE = 0.15;

/** Share of the available car budget that can go to the loan instalment; the rest covers running costs. */
export const LOAN_SHARE_OF_CAR_BUDGET = 0.7;

export const LOAN_TERM_MONTH_OPTIONS = [12, 24, 36, 48, 60, 72] as const;
export const DEFAULT_LOAN_TERM_MONTHS = 60;

export const INTEREST_RATE_OPTIONS = [
  { value: 8.75, label: "8.75% (CBR)" },
  { value: 12, label: "12% (typical)" },
  { value: 15, label: "15% (higher risk)" },
] as const;
export const DEFAULT_INTEREST_RATE = 12;

export interface AffordabilityInput {
  grossMonthlyIncome: number;
  existingMonthlyDebts: number;
  deposit: number;
  termMonths: number;
  annualRatePercent: number;
}

export interface AffordabilityResult {
  /** Gross income x 15%. */
  maxMonthlyBudget: number;
  /** Monthly budget left after existing debt repayments (never negative). */
  availableBudget: number;
  /** 70% of the available budget, the most the loan instalment should be. */
  monthlyLoanCapacity: number;
  /** 30% of the available budget, kept for fuel, insurance and maintenance. */
  runningCostsReserve: number;
  maxLoanAmount: number;
  /** Max loan + deposit, rounded down to the shilling. */
  maxCarPrice: number;
}

function nonNegative(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function computeAffordability(input: AffordabilityInput): AffordabilityResult {
  const income = nonNegative(input.grossMonthlyIncome);
  const debts = nonNegative(input.existingMonthlyDebts);
  const deposit = nonNegative(input.deposit);
  const months = Math.max(Math.round(nonNegative(input.termMonths)), 1);
  const monthlyRate = nonNegative(input.annualRatePercent) / 100 / 12;

  const maxMonthlyBudget = income * CAR_BUDGET_INCOME_SHARE;
  const availableBudget = Math.max(0, maxMonthlyBudget - debts);
  const monthlyLoanCapacity = availableBudget * LOAN_SHARE_OF_CAR_BUDGET;
  const runningCostsReserve = availableBudget - monthlyLoanCapacity;

  const maxLoanAmount =
    monthlyRate > 0
      ? (monthlyLoanCapacity * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate
      : monthlyLoanCapacity * months;

  return {
    maxMonthlyBudget,
    availableBudget,
    monthlyLoanCapacity,
    runningCostsReserve,
    maxLoanAmount,
    maxCarPrice: Math.floor(maxLoanAmount + deposit),
  };
}

export function budgetSearchHref(maxCarPrice: number) {
  return `/search?category=car&maxPrice=${Math.max(0, Math.floor(maxCarPrice))}`;
}

export function computeLoan({
  amount,
  downPayment,
  annualRate,
  years,
}: {
  amount: number;
  downPayment: number;
  annualRate: number;
  years: number;
}) {
  const principal = Math.max(amount - downPayment, 0);
  const months = Math.max(Math.round(years * 12), 1);

  if (principal <= 0) {
    return { monthly: 0, total: 0, interest: 0 };
  }

  if (annualRate <= 0) {
    const monthly = principal / months;
    return { monthly, total: principal, interest: 0 };
  }

  const monthlyRate = annualRate / 100 / 12;
  const monthly =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const total = monthly * months;
  const interest = total - principal;

  return { monthly, total, interest };
}
