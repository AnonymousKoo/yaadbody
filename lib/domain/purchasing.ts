import type { Component, ComponentCostEvidence, CostConfidence, IngredientInventoryPosition } from "./types";
import type { ProductionDemand } from "./production";

const confidenceRank: Record<CostConfidence, number> = { demo: 0, "measured-once": 1, validated: 2 };
const weakestConfidence = (values: CostConfidence[]) =>
  values.reduce<CostConfidence>((lowest, value) => confidenceRank[value] < confidenceRank[lowest] ? value : lowest, "validated");

const round = (value: number, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

export function calculateIngredientPurchaseRequirements(
  componentDemand: ProductionDemand[],
  components: Component[],
  componentEvidence: ComponentCostEvidence[],
  inventory: IngredientInventoryPosition[],
) {
  const errors: string[] = [];
  const componentById = new Map(components.map((component) => [component.id, component]));
  const evidenceById = new Map(componentEvidence.map((evidence) => [evidence.componentId, evidence]));
  const inventoryById = new Map(inventory.map((position) => [position.ingredientId, position]));
  const grossIngredientDemand = new Map<string, number>();
  const demandConfidences: CostConfidence[] = [];

  for (const demand of componentDemand) {
    const component = componentById.get(demand.componentId);
    if (!component) {
      errors.push(`Missing component definition: ${demand.componentId}`);
      continue;
    }
    const evidence = evidenceById.get(demand.componentId);
    if (!evidence || !Number.isFinite(evidence.measuredYieldPercent) || evidence.measuredYieldPercent <= 0) {
      errors.push(`Missing measured yield evidence for component: ${demand.componentId}`);
      continue;
    }
    if (evidence.confidence === "validated") {
      const yieldConsistencyProven = evidence.evidenceRunCount >= 3
        && Number.isFinite(evidence.yieldSpreadPercent)
        && (evidence.yieldSpreadPercent ?? Infinity) <= 10;
      if (!yieldConsistencyProven) errors.push(`Validated yield evidence requires 3+ consistent runs for component: ${demand.componentId}`);
    }
    demandConfidences.push(evidence.confidence);
    const rawInputRequiredGrams = demand.totalGrams / (evidence.measuredYieldPercent / 100);
    const recipeWeight = component.ingredients.reduce((sum, line) => sum + line.gramsPer100gComponent, 0);
    if (recipeWeight <= 0) {
      errors.push(`Component recipe has no ingredient weight: ${demand.componentId}`);
      continue;
    }
    for (const line of component.ingredients) {
      const ingredientGrams = rawInputRequiredGrams * (line.gramsPer100gComponent / recipeWeight);
      grossIngredientDemand.set(line.ingredientId, (grossIngredientDemand.get(line.ingredientId) ?? 0) + ingredientGrams);
    }
  }

  const requirements = [...grossIngredientDemand.entries()].map(([ingredientId, grossRequiredGrams]) => {
    const position = inventoryById.get(ingredientId);
    if (!position) {
      errors.push(`Missing inventory position for ingredient: ${ingredientId}`);
      return { ingredientId, grossRequiredGrams: round(grossRequiredGrams), usableAvailableGrams: 0, safetyStockGrams: 0, netToBuyGrams: round(grossRequiredGrams), confidence: "demo" as CostConfidence, inventoryComplete: false };
    }
    for (const [label, value] of [["usable on-hand", position.usableOnHandGrams], ["reserved", position.reservedGrams], ["safety stock", position.safetyStockGrams]] as const) {
      if (!Number.isFinite(value) || value < 0) errors.push(`${ingredientId} ${label} grams cannot be negative.`);
    }
    const usableAvailableGrams = Math.max(0, position.usableOnHandGrams - position.reservedGrams);
    const netToBuyGrams = Math.max(0, grossRequiredGrams + position.safetyStockGrams - usableAvailableGrams);
    return {
      ingredientId,
      grossRequiredGrams: round(grossRequiredGrams),
      usableAvailableGrams: round(usableAvailableGrams),
      safetyStockGrams: round(position.safetyStockGrams),
      netToBuyGrams: round(netToBuyGrams),
      confidence: position.confidence,
      inventoryComplete: true,
    };
  }).sort((a, b) => b.netToBuyGrams - a.netToBuyGrams);

  const inventoryConfidences = requirements.filter((item) => item.inventoryComplete).map((item) => item.confidence);
  const overallConfidence = weakestConfidence([...demandConfidences, ...inventoryConfidences]);
  const status = errors.length ? "blocked" : overallConfidence === "validated" ? "validated-requirement" : "planning-requirement";

  return { status, errors, requirements, confidence: overallConfidence } as const;
}
