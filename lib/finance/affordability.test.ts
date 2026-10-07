import assert from "node:assert/strict";
import test from "node:test";
import { budgetSearchHref, computeAffordability, computeLoan } from "./affordability";

function assertClose(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
}

test("worked example: 150k income, 20k debts, 300k deposit, 72 months at 12%", () => {
  const result = computeAffordability({
    grossMonthlyIncome: 150_000,
    existingMonthlyDebts: 20_000,
    deposit: 300_000,
    termMonths: 72,
    annualRatePercent: 12,
  });

  assert.equal(result.maxMonthlyBudget, 22_500);
  assert.equal(result.availableBudget, 2_500);
  assert.equal(result.monthlyLoanCapacity, 1_750);
  assertClose(result.runningCostsReserve, 750);

  // P = 1,750 x (1 - 1.01^-72) / 0.01
  const expectedLoan = (1_750 * (1 - Math.pow(1.01, -72))) / 0.01;
  assertClose(result.maxLoanAmount, expectedLoan);
  assertClose(result.maxLoanAmount, 89_513.19);
  assert.equal(result.maxCarPrice, Math.floor(expectedLoan + 300_000));
  assert.equal(result.maxCarPrice, 389_513);
});

test("zero interest rate spreads loan capacity evenly over the term", () => {
  const result = computeAffordability({
    grossMonthlyIncome: 200_000,
    existingMonthlyDebts: 0,
    deposit: 100_000,
    termMonths: 60,
    annualRatePercent: 0,
  });

  assert.equal(result.maxMonthlyBudget, 30_000);
  assert.equal(result.monthlyLoanCapacity, 21_000);
  assert.equal(result.maxLoanAmount, 1_260_000);
  assert.equal(result.maxCarPrice, 1_360_000);
});

test("debts above the 15% budget leave no loan capacity, only the deposit", () => {
  const result = computeAffordability({
    grossMonthlyIncome: 100_000,
    existingMonthlyDebts: 20_000,
    deposit: 250_000,
    termMonths: 48,
    annualRatePercent: 12,
  });

  assert.equal(result.maxMonthlyBudget, 15_000);
  assert.equal(result.availableBudget, 0);
  assert.equal(result.monthlyLoanCapacity, 0);
  assert.equal(result.runningCostsReserve, 0);
  assert.equal(result.maxLoanAmount, 0);
  assert.equal(result.maxCarPrice, 250_000);
});

test("blank or invalid inputs are treated as zero", () => {
  const result = computeAffordability({
    grossMonthlyIncome: Number.NaN,
    existingMonthlyDebts: -5_000,
    deposit: 0,
    termMonths: 60,
    annualRatePercent: 12,
  });

  assert.equal(result.maxMonthlyBudget, 0);
  assert.equal(result.maxCarPrice, 0);
});

test("budget search link targets cars at or under the max price", () => {
  assert.equal(budgetSearchHref(389_513), "/search?category=car&maxPrice=389513");
  assert.equal(budgetSearchHref(1_000.9), "/search?category=car&maxPrice=1000");
});

test("computeLoan keeps the amortised repayment maths", () => {
  const oneYear = computeLoan({ amount: 1_000_000, downPayment: 0, annualRate: 12, years: 1 });
  assertClose(oneYear.monthly, 88_848.79);

  const fiveYears = computeLoan({ amount: 2_500_000, downPayment: 500_000, annualRate: 12, years: 5 });
  assertClose(fiveYears.monthly, 44_488.9);
  assertClose(fiveYears.total, 2_669_333.72);
  assertClose(fiveYears.interest, 669_333.72);

  assert.deepEqual(
    computeLoan({ amount: 1_200_000, downPayment: 0, annualRate: 0, years: 1 }),
    { monthly: 100_000, total: 1_200_000, interest: 0 }
  );
  assert.deepEqual(
    computeLoan({ amount: 500_000, downPayment: 600_000, annualRate: 12, years: 5 }),
    { monthly: 0, total: 0, interest: 0 }
  );
});
