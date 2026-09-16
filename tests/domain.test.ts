import assert from "node:assert/strict";
import test from "node:test";
import { calculateMealSnapshot, calculateWasteSummary } from "../lib/domain/calculations";
import { aggregateMealPrepDemand } from "../lib/domain/production";
import { eligibleMenuForIntake, recommendMealPlan } from "../lib/domain/recommendations";
import { evaluateCateringInquiry } from "../lib/domain/catering";
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
