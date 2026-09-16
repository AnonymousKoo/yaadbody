import assert from "node:assert/strict";
import test from "node:test";
import { calculateMealSnapshot, calculateWasteSummary } from "../lib/domain/calculations";
import { aggregateMealPrepDemand } from "../lib/domain/production";
import { eligibleMenuForIntake, recommendMealPlan } from "../lib/domain/recommendations";
import { evaluateCateringInquiry } from "../lib/domain/catering";
import { validateMealPrepOrderDraft } from "../lib/domain/orders";
import { summarizeRecipeBatchTest } from "../lib/domain/recipe-validation";
import { calculatePriceForTargetMargin, calculateUnitMarginPercent, evaluateMealPricing } from "../lib/domain/pricing";
import { compareSupplierOffers, evaluateSupplierOffer } from "../lib/domain/procurement";
import { calculateIngredientPurchaseRequirements } from "../lib/domain/purchasing";
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


test("calculates a price floor from fully loaded cost and target margin", () => {
  assert.equal(calculatePriceForTargetMargin(800, 20), 1000);
  assert.equal(calculateUnitMarginPercent(1000, 800), 20);
});

test("rounds a validated price floor up to a sellable increment", () => {
  const result = evaluateMealPricing({ costCents: 835, costStatus: "validated", targetMarginPercent: 25, roundingIncrementCents: 50 });
  assert.equal(result.status, "validated-price-floor");
  assert.equal(result.minimumPriceCents, 1114);
  assert.equal(result.recommendedPriceCents, 1150);
  assert.equal(result.canFinalize, true);
  assert.ok((result.achievedMarginPercent ?? 0) >= 25);
});

test("keeps pricing as planning-only when meal cost is not validated", () => {
  const result = evaluateMealPricing({ costCents: 700, costStatus: "measured-estimate", targetMarginPercent: 25, candidatePriceCents: 1200 });
  assert.equal(result.status, "planning-estimate");
  assert.equal(result.canFinalize, false);
  assert.equal(result.candidateMarginPercent, 41.7);
});

test("blocks pricing when the cost basis is blocked", () => {
  const result = evaluateMealPricing({ costCents: null, costStatus: "blocked", targetMarginPercent: 25 });
  assert.equal(result.status, "blocked");
  assert.equal(result.recommendedPriceCents, null);
  assert.ok(result.errors.some((error) => error.includes("cost basis")));
});


test("normalizes supplier offers to landed usable cost", () => {
  const result = evaluateSupplierOffer({ id: "a", supplierName: "Supplier A", ingredientId: "chicken", packageQuantity: 10, packageUnit: "lb", packagePriceCents: 3000, allocatedDeliveryCostCents: 200, usableYieldPercent: 80, qualityStatus: "approved", availability: "in-stock", confidence: "measured-once" }, 3000);
  assert.equal(result.eligible, true);
  assert.ok(result.landedCostPerUsableGramCents > 0);
  assert.ok(result.usableGramsPerPackage < result.purchasedGramsPerPackage);
  assert.equal(result.packagesRequired, 1);
});

test("excludes a cheaper supplier that fails the quality gate", () => {
  const offers = [
    { id: "cheap", supplierName: "Cheap", ingredientId: "chicken", packageQuantity: 5, packageUnit: "lb" as const, packagePriceCents: 900, allocatedDeliveryCostCents: 0, usableYieldPercent: 95, qualityStatus: "rejected" as const, availability: "in-stock" as const, confidence: "validated" as const },
    { id: "approved", supplierName: "Approved", ingredientId: "chicken", packageQuantity: 5, packageUnit: "lb" as const, packagePriceCents: 1500, allocatedDeliveryCostCents: 0, usableYieldPercent: 95, qualityStatus: "approved" as const, availability: "in-stock" as const, confidence: "validated" as const },
  ];
  const result = compareSupplierOffers(offers, "chicken", 1500);
  assert.equal(result.lowestCostEligibleOffer?.offerId, "approved");
  assert.equal(result.evaluated.find((offer) => offer.offerId === "cheap")?.eligible, false);
});

test("usable yield can make the higher sticker price the lower effective cost", () => {
  const offers = [
    { id: "low-sticker", supplierName: "Low Sticker", ingredientId: "chicken", packageQuantity: 5, packageUnit: "lb" as const, packagePriceCents: 1300, allocatedDeliveryCostCents: 0, usableYieldPercent: 60, qualityStatus: "approved" as const, availability: "in-stock" as const, confidence: "measured-once" as const },
    { id: "better-yield", supplierName: "Better Yield", ingredientId: "chicken", packageQuantity: 5, packageUnit: "lb" as const, packagePriceCents: 1600, allocatedDeliveryCostCents: 0, usableYieldPercent: 95, qualityStatus: "approved" as const, availability: "in-stock" as const, confidence: "measured-once" as const },
  ];
  const result = compareSupplierOffers(offers, "chicken");
  assert.equal(result.lowestCostEligibleOffer?.offerId, "better-yield");
});

