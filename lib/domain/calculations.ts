import type {
  Component,
  ComponentPortion,
  Ingredient,
  MacroProfile,
  MealDefinition,
  MoneyCents,
  PortionSize,
  WasteEntry,
} from "./types";

const round = (value: number, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

export function scaleMacros(macros: MacroProfile, grams: number): MacroProfile {
  const factor = grams / 100;
  return {
    calories: Math.round(macros.calories * factor),
    proteinGrams: round(macros.proteinGrams * factor),
    carbGrams: round(macros.carbGrams * factor),
    fatGrams: round(macros.fatGrams * factor),
    fiberGrams: macros.fiberGrams === undefined ? undefined : round(macros.fiberGrams * factor),
    sodiumMg: macros.sodiumMg === undefined ? undefined : Math.round(macros.sodiumMg * factor),
  };
}

export function addMacros(profiles: MacroProfile[]): MacroProfile {
  return profiles.reduce<MacroProfile>(
    (total, profile) => ({
      calories: total.calories + profile.calories,
      proteinGrams: round(total.proteinGrams + profile.proteinGrams),
      carbGrams: round(total.carbGrams + profile.carbGrams),
      fatGrams: round(total.fatGrams + profile.fatGrams),
      fiberGrams: round((total.fiberGrams ?? 0) + (profile.fiberGrams ?? 0)),
      sodiumMg: Math.round((total.sodiumMg ?? 0) + (profile.sodiumMg ?? 0)),
    }),
    { calories: 0, proteinGrams: 0, carbGrams: 0, fatGrams: 0, fiberGrams: 0, sodiumMg: 0 },
  );
}

export function estimateComponentCostCents(
  component: Component,
  ingredients: Ingredient[],
  grams: number,
): MoneyCents {
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const factor = grams / 100;

  return Math.round(
    component.ingredients.reduce((sum, line) => {
      const ingredient = ingredientById.get(line.ingredientId);
      if (!ingredient) {
        throw new Error(`Missing ingredient: ${line.ingredientId}`);
      }
      const ingredientGrams = line.gramsPer100gComponent * factor;
      return sum + ingredientGrams * ingredient.estimatedCostPerUsableGramCents;
    }, 0),
  );
}

export function calculateMealSnapshot(
  meal: MealDefinition,
  portionSize: PortionSize,
  components: Component[],
  ingredients: Ingredient[],
  proteinSubstitutionComponentId?: string,
) {
  const componentById = new Map(components.map((component) => [component.id, component]));
  const basePortions = meal.portions[portionSize];
  const substitution = proteinSubstitutionComponentId
    ? meal.allowedProteinSubstitutions.find((item) => item.componentId === proteinSubstitutionComponentId)
    : undefined;

  if (proteinSubstitutionComponentId && !substitution) {
    throw new Error(`Protein substitution is not allowed: ${proteinSubstitutionComponentId}`);
  }

  const portions: ComponentPortion[] = basePortions.map((portion) => {
    if (!proteinSubstitutionComponentId || portion.componentId !== meal.proteinComponentId) {
      return portion;
    }
    return { ...portion, componentId: proteinSubstitutionComponentId };
  });

  const resolved = portions.map((portion) => {
    const component = componentById.get(portion.componentId);
    if (!component) {
      throw new Error(`Missing component: ${portion.componentId}`);
    }
    return {
      ...portion,
      name: component.name,
      category: component.category,
      macros: scaleMacros(component.nutritionPer100g, portion.grams),
      estimatedFoodCostCents: estimateComponentCostCents(component, ingredients, portion.grams),
      allergens: component.allergens,
    };
  });

  return {
    mealId: meal.id,
    portionSize,
    components: resolved,
    macros: addMacros(resolved.map((item) => item.macros)),
    estimatedFoodCostCents:
      resolved.reduce((sum, item) => sum + item.estimatedFoodCostCents, 0) + (substitution?.surchargeCents ?? 0),
    allergens: [...new Set(resolved.flatMap((item) => item.allergens))],
    substitutionSurchargeCents: substitution?.surchargeCents ?? 0,
  };
}

export function calculateWasteSummary(entries: WasteEntry[], foodSpendCents: MoneyCents) {
  const totalWasteCents = entries.reduce((sum, entry) => sum + entry.estimatedCostCents, 0);
  const avoidableWasteCents = entries
    .filter((entry) => entry.avoidable)
    .reduce((sum, entry) => sum + entry.estimatedCostCents, 0);

  return {
    totalWasteCents,
    avoidableWasteCents,
    wasteRatePercent: foodSpendCents <= 0 ? 0 : round((totalWasteCents / foodSpendCents) * 100),
  };
}
