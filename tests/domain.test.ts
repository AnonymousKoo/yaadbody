import assert from "node:assert/strict";
import test from "node:test";
import { calculateMealSnapshot, calculateWasteSummary } from "../lib/domain/calculations";
import { aggregateMealPrepDemand } from "../lib/domain/production";
import { components, demoOrders, ingredients, meals, wasteEntries, weeklyMenu } from "../fixtures/demo";

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