test("supplier comparison includes package rounding for required demand", () => {
  const offers = [
    { id: "small", supplierName: "Small Packs", ingredientId: "chicken", packageQuantity: 2, packageUnit: "lb" as const, packagePriceCents: 700, allocatedDeliveryCostCents: 0, usableYieldPercent: 100, qualityStatus: "approved" as const, availability: "in-stock" as const, confidence: "validated" as const },
    { id: "bulk", supplierName: "Bulk", ingredientId: "chicken", packageQuantity: 10, packageUnit: "lb" as const, packagePriceCents: 3000, allocatedDeliveryCostCents: 0, usableYieldPercent: 100, qualityStatus: "approved" as const, availability: "in-stock" as const, confidence: "validated" as const },
  ];
  const result = compareSupplierOffers(offers, "chicken", 3000);
  assert.equal(result.lowestCostEligibleOffer?.offerId, "small");
  const small = result.evaluated.find((offer) => offer.offerId === "small");
  assert.equal(small?.packagesRequired, 4);
  assert.equal(small?.projectedSpendCents, 2800);
  assert.ok((small?.projectedOverageGrams ?? 0) > 0);
  assert.equal(result.status, "validated-comparison");
});


test("converts cooked component demand back to raw ingredient demand using measured yield", () => {
  const result = calculateIngredientPurchaseRequirements(
    [{ componentId: "jerk-chicken", totalGrams: 760 }],
    components,
    [{ componentId: "jerk-chicken", costPerCooked100gCents: 125, measuredYieldPercent: 76, confidence: "validated", evidenceRunCount: 3, costSpreadPercent: 2, yieldSpreadPercent: 2 }],
    [
      { ingredientId: "chicken", usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "validated" },
      { ingredientId: "jerk-seasoning", usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "validated" },
      { ingredientId: "oil", usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "validated" },
    ],
  );
  const chicken = result.requirements.find((item) => item.ingredientId === "chicken");
  assert.equal(result.status, "validated-requirement");
  assert.equal(chicken?.grossRequiredGrams, 940);
});

test("subtracts usable inventory while preserving reservations and safety stock", () => {
  const result = calculateIngredientPurchaseRequirements(
    [{ componentId: "jerk-chicken", totalGrams: 760 }],
    components,
    [{ componentId: "jerk-chicken", costPerCooked100gCents: 125, measuredYieldPercent: 76, confidence: "validated", evidenceRunCount: 3, costSpreadPercent: 2, yieldSpreadPercent: 2 }],
    [
      { ingredientId: "chicken", usableOnHandGrams: 700, reservedGrams: 100, safetyStockGrams: 200, confidence: "validated" },
      { ingredientId: "jerk-seasoning", usableOnHandGrams: 40, reservedGrams: 0, safetyStockGrams: 10, confidence: "validated" },
      { ingredientId: "oil", usableOnHandGrams: 20, reservedGrams: 0, safetyStockGrams: 5, confidence: "validated" },
    ],
  );
  const chicken = result.requirements.find((item) => item.ingredientId === "chicken");
  assert.equal(chicken?.usableAvailableGrams, 600);
  assert.equal(chicken?.netToBuyGrams, 540);
});

test("blocks exact purchasing requirements when measured yield evidence is missing", () => {
  const result = calculateIngredientPurchaseRequirements([{ componentId: "jerk-chicken", totalGrams: 760 }], components, [], []);
  assert.equal(result.status, "blocked");
  assert.ok(result.errors.some((error) => error.includes("yield evidence")));
});

test("blocks exact purchasing requirements when inventory evidence is missing", () => {
  const result = calculateIngredientPurchaseRequirements(
    [{ componentId: "jerk-chicken", totalGrams: 760 }],
    components,
    [{ componentId: "jerk-chicken", costPerCooked100gCents: 125, measuredYieldPercent: 76, confidence: "validated", evidenceRunCount: 3, costSpreadPercent: 2, yieldSpreadPercent: 2 }],
    [],
  );
  assert.equal(result.status, "blocked");
  assert.ok(result.errors.some((error) => error.includes("inventory position")));
});


test("rejects validated purchasing yield without repeat-run evidence", () => {
  const result = calculateIngredientPurchaseRequirements(
    [{ componentId: "jerk-chicken", totalGrams: 760 }],
    components,
    [{ componentId: "jerk-chicken", costPerCooked100gCents: 125, measuredYieldPercent: 76, confidence: "validated", evidenceRunCount: 1 }],
    [
      { ingredientId: "chicken", usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "validated" },
      { ingredientId: "jerk-seasoning", usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "validated" },
      { ingredientId: "oil", usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "validated" },
    ],
  );
  assert.equal(result.status, "blocked");
  assert.ok(result.errors.some((error) => error.includes("3+ consistent runs")));
});
