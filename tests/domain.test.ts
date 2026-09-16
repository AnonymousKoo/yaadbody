import assert from "node:assert/strict";
import test from "node:test";
import { calculateMealSnapshot, calculateWasteSummary } from "../lib/domain/calculations";
import { aggregateMealPrepDemand } from "../lib/domain/production";
import { eligibleMenuForIntake, recommendMealPlan } from "../lib/domain/recommendations";
import { evaluateCateringInquiry } from "../lib/domain/catering";
import { validateMealPrepOrderDraft } from "../lib/domain/orders";
import { summarizeRecipeBatchTest } from "../lib/domain/recipe-validation";
import { calculateIngredientPurchaseEconomics, calculateMeasuredBatchCost, calculateMealCost, summarizeComponentCostEvidence } from "../lib/domain/costing";
import { cateringPackages, components, demoOrders, ingredients, meals, plans, wasteEntries, weeklyMenu } from "../fixtures/demo";
import type { CateringInquiry, CustomerMealIntake } from "../lib/domain/types";

test("calculates a balanced meal snapshot", () => {
  const snapshot = calculateMealSnapshot(meals[0], "balanced", components, ingredients);
  assert.equal(snapshot.components.length, 3);
  assert.ok(snapshot.macros.proteinGrams > 45);
  assert.ok(snapshot.estimatedFoodCostCents > 0);
  assert.deepEqual(snapshot.allergens, []);
});

test("applies allowed protein substitution and allergen", () => {
  const snapshot = calculateMealSnapshot(meals[0], "build", components, ingredients, "garlic-shrimp");
  assert.equal(snapshot.substitutionSurchargeCents, 250);
  assert.ok(snapshot.allergens.includes("crustacean-shellfish"));
  assert.equal(snapshot.components[0].componentId, "garlic-shrimp");
});

test("rejects an unapproved substitution", () => {
  assert.throws(
    () => calculateMealSnapshot(meals[0], "balanced", components, ingredients, "rice-and-peas"),
    /not allowed/,
  );
});

test("aggregates locked orders into kitchen component demand", () => {
  const demand = aggregateMealPrepDemand(demoOrders, weeklyMenu, meals);
  const jerk = demand.find((item) => item.componentId === "jerk-chicken");
  const shrimp = demand.find((item) => item.componentId === "garlic-shrimp");
  assert.equal(jerk?.totalGrams, 680);
  assert.equal(shrimp?.totalGrams, 620);
});

test("separates total waste from avoidable waste", () => {
  const summary = calculateWasteSummary(wasteEntries, 25_000);
  assert.equal(summary.totalWasteCents, 1705);
  assert.equal(summary.avoidableWasteCents, 1380);
  assert.equal(summary.wasteRatePercent, 6.8);
});


test("recommends portion and plan from customer goal", () => {
  const intake: CustomerMealIntake = {
    goal: "muscle", desiredMealCount: 10, preferredCuisines: ["jamaican"], allergens: [],
    dislikedProteinComponentIds: [], fulfillmentMethod: "pickup",
  };
  const recommendation = recommendMealPlan(intake, plans);
  assert.equal(recommendation.plan.id, "plan-10");
  assert.equal(recommendation.portionSize, "build");
});

test("filters meals by listed allergens without making a cross-contact claim", () => {
  const intake: CustomerMealIntake = {
    goal: "healthy-eating", desiredMealCount: 5, preferredCuisines: [], allergens: ["fish", "crustacean-shellfish"],
    dislikedProteinComponentIds: [], fulfillmentMethod: "delivery",
  };
  const eligible = eligibleMenuForIntake(intake, weeklyMenu, meals, components, ingredients);
  assert.ok(eligible.every((entry) => !entry.snapshot.allergens.includes("fish")));
  assert.ok(eligible.every((entry) => !entry.snapshot.allergens.includes("crustacean-shellfish")));
  assert.ok(!eligible.some((entry) => entry.meal.id === "escovitch-cod-plate"));
});

