import { calculateMealSnapshot } from "./calculations";
import type {
  Component,
  CustomerMealIntake,
  Ingredient,
  MealDefinition,
  MealPlan,
  PortionSize,
  WeeklyMenuItem,
} from "./types";

export function portionForGoal(goal: CustomerMealIntake["goal"]): PortionSize {
  if (goal === "fat-loss") return "lean";
  if (goal === "muscle") return "build";
  return "balanced";
}

export function recommendMealPlan(intake: CustomerMealIntake, plans: MealPlan[]) {
  const plan = plans.find((item) => item.mealCount === intake.desiredMealCount);
  if (!plan) throw new Error(`No meal plan for ${intake.desiredMealCount} meals`);

  const portionSize = portionForGoal(intake.goal);
  const reasonByGoal: Record<CustomerMealIntake["goal"], string> = {
    "fat-loss": "A lighter standardized portion supports your stated fat-loss goal without custom cooking.",
    "healthy-eating": "Balanced portions are the default for consistent healthy eating.",
    maintain: "Balanced portions are the default for maintaining a steady weekly routine.",
    muscle: "Build portions add more standardized protein and carbohydrate for higher fuel needs.",
    "save-time": "Balanced portions keep the recommendation simple while your selected meal count handles the convenience goal.",
  };

  return { plan, portionSize, reason: reasonByGoal[intake.goal] };
}

export function eligibleMenuForIntake(
  intake: CustomerMealIntake,
  weeklyMenu: WeeklyMenuItem[],
  meals: MealDefinition[],
  components: Component[],
  ingredients: Ingredient[],
) {
  const mealById = new Map(meals.map((meal) => [meal.id, meal]));
  const portionSize = portionForGoal(intake.goal);

  return weeklyMenu
    .filter((item) => item.status === "published")
    .map((item) => {
      const meal = mealById.get(item.mealId);
      if (!meal) throw new Error(`Missing meal: ${item.mealId}`);
      const snapshot = calculateMealSnapshot(meal, portionSize, components, ingredients);
      const hasListedAllergen = snapshot.allergens.some((allergen) => intake.allergens.includes(allergen));
      const dislikedProtein = intake.dislikedProteinComponentIds.includes(meal.proteinComponentId);
      const cuisineMatch = intake.preferredCuisines.length === 0 || intake.preferredCuisines.includes(meal.cuisine);
      return { item, meal, snapshot, eligible: !hasListedAllergen && !dislikedProtein, cuisineMatch };
    })
    .filter((entry) => entry.eligible)
    .sort((a, b) => Number(b.cuisineMatch) - Number(a.cuisineMatch) || Number(b.meal.core) - Number(a.meal.core));
}
