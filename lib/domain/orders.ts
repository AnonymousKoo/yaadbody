import type { MealPlan, MealPrepOrderDraft, WeeklyMenuItem } from "./types";

export function validateMealPrepOrderDraft(
  draft: MealPrepOrderDraft,
  plans: MealPlan[],
  weeklyMenu: WeeklyMenuItem[],
) {
  const errors: string[] = [];
  const plan = plans.find((item) => item.id === draft.planId);
  if (!plan) errors.push("Meal plan does not exist.");

  const menuById = new Map(weeklyMenu.map((item) => [item.id, item]));
  let selectedCount = 0;

  for (const selection of draft.selections) {
    if (!Number.isInteger(selection.quantity) || selection.quantity <= 0) {
      errors.push(`Invalid quantity for ${selection.menuItemId}.`);
      continue;
    }
    selectedCount += selection.quantity;
    const menuItem = menuById.get(selection.menuItemId);
    if (!menuItem || menuItem.status !== "published") {
      errors.push(`Menu item is not currently orderable: ${selection.menuItemId}.`);
    }
  }

  if (plan && selectedCount !== plan.mealCount) {
    errors.push(`Plan requires exactly ${plan.mealCount} meals; received ${selectedCount}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    selectedCount,
    fulfillmentMethod: draft.fulfillmentMethod,
  };
}