test("routes sub-20 guest inquiries to party trays", () => {
  const inquiry: CateringInquiry = {
    eventType: "birthday", eventDate: "2026-10-10", guestCount: 12, serviceLevel: "drop-off",
    location: "32962", contactEmail: "test@example.com", dietaryNotes: "",
  };
  const result = evaluateCateringInquiry(inquiry, cateringPackages);
  assert.equal(result.route, "party-trays");
  assert.equal(result.quoteReady, false);
});

test("marks structured drop-off catering inquiry ready for costing review", () => {
  const inquiry: CateringInquiry = {
    eventType: "corporate", eventDate: "2026-11-18", guestCount: 45, serviceLevel: "drop-off",
    location: "Vero Beach, FL", contactEmail: "ops@example.com", dietaryNotes: "No pork",
  };
  const result = evaluateCateringInquiry(inquiry, cateringPackages);
  assert.equal(result.route, "catering");
  assert.equal(result.quoteReady, true);
  assert.equal(result.recommendedPackage?.id, "drop-off-signature");
});


test("validates a filled local meal-prep draft without billing or persistence", () => {
  const result = validateMealPrepOrderDraft({
    id: "draft-1", status: "draft", planId: "plan-5", fulfillmentMethod: "pickup", customerAllergenFilters: [],
    selections: [{ menuItemId: "menu-1", portionSize: "balanced", quantity: 3 }, { menuItemId: "menu-2", portionSize: "balanced", quantity: 2 }],
  }, plans, weeklyMenu);
  assert.equal(result.valid, true);
  assert.equal(result.selectedCount, 5);
});

test("rejects an underfilled meal-prep draft", () => {
  const result = validateMealPrepOrderDraft({
    id: "draft-2", status: "draft", planId: "plan-10", fulfillmentMethod: "delivery", customerAllergenFilters: [],
    selections: [{ menuItemId: "menu-1", portionSize: "lean", quantity: 4 }],
  }, plans, weeklyMenu);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /exactly 10 meals/);
});


test("filters a disliked base protein from the recommended menu", () => {
  const intake: CustomerMealIntake = {
    goal: "healthy-eating", desiredMealCount: 10, preferredCuisines: [], allergens: [],
    dislikedProteinComponentIds: ["lean-meatballs"], fulfillmentMethod: "pickup",
  };
  const eligible = eligibleMenuForIntake(intake, weeklyMenu, meals, components, ingredients);
  assert.ok(!eligible.some((entry) => entry.meal.id === "beef-sweet-potato"));
});


test("summarizes a physical batch test with cooking shrink", () => {
  const summary = summarizeRecipeBatchTest({
    id: "test-chicken", componentId: "jerk-chicken", rawInputGrams: 1000, cookedOutputGrams: 760, actualBatchCostCents: 950,
  });
  assert.equal(summary.valid, true);
  assert.equal(summary.yieldPercent, 76);
  assert.equal(summary.massChangePercent, -24);
  assert.equal(summary.actualCostPerCooked100gCents, 125);
});

test("allows cooked output above raw input for water-absorbing components", () => {
  const summary = summarizeRecipeBatchTest({
    id: "test-rice", componentId: "white-rice", rawInputGrams: 500, cookedOutputGrams: 1400, actualBatchCostCents: 240,
  });
  assert.equal(summary.valid, true);
  assert.equal(summary.yieldPercent, 280);
  assert.equal(summary.massChangePercent, 180);
});


test("derives usable ingredient cost from a real package purchase", () => {
  const result = calculateIngredientPurchaseEconomics({ ingredientId: "chicken", packageQuantity: 5, packageUnit: "lb", packagePriceCents: 1699, usableYieldPercent: 94, confidence: "measured-once" });
  assert.equal(result.valid, true);
  assert.ok(result.usableGrams > 2100);
  assert.ok(result.costPerUsableGramCents > result.costPerPurchasedGramCents);
});

