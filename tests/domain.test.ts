import assert from "node:assert/strict";
import test from "node:test";
import { calculateMealSnapshot, calculateWasteSummary } from "../lib/domain/calculations";
import { aggregateMealPrepDemand } from "../lib/domain/production";
import { eligibleMenuForIntake, recommendMealPlan } from "../lib/domain/recommendations";
import { evaluateCateringInquiry } from "../lib/domain/catering";
import { validateMealPrepOrderDraft } from "../lib/domain/orders";
import { summarizeRecipeBatchTest } from "../lib/domain/recipe-validation";
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
