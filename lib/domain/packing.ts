import type {
  Allergen,
  Component,
  Ingredient,
  MealDefinition,
  NutritionLabelEvidence,
  PackingBatchInput,
  MealPrepOrder,
  PackingTask,
  WeeklyMenuItem,
  RecipeCompositionEvidence,
  ShelfLifePolicy,
} from "./types";

const title = (value: string) => value.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function resolvedPortions(meal: MealDefinition, portionSize: PackingBatchInput["portionSize"], substitution?: string) {
  if (substitution && !meal.allowedProteinSubstitutions.some((item) => item.componentId === substitution)) {
    throw new Error(`Protein substitution is not allowed: ${substitution}`);
  }
  return meal.portions[portionSize].map((portion) => ({
    ...portion,
    componentId: substitution && portion.componentId === meal.proteinComponentId ? substitution : portion.componentId,
  }));
}

export function buildIngredientAndAllergenStatement(
  meal: MealDefinition,
  portionSize: PackingBatchInput["portionSize"],
  components: Component[],
  ingredients: Ingredient[],
  substitution?: string,
) {
  const componentById = new Map(components.map((item) => [item.id, item]));
  const ingredientById = new Map(ingredients.map((item) => [item.id, item]));
  const grams = new Map<string, number>();
  const allergens = new Set<Allergen>();
  const allergenSources = new Map<Allergen, Set<string>>();

  for (const portion of resolvedPortions(meal, portionSize, substitution)) {
    const component = componentById.get(portion.componentId);
    if (!component) throw new Error(`Missing component: ${portion.componentId}`);
    for (const line of component.ingredients) {
      const ingredient = ingredientById.get(line.ingredientId);
      if (!ingredient) throw new Error(`Missing ingredient: ${line.ingredientId}`);
      grams.set(ingredient.id, (grams.get(ingredient.id) ?? 0) + portion.grams * (line.gramsPer100gComponent / 100));
      for (const allergen of ingredient.allergens) {
        allergens.add(allergen);
        if (!allergenSources.has(allergen)) allergenSources.set(allergen, new Set());
        allergenSources.get(allergen)!.add(ingredient.name);
      }
    }
    component.allergens.forEach((allergen) => allergens.add(allergen));
  }

  const orderedIngredients = [...grams.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => ingredientById.get(id)!.name);
  const contains = [...allergens].sort().map((allergen) => {
    const sources = [...(allergenSources.get(allergen) ?? [])];
    if ((allergen === "fish" || allergen === "crustacean-shellfish" || allergen === "tree-nuts") && sources.length) {
      return `${title(allergen)} (${sources.join(", ")})`;
    }
    return title(allergen);
  });

  return {
    orderedIngredients,
    ingredientStatement: orderedIngredients.join(", "),
    allergens: [...allergens].sort(),
    containsStatement: contains.length ? `Contains: ${contains.join(", ")}` : null,
  };
}