test("derives batch cost from ingredient usage and purchase evidence", () => {
  const result = calculateMeasuredBatchCost({
    id: "batch-1", componentId: "jerk-chicken", rawInputGrams: 1000, cookedOutputGrams: 760, expectedYieldPercent: 78,
    ingredientUsage: [{ ingredientId: "chicken", gramsUsed: 940 }, { ingredientId: "jerk-seasoning", gramsUsed: 40 }, { ingredientId: "oil", gramsUsed: 20 }],
    purchases: [
      { ingredientId: "chicken", packageQuantity: 5, packageUnit: "lb", packagePriceCents: 1699, usableYieldPercent: 94, confidence: "measured-once" },
      { ingredientId: "jerk-seasoning", packageQuantity: 16, packageUnit: "oz", packagePriceCents: 899, usableYieldPercent: 100, confidence: "measured-once" },
      { ingredientId: "oil", packageQuantity: 48, packageUnit: "oz", packagePriceCents: 1099, usableYieldPercent: 100, confidence: "measured-once" },
    ],
  });
  assert.equal(result.valid, true);
  assert.equal(result.measuredYieldPercent, 76);
  assert.equal(result.yieldVariancePercent, -2);
  assert.ok(result.totalBatchIngredientCostCents > 0);
  assert.equal(result.confidence, "measured-once");
});

test("requires repeat consistent batches before component cost is validated", () => {
  const makeRun = (cost: number, yieldPercent: number) => ({ valid: true, errors: [], ingredientCosts: [], totalBatchIngredientCostCents: 1000, measuredYieldPercent: yieldPercent, yieldVariancePercent: 0, costPerCooked100gCents: cost, confidence: "measured-once" as const });
  const one = summarizeComponentCostEvidence("jerk-chicken", [makeRun(125, 76)]);
  const three = summarizeComponentCostEvidence("jerk-chicken", [makeRun(124, 76), makeRun(126, 77), makeRun(125, 75)]);
  assert.equal(one?.confidence, "measured-once");
  assert.equal(three?.confidence, "validated");
  assert.equal(three?.evidenceRunCount, 3);
});

test("fails closed on true meal cost when cost evidence is incomplete", () => {
  const result = calculateMealCost(meals[0], "balanced", [{ componentId: "jerk-chicken", costPerCooked100gCents: 125, measuredYieldPercent: 76, confidence: "validated", evidenceRunCount: 3, costSpreadPercent: 3, yieldSpreadPercent: 2 }], [{ id: "tray", name: "Tray", costPerMealCents: 32, confidence: "validated" }], []);
  assert.equal(result.status, "blocked");
  assert.equal(result.trueMealCostCents, null);
  assert.ok(result.errors.some((error) => error.includes("rice-and-peas")));
  assert.ok(result.errors.some((error) => error.includes("direct-labor")));
});

test("produces true meal cost only when all food, packaging, and operating lines are validated", () => {
  const evidence = meals[0].portions.balanced.map((portion) => ({ componentId: portion.componentId, costPerCooked100gCents: 100, measuredYieldPercent: 90, confidence: "validated" as const, evidenceRunCount: 3, costSpreadPercent: 2, yieldSpreadPercent: 2 }));
  const packaging = [{ id: "tray", name: "Tray + label", costPerMealCents: 40, confidence: "validated" as const }];
  const ops = [
    { id: "waste", name: "Waste allocation", category: "waste" as const, costPerMealCents: 20, confidence: "validated" as const },
    { id: "labor", name: "Direct labor", category: "direct-labor" as const, costPerMealCents: 125, confidence: "validated" as const },
    { id: "fulfillment", name: "Fulfillment", category: "fulfillment" as const, costPerMealCents: 50, confidence: "validated" as const },
    { id: "fee", name: "Payment fee", category: "payment-fee" as const, costPerMealCents: 35, confidence: "validated" as const },
    { id: "overhead", name: "Allocated overhead", category: "overhead" as const, costPerMealCents: 60, confidence: "validated" as const },
  ];
  const result = calculateMealCost(meals[0], "balanced", evidence, packaging, ops);
  assert.equal(result.status, "validated");
  assert.ok((result.trueMealCostCents ?? 0) > 0);
  assert.equal(result.trueMealCostCents, result.estimatedFullyLoadedCostCents);
});


