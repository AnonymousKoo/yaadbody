import type { RecipeBatchTest } from "./types";

const round = (value: number, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

export function summarizeRecipeBatchTest(test: RecipeBatchTest) {
  const errors: string[] = [];
  if (!Number.isFinite(test.rawInputGrams) || test.rawInputGrams <= 0) errors.push("Raw input grams must be greater than zero.");
  if (!Number.isFinite(test.cookedOutputGrams) || test.cookedOutputGrams <= 0) errors.push("Cooked output grams must be greater than zero.");
  if (!Number.isFinite(test.actualBatchCostCents) || test.actualBatchCostCents < 0) errors.push("Actual batch cost cannot be negative.");

  if (errors.length > 0) {
    return { valid: false, errors, yieldPercent: 0, massChangePercent: 0, actualCostPerCooked100gCents: 0 };
  }

  const yieldPercent = (test.cookedOutputGrams / test.rawInputGrams) * 100;
  const massChangePercent = ((test.cookedOutputGrams - test.rawInputGrams) / test.rawInputGrams) * 100;
  const actualCostPerCooked100gCents = (test.actualBatchCostCents / test.cookedOutputGrams) * 100;

  return {
    valid: true,
    errors,
    yieldPercent: round(yieldPercent),
    massChangePercent: round(massChangePercent),
    actualCostPerCooked100gCents: Math.round(actualCostPerCooked100gCents),
  };
}
