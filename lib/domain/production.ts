import type { ComponentPortion, MealDefinition, MealPrepOrder, PortionSize, WeeklyMenuItem } from "./types";

export type ProductionDemand = {
  componentId: string;
  totalGrams: number;
};

export function aggregateMealPrepDemand(
  orders: MealPrepOrder[],
  weeklyMenu: WeeklyMenuItem[],
  meals: MealDefinition[],
): ProductionDemand[] {
  const menuById = new Map(weeklyMenu.map((item) => [item.id, item]));
  const mealById = new Map(meals.map((meal) => [meal.id, meal]));
  const totals = new Map<string, number>();

  const addPortions = (portions: ComponentPortion[], quantity: number, meal: MealDefinition, substitution?: string) => {
    for (const portion of portions) {
      const componentId = substitution && portion.componentId === meal.proteinComponentId ? substitution : portion.componentId;
      totals.set(componentId, (totals.get(componentId) ?? 0) + portion.grams * quantity);
    }
  };

  for (const order of orders) {
    if (!["locked", "in-production"].includes(order.status)) continue;

    for (const selection of order.selections) {
      const menuItem = menuById.get(selection.menuItemId);
      if (!menuItem) throw new Error(`Missing menu item: ${selection.menuItemId}`);
      const meal = mealById.get(menuItem.mealId);
      if (!meal) throw new Error(`Missing meal: ${menuItem.mealId}`);

      if (selection.proteinSubstitutionComponentId) {
        const allowed = meal.allowedProteinSubstitutions.some(
          (substitution) => substitution.componentId === selection.proteinSubstitutionComponentId,
        );
        if (!allowed) throw new Error(`Protein substitution is not allowed: ${selection.proteinSubstitutionComponentId}`);
      }

      addPortions(
        meal.portions[selection.portionSize as PortionSize],
        selection.quantity,
        meal,
        selection.proteinSubstitutionComponentId,
      );
    }
  }

  return [...totals.entries()]
    .map(([componentId, totalGrams]) => ({ componentId, totalGrams }))
    .sort((a, b) => b.totalGrams - a.totalGrams);
}