test("keeps demo economics visibly separate from measured costing", () => {
  const evidence = meals[0].portions.lean.map((portion) => ({ componentId: portion.componentId, costPerCooked100gCents: 100, measuredYieldPercent: 90, confidence: "demo" as const, evidenceRunCount: 0 }));
  const packaging = [{ id: "tray", name: "Tray", costPerMealCents: 40, confidence: "demo" as const }];
  const ops = [
    { id: "waste", name: "Waste", category: "waste" as const, costPerMealCents: 0, confidence: "demo" as const },
    { id: "labor", name: "Labor", category: "direct-labor" as const, costPerMealCents: 100, confidence: "demo" as const },
    { id: "fulfillment", name: "Fulfillment", category: "fulfillment" as const, costPerMealCents: 0, confidence: "demo" as const },
    { id: "fee", name: "Payment fee", category: "payment-fee" as const, costPerMealCents: 0, confidence: "demo" as const },
    { id: "overhead", name: "Overhead", category: "overhead" as const, costPerMealCents: 50, confidence: "demo" as const },
  ];
  const result = calculateMealCost(meals[0], "lean", evidence, packaging, ops);
  assert.equal(result.status, "demo-estimate");
  assert.equal(result.trueMealCostCents, null);
});


test("rejects a validated label without consistency evidence", () => {
  const evidence = meals[0].portions.balanced.map((portion) => ({ componentId: portion.componentId, costPerCooked100gCents: 100, measuredYieldPercent: 90, confidence: "validated" as const, evidenceRunCount: 3 }));
  const packaging = [{ id: "tray", name: "Tray", costPerMealCents: 40, confidence: "validated" as const }];
  const ops = [
    { id: "waste", name: "Waste", category: "waste" as const, costPerMealCents: 20, confidence: "validated" as const },
    { id: "labor", name: "Labor", category: "direct-labor" as const, costPerMealCents: 125, confidence: "validated" as const },
    { id: "fulfillment", name: "Fulfillment", category: "fulfillment" as const, costPerMealCents: 50, confidence: "validated" as const },
    { id: "fee", name: "Fee", category: "payment-fee" as const, costPerMealCents: 35, confidence: "validated" as const },
    { id: "overhead", name: "Overhead", category: "overhead" as const, costPerMealCents: 60, confidence: "validated" as const },
  ];
  const result = calculateMealCost(meals[0], "balanced", evidence, packaging, ops);
  assert.equal(result.status, "blocked");
  assert.equal(result.trueMealCostCents, null);
  assert.ok(result.errors.some((error) => error.includes("3+ consistent runs")));
});


test("blocks zero labor from being called true cost", () => {
  const evidence = meals[0].portions.balanced.map((portion) => ({ componentId: portion.componentId, costPerCooked100gCents: 100, measuredYieldPercent: 90, confidence: "validated" as const, evidenceRunCount: 3, costSpreadPercent: 2, yieldSpreadPercent: 2 }));
  const packaging = [{ id: "tray", name: "Tray", costPerMealCents: 40, confidence: "validated" as const }];
  const ops = [
    { id: "waste", name: "Waste", category: "waste" as const, costPerMealCents: 20, confidence: "validated" as const },
    { id: "labor", name: "Labor", category: "direct-labor" as const, costPerMealCents: 0, confidence: "validated" as const },
    { id: "fulfillment", name: "Fulfillment", category: "fulfillment" as const, costPerMealCents: 0, confidence: "validated" as const },
    { id: "fee", name: "Fee", category: "payment-fee" as const, costPerMealCents: 0, confidence: "validated" as const },
    { id: "overhead", name: "Overhead", category: "overhead" as const, costPerMealCents: 60, confidence: "validated" as const },
  ];
  const result = calculateMealCost(meals[0], "balanced", evidence, packaging, ops);
  assert.equal(result.status, "blocked");
  assert.ok(result.errors.some((error) => error.includes("direct-labor")));
});
