export type CostBasisStatus = "blocked" | "demo-estimate" | "measured-estimate" | "validated";

export type PricingInput = {
  costCents: number | null;
  costStatus: CostBasisStatus;
  targetMarginPercent: number;
  roundingIncrementCents?: number;
  candidatePriceCents?: number;
};

const round = (value: number, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

export function calculatePriceForTargetMargin(costCents: number, targetMarginPercent: number) {
  if (!Number.isFinite(costCents) || costCents <= 0) throw new Error("Cost must be greater than zero.");
  if (!Number.isFinite(targetMarginPercent) || targetMarginPercent <= 0 || targetMarginPercent >= 100) {
    throw new Error("Target margin must be greater than 0 and less than 100 percent.");
  }
  return Math.ceil(costCents / (1 - targetMarginPercent / 100));
}

export function calculateUnitMarginPercent(priceCents: number, costCents: number) {
  if (!Number.isFinite(priceCents) || priceCents <= 0) throw new Error("Price must be greater than zero.");
  if (!Number.isFinite(costCents) || costCents < 0) throw new Error("Cost cannot be negative.");
  return round(((priceCents - costCents) / priceCents) * 100);
}

export function evaluateMealPricing(input: PricingInput) {
  const errors: string[] = [];
  if (input.costCents === null || !Number.isFinite(input.costCents) || input.costCents <= 0) errors.push("A positive fully loaded meal cost is required.");
  if (!Number.isFinite(input.targetMarginPercent) || input.targetMarginPercent <= 0 || input.targetMarginPercent >= 100) errors.push("Target margin must be greater than 0 and less than 100 percent.");
  const increment = input.roundingIncrementCents ?? 50;
  if (!Number.isInteger(increment) || increment <= 0) errors.push("Rounding increment must be a positive whole number of cents.");
  if (input.costStatus === "blocked") errors.push("Pricing is blocked because the meal cost basis is blocked.");
  if (input.candidatePriceCents !== undefined && (!Number.isFinite(input.candidatePriceCents) || input.candidatePriceCents <= 0)) errors.push("Candidate price must be greater than zero.");

  if (errors.length || input.costCents === null) {
    return { status: "blocked" as const, errors, minimumPriceCents: null, recommendedPriceCents: null, achievedMarginPercent: null, candidateMarginPercent: null, canFinalize: false };
  }

  const minimumPriceCents = calculatePriceForTargetMargin(input.costCents, input.targetMarginPercent);
  const recommendedPriceCents = Math.ceil(minimumPriceCents / increment) * increment;
  const achievedMarginPercent = calculateUnitMarginPercent(recommendedPriceCents, input.costCents);
  const candidateMarginPercent = input.candidatePriceCents === undefined ? null : calculateUnitMarginPercent(input.candidatePriceCents, input.costCents);
  const canFinalize = input.costStatus === "validated";

  return {
    status: canFinalize ? "validated-price-floor" as const : "planning-estimate" as const,
    errors,
    minimumPriceCents,
    recommendedPriceCents,
    achievedMarginPercent,
    candidateMarginPercent,
    canFinalize,
  };
}
