import type {
  CateringPackage,
  Component,
  Ingredient,
  MealDefinition,
  MealPlan,
  MealPrepOrder,
  WasteEntry,
  WeeklyMenuItem,
} from "../lib/domain/types";

export const ingredients: Ingredient[] = [
  { id: "chicken", name: "Chicken breast", allergens: [], purchaseUnit: "lb", usableYieldPercent: 94, estimatedCostPerUsableGramCents: 0.72 },
  { id: "shrimp", name: "Shrimp", allergens: ["crustacean-shellfish"], purchaseUnit: "lb", usableYieldPercent: 96, estimatedCostPerUsableGramCents: 1.58 },
  { id: "rice", name: "White rice", allergens: [], purchaseUnit: "lb", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.12 },
  { id: "peas", name: "Kidney beans", allergens: [], purchaseUnit: "lb", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.22 },
  { id: "cabbage", name: "Cabbage", allergens: [], purchaseUnit: "lb", usableYieldPercent: 88, estimatedCostPerUsableGramCents: 0.16 },
  { id: "carrot", name: "Carrot", allergens: [], purchaseUnit: "lb", usableYieldPercent: 90, estimatedCostPerUsableGramCents: 0.14 },
  { id: "jerk-seasoning", name: "Jerk seasoning", allergens: [], purchaseUnit: "oz", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 1.1 },
  { id: "oil", name: "Cooking oil", allergens: [], purchaseUnit: "gallon", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.3 },
];

export const components: Component[] = [
  {
    id: "jerk-chicken",
    name: "Jerk Chicken",
    category: "protein",
    ingredients: [
      { ingredientId: "chicken", gramsPer100gComponent: 94 },
      { ingredientId: "jerk-seasoning", gramsPer100gComponent: 4 },
      { ingredientId: "oil", gramsPer100gComponent: 2 },
    ],
    nutritionPer100g: { calories: 170, proteinGrams: 29, carbGrams: 2, fatGrams: 5, sodiumMg: 360 },
    allergens: [],
  },
  {
    id: "garlic-shrimp",
    name: "Garlic Shrimp",
    category: "protein",
    ingredients: [
      { ingredientId: "shrimp", gramsPer100gComponent: 97 },
      { ingredientId: "oil", gramsPer100gComponent: 3 },
    ],
    nutritionPer100g: { calories: 145, proteinGrams: 24, carbGrams: 1, fatGrams: 5, sodiumMg: 310 },
    allergens: ["crustacean-shellfish"],
  },
  {
    id: "rice-and-peas",
    name: "Rice & Peas",
    category: "carb",
    ingredients: [
      { ingredientId: "rice", gramsPer100gComponent: 82 },
      { ingredientId: "peas", gramsPer100gComponent: 18 },
    ],
    nutritionPer100g: { calories: 150, proteinGrams: 4, carbGrams: 31, fatGrams: 1, fiberGrams: 2 },
    allergens: [],
  },
  {
    id: "yaad-slaw",
    name: "Jamaican Slaw",
    category: "vegetable",
    ingredients: [
      { ingredientId: "cabbage", gramsPer100gComponent: 75 },
      { ingredientId: "carrot", gramsPer100gComponent: 25 },
    ],
    nutritionPer100g: { calories: 42, proteinGrams: 1.5, carbGrams: 9, fatGrams: 0.4, fiberGrams: 3 },
    allergens: [],
  },
];

export const meals: MealDefinition[] = [
  {
    id: "yaad-jerk-chicken",
    name: "Yaad Jerk Chicken",
    description: "Jerk chicken, rice & peas, and crisp Jamaican slaw.",
    cuisine: "jamaican",
    core: true,
    proteinComponentId: "jerk-chicken",
    allowedProteinSubstitutions: [{ componentId: "garlic-shrimp", surchargeCents: 250 }],
    portions: {
      lean: [
        { componentId: "jerk-chicken", grams: 140 },
        { componentId: "rice-and-peas", grams: 110 },
        { componentId: "yaad-slaw", grams: 110 },
      ],
      balanced: [
        { componentId: "jerk-chicken", grams: 170 },
        { componentId: "rice-and-peas", grams: 150 },
        { componentId: "yaad-slaw", grams: 110 },
      ],
      build: [
        { componentId: "jerk-chicken", grams: 210 },
        { componentId: "rice-and-peas", grams: 200 },
        { componentId: "yaad-slaw", grams: 120 },
      ],
    },
  },
];

export const plans: MealPlan[] = [
  { id: "plan-5", mealCount: 5, label: "5 meals" },
  { id: "plan-10", mealCount: 10, label: "10 meals" },
  { id: "plan-14", mealCount: 14, label: "14 meals" },
  { id: "plan-20", mealCount: 20, label: "20 meals" },
];

export const weeklyMenu: WeeklyMenuItem[] = [
  { id: "menu-jerk-1", mealId: "yaad-jerk-chicken", weekOf: "2026-09-14", status: "published" },
];

export const demoOrders: MealPrepOrder[] = [
  {
    id: "order-001",
    status: "locked",
    planId: "plan-5",
    selections: [
      { menuItemId: "menu-jerk-1", portionSize: "balanced", quantity: 3 },
      { menuItemId: "menu-jerk-1", portionSize: "build", quantity: 2, proteinSubstitutionComponentId: "garlic-shrimp" },
    ],
  },
];

export const cateringPackages: CateringPackage[] = [
  {
    id: "drop-off-signature",
    name: "Signature Drop-Off",
    description: "Package-first catering designed for leverage: cooked, packed, and delivered without on-site staffing.",
    minimumGuests: 20,
    proteinChoices: 2,
    sideChoices: 2,
    serviceLevels: ["drop-off", "buffet-setup"],
    pricingStatus: "draft-costing-required",
  },
];

export const wasteEntries: WasteEntry[] = [
  { id: "waste-1", reason: "prep-loss", quantityGrams: 900, estimatedCostCents: 325, avoidable: false },
  { id: "waste-2", reason: "production-overage", quantityEach: 3, estimatedCostCents: 1380, avoidable: true },
];