export function generatePackingLabelRecords(
  input: PackingBatchInput,
  meals: MealDefinition[],
  components: Component[],
  ingredients: Ingredient[],
  nutritionEvidence: NutritionLabelEvidence | null,
  recipeEvidence: RecipeCompositionEvidence | null,
  shelfLife: ShelfLifePolicy | null,
) {
  const errors: string[] = [];
  const meal = meals.find((item) => item.id === input.mealId);
  if (!meal) errors.push(`Missing meal: ${input.mealId}`);
  if (!input.batchId.trim()) errors.push("Batch ID is required.");
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) errors.push("Packing quantity must be a positive whole number.");
  if (!validDate(input.packedOn)) errors.push("Packed-on date must be YYYY-MM-DD.");

  if (!nutritionEvidence || nutritionEvidence.mealId !== input.mealId || nutritionEvidence.portionSize !== input.portionSize) {
    errors.push("Matching full Nutrition Facts evidence is required.");
  } else if (nutritionEvidence.confidence !== "validated") {
    errors.push("Nutrition Facts evidence must be validated before production labeling.");
  } else if (!nutritionEvidence.evidenceSource?.trim()) {
    errors.push("Validated Nutrition Facts evidence requires a recorded source.");
  }
  if (nutritionEvidence) {
    const panelValues = Object.entries(nutritionEvidence.panel);
    for (const [field, value] of panelValues) {
      if (!Number.isFinite(value) || value < 0) errors.push(`Nutrition field ${field} must be a non-negative number.`);
    }
    if (nutritionEvidence.panel.servingSizeGrams <= 0) errors.push("Nutrition serving size must be greater than zero.");
  }
  if (!recipeEvidence || recipeEvidence.mealId !== input.mealId || recipeEvidence.portionSize !== input.portionSize) {
    errors.push("Matching recipe composition evidence is required.");
  } else if (recipeEvidence.confidence !== "validated" || recipeEvidence.evidenceRunCount < 3) {
    errors.push("Recipe composition requires validated evidence with 3+ runs.");
  } else if (!recipeEvidence.evidenceSource?.trim()) {
    errors.push("Validated recipe composition requires a recorded evidence source.");
  }
  if (!shelfLife) {
    errors.push("Shelf-life policy is required.");
  } else if (shelfLife.confidence !== "validated" || shelfLife.evidenceRunCount < 3 || !Number.isInteger(shelfLife.shelfLifeDays) || shelfLife.shelfLifeDays <= 0) {
    errors.push("Shelf-life policy requires a positive validated duration with 3+ evidence runs.");
  } else if (!shelfLife.evidenceSource?.trim()) {
    errors.push("Validated shelf-life policy requires a recorded evidence source.");
  }

  let statement: ReturnType<typeof buildIngredientAndAllergenStatement> | null = null;
  if (meal) {
    try {
      statement = buildIngredientAndAllergenStatement(meal, input.portionSize, components, ingredients, input.proteinSubstitutionComponentId);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unable to derive ingredient statement.");
    }
  }

  const status = errors.length ? "proof-only" as const : "operational-label-ready" as const;
  const useByDate = validDate(input.packedOn) && shelfLife?.shelfLifeDays ? addDays(input.packedOn, shelfLife.shelfLifeDays) : null;
  const records = meal && statement && input.quantity > 0
    ? Array.from({ length: Math.floor(input.quantity) }, (_, index) => ({
        id: `${input.batchId}-${String(index + 1).padStart(3, "0")}`,
        traceCode: `${input.batchId}-${String(index + 1).padStart(3, "0")}`,
        batchId: input.batchId,
        sequence: index + 1,
        mealName: meal.name,
        portionSize: input.portionSize,
        packedOn: input.packedOn,
        useByDate,
        storageText: shelfLife?.storage === "frozen" ? "Keep Frozen" : "Keep Refrigerated",
        ingredientStatement: statement.ingredientStatement,
        containsStatement: statement.containsStatement,
        allergens: statement.allergens,
        nutritionFacts: nutritionEvidence?.panel ?? null,
        advisoryAllergenStatement: null,
        operationalStatus: status,
        regulatoryStatus: "not-assessed" as const,
      }))
    : [];

  return { status, errors, records, regulatoryStatus: "not-assessed" as const };
}


export function buildPackingTasksFromOrders(
  orders: MealPrepOrder[],
  weeklyMenu: WeeklyMenuItem[],
  meals: MealDefinition[],
): PackingTask[] {
  const menuById = new Map(weeklyMenu.map((item) => [item.id, item]));
  const mealById = new Map(meals.map((meal) => [meal.id, meal]));
  const grouped = new Map<string, PackingTask & { sourceOrderIds: string[] }>();

  for (const order of orders) {
    if (!["locked", "in-production"].includes(order.status)) continue;
    for (const selection of order.selections) {
      const menuItem = menuById.get(selection.menuItemId);
      if (!menuItem) throw new Error(`Missing menu item: ${selection.menuItemId}`);
      const meal = mealById.get(menuItem.mealId);
      if (!meal) throw new Error(`Missing meal: ${menuItem.mealId}`);
      if (selection.proteinSubstitutionComponentId && !meal.allowedProteinSubstitutions.some((item) => item.componentId === selection.proteinSubstitutionComponentId)) {
        throw new Error(`Protein substitution is not allowed: ${selection.proteinSubstitutionComponentId}`);
      }
      const key = [meal.id, selection.portionSize, selection.proteinSubstitutionComponentId ?? "base"].join(":");
      const existing = grouped.get(key);
      if (existing) {
        existing.quantity += selection.quantity;
        if (!existing.sourceOrderIds.includes(order.id)) existing.sourceOrderIds.push(order.id);
      } else {
        grouped.set(key, {
          key,
          mealId: meal.id,
          mealName: meal.name,
          portionSize: selection.portionSize,
          quantity: selection.quantity,
          proteinSubstitutionComponentId: selection.proteinSubstitutionComponentId,
          sourceOrderIds: [order.id],
        });
      }
    }
  }
  return [...grouped.values()].sort((a, b) => a.mealName.localeCompare(b.mealName) || a.portionSize.localeCompare(b.portionSize));
}
