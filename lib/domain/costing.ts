import type {
  ComponentCostEvidence,
  CostConfidence,
  IngredientPurchaseObservation,
  MassUnit,
  MealDefinition,
  MeasuredBatchCostInput,
  OperatingCostCategory,
  OperatingCostLine,
  PackagingCostLine,
  PortionSize,
} from "./types";

const GRAMS_PER_UNIT: Record<MassUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

const REQUIRED_OPERATING_CATEGORIES: OperatingCostCategory[] = [
  "waste",
  "direct-labor",
  "fulfillment",
  "payment-fee",
  "overhead",
];

const round = (value: number, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

const confidenceRank: Record<CostConfidence, number> = { demo: 0, "measured-once": 1, validated: 2 };
const weakestConfidence = (values: CostConfidence[]) =>
  values.reduce<CostConfidence>((lowest, value) => confidenceRank[value] < confidenceRank[lowest] ? value : lowest, "validated");

export function massToGrams(quantity: number, unit: MassUnit) {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Package quantity must be greater than zero.");
  return quantity * GRAMS_PER_UNIT[unit];
}

export function calculateIngredientPurchaseEconomics(purchase: IngredientPurchaseObservation) {
  const errors: string[] = [];
  if (!Number.isFinite(purchase.packageQuantity) || purchase.packageQuantity <= 0) errors.push("Package quantity must be greater than zero.");
  if (!Number.isFinite(purchase.packagePriceCents) || purchase.packagePriceCents < 0) errors.push("Package price cannot be negative.");
  if (!Number.isFinite(purchase.usableYieldPercent) || purchase.usableYieldPercent <= 0 || purchase.usableYieldPercent > 100) errors.push("Usable yield must be between 0 and 100 percent.");
  if (errors.length) return { valid: false, errors, purchasedGrams: 0, usableGrams: 0, costPerPurchasedGramCents: 0, costPerUsableGramCents: 0 };

  const purchasedGrams = massToGrams(purchase.packageQuantity, purchase.packageUnit);
  const usableGrams = purchasedGrams * (purchase.usableYieldPercent / 100);
  return {
    valid: true,
    errors,
    purchasedGrams: round(purchasedGrams),
    usableGrams: round(usableGrams),
    costPerPurchasedGramCents: round(purchase.packagePriceCents / purchasedGrams, 4),
    costPerUsableGramCents: round(purchase.packagePriceCents / usableGrams, 4),
  };
}

export function calculateMeasuredBatchCost(input: MeasuredBatchCostInput) {
  const errors: string[] = [];
  if (!Number.isFinite(input.rawInputGrams) || input.rawInputGrams <= 0) errors.push("Raw input grams must be greater than zero.");
  if (!Number.isFinite(input.cookedOutputGrams) || input.cookedOutputGrams <= 0) errors.push("Cooked output grams must be greater than zero.");
  if (!Number.isFinite(input.expectedYieldPercent) || input.expectedYieldPercent <= 0) errors.push("Expected yield percent must be greater than zero.");

  const purchases = new Map(input.purchases.map((purchase) => [purchase.ingredientId, purchase]));
  const ingredientCosts = input.ingredientUsage.map((usage) => {
    if (!Number.isFinite(usage.gramsUsed) || usage.gramsUsed < 0) {
      errors.push(`Ingredient ${usage.ingredientId} grams used cannot be negative.`);
      return { ingredientId: usage.ingredientId, gramsUsed: usage.gramsUsed, costCents: 0, confidence: "demo" as CostConfidence };
    }
    const purchase = purchases.get(usage.ingredientId);
    if (!purchase) {
      errors.push(`Missing purchase evidence for ingredient: ${usage.ingredientId}`);
      return { ingredientId: usage.ingredientId, gramsUsed: usage.gramsUsed, costCents: 0, confidence: "demo" as CostConfidence };
    }
    const economics = calculateIngredientPurchaseEconomics(purchase);
    if (!economics.valid) {
      errors.push(...economics.errors.map((error) => `${usage.ingredientId}: ${error}`));
      return { ingredientId: usage.ingredientId, gramsUsed: usage.gramsUsed, costCents: 0, confidence: purchase.confidence };
    }
    return {
      ingredientId: usage.ingredientId,
      gramsUsed: usage.gramsUsed,
      costCents: Math.round(usage.gramsUsed * economics.costPerUsableGramCents),
      confidence: purchase.confidence,
    };
  });

  if (errors.length) return { valid: false, errors, ingredientCosts, totalBatchIngredientCostCents: 0, measuredYieldPercent: 0, yieldVariancePercent: 0, costPerCooked100gCents: 0, confidence: "demo" as CostConfidence };

  const totalBatchIngredientCostCents = ingredientCosts.reduce((sum, line) => sum + line.costCents, 0);
  const measuredYieldPercent = (input.cookedOutputGrams / input.rawInputGrams) * 100;
  const yieldVariancePercent = measuredYieldPercent - input.expectedYieldPercent;
  const costPerCooked100gCents = (totalBatchIngredientCostCents / input.cookedOutputGrams) * 100;
  const purchaseConfidence = weakestConfidence(ingredientCosts.map((line) => line.confidence));
  return {
    valid: true,
    errors,
    ingredientCosts,
    totalBatchIngredientCostCents,
    measuredYieldPercent: round(measuredYieldPercent),
    yieldVariancePercent: round(yieldVariancePercent),
    costPerCooked100gCents: Math.round(costPerCooked100gCents),
    confidence: purchaseConfidence === "demo" ? "demo" as CostConfidence : "measured-once" as CostConfidence,
  };
}

export function summarizeComponentCostEvidence(componentId: string, runs: ReturnType<typeof calculateMeasuredBatchCost>[]): ComponentCostEvidence | null {
  const validRuns = runs.filter((run) => run.valid);
  if (!validRuns.length) return null;
  const averageCost = validRuns.reduce((sum, run) => sum + run.costPerCooked100gCents, 0) / validRuns.length;
  const averageYield = validRuns.reduce((sum, run) => sum + run.measuredYieldPercent, 0) / validRuns.length;
  const costSpread = averageCost === 0 ? 0 : (Math.max(...validRuns.map((run) => run.costPerCooked100gCents)) - Math.min(...validRuns.map((run) => run.costPerCooked100gCents))) / averageCost * 100;
  const yieldSpread = averageYield === 0 ? 0 : (Math.max(...validRuns.map((run) => run.measuredYieldPercent)) - Math.min(...validRuns.map((run) => run.measuredYieldPercent))) / averageYield * 100;
  const allMeasured = validRuns.every((run) => run.confidence !== "demo");
  const confidence: CostConfidence = validRuns.length >= 3 && allMeasured && costSpread <= 10 && yieldSpread <= 10 ? "validated" : allMeasured ? "measured-once" : "demo";
  return { componentId, costPerCooked100gCents: Math.round(averageCost), measuredYieldPercent: round(averageYield), confidence, evidenceRunCount: validRuns.length, costSpreadPercent: round(costSpread), yieldSpreadPercent: round(yieldSpread) };
}

export function calculateMealCost(
  meal: MealDefinition,
  portionSize: PortionSize,
  componentEvidence: ComponentCostEvidence[],
  packaging: PackagingCostLine[],
  operatingCosts: OperatingCostLine[],
) {
  const errors: string[] = [];
  const evidenceByComponent = new Map(componentEvidence.map((item) => [item.componentId, item]));
  const componentLines = meal.portions[portionSize].map((portion) => {
    const evidence = evidenceByComponent.get(portion.componentId);
    if (!evidence) {
      errors.push(`Missing measured cost evidence for component: ${portion.componentId}`);
      return { componentId: portion.componentId, grams: portion.grams, costCents: 0, confidence: "demo" as CostConfidence };
    }
    if (evidence.confidence === "validated") {
      const consistencyProven = evidence.evidenceRunCount >= 3
        && Number.isFinite(evidence.costSpreadPercent)
        && Number.isFinite(evidence.yieldSpreadPercent)
        && (evidence.costSpreadPercent ?? Infinity) <= 10
        && (evidence.yieldSpreadPercent ?? Infinity) <= 10;
      if (!consistencyProven) errors.push(`Validated component evidence requires 3+ consistent runs for: ${portion.componentId}`);
    }
    return { componentId: portion.componentId, grams: portion.grams, costCents: Math.round((portion.grams / 100) * evidence.costPerCooked100gCents), confidence: evidence.confidence };
  });

  if (!packaging.length) errors.push("At least one packaging cost line is required.");
  for (const line of [...packaging, ...operatingCosts]) {
    if (!Number.isFinite(line.costPerMealCents) || line.costPerMealCents < 0) errors.push(`${line.name} cost cannot be negative.`);
  }
  const presentCategories = new Set(operatingCosts.map((line) => line.category));
  for (const category of REQUIRED_OPERATING_CATEGORIES) if (!presentCategories.has(category)) errors.push(`Missing operating cost category: ${category}`);

  const foodCostCents = componentLines.reduce((sum, line) => sum + line.costCents, 0);
  const packagingCostCents = packaging.reduce((sum, line) => sum + line.costPerMealCents, 0);
  const operatingCostCents = operatingCosts.reduce((sum, line) => sum + line.costPerMealCents, 0);
  if (packagingCostCents <= 0) errors.push("Packaging cost must be greater than zero before true meal cost can be validated.");
  for (const requiredPositive of ["direct-labor", "overhead"] as OperatingCostCategory[]) {
    const total = operatingCosts.filter((line) => line.category === requiredPositive).reduce((sum, line) => sum + line.costPerMealCents, 0);
    if (total <= 0) errors.push(`${requiredPositive} cost must be greater than zero before true meal cost can be validated.`);
  }
  const estimatedFullyLoadedCostCents = errors.length ? null : foodCostCents + packagingCostCents + operatingCostCents;
  const confidences = [...componentLines.map((line) => line.confidence), ...packaging.map((line) => line.confidence), ...operatingCosts.map((line) => line.confidence)];
  const confidence = confidences.length ? weakestConfidence(confidences) : "demo";
  const status = errors.length ? "blocked" : confidence === "validated" ? "validated" : confidence === "measured-once" ? "measured-estimate" : "demo-estimate";
  return {
    status,
    errors,
    componentLines,
    foodCostCents,
    packagingCostCents,
    operatingCostCents,
    estimatedFullyLoadedCostCents,
    trueMealCostCents: status === "validated" ? estimatedFullyLoadedCostCents : null,
    confidence,
  };
}
