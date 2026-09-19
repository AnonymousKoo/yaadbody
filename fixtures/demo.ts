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

// Demo-only operating data. Replace nutrition, yield, and cost assumptions with
// validated YaadBody recipe tests before using this data for production labels,
// customer billing, purchasing, or margin decisions.
export const ingredients: Ingredient[] = [
  { id: "chicken", name: "Chicken breast", allergens: [], purchaseUnit: "lb", usableYieldPercent: 94, estimatedCostPerUsableGramCents: 0.72 },
  { id: "shrimp", name: "Shrimp", allergens: ["crustacean-shellfish"], purchaseUnit: "lb", usableYieldPercent: 96, estimatedCostPerUsableGramCents: 1.58 },
  { id: "beef-90-10", name: "90/10 ground beef", allergens: [], purchaseUnit: "lb", usableYieldPercent: 92, estimatedCostPerUsableGramCents: 0.95 },
  { id: "cod", name: "Cod", allergens: ["fish"], purchaseUnit: "lb", usableYieldPercent: 96, estimatedCostPerUsableGramCents: 1.7 },
  { id: "rice", name: "White rice", allergens: [], purchaseUnit: "lb", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.12 },
  { id: "peas", name: "Kidney beans", allergens: [], purchaseUnit: "lb", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.22 },
  { id: "sweet-potato", name: "Sweet potato", allergens: [], purchaseUnit: "lb", usableYieldPercent: 90, estimatedCostPerUsableGramCents: 0.18 },
  { id: "cabbage", name: "Cabbage", allergens: [], purchaseUnit: "lb", usableYieldPercent: 88, estimatedCostPerUsableGramCents: 0.16 },
  { id: "carrot", name: "Carrot", allergens: [], purchaseUnit: "lb", usableYieldPercent: 90, estimatedCostPerUsableGramCents: 0.14 },
  { id: "broccoli", name: "Broccoli", allergens: [], purchaseUnit: "lb", usableYieldPercent: 85, estimatedCostPerUsableGramCents: 0.28 },
  { id: "pepper-onion", name: "Pepper & onion mix", allergens: [], purchaseUnit: "lb", usableYieldPercent: 90, estimatedCostPerUsableGramCents: 0.26 },
  { id: "jerk-seasoning", name: "Jerk seasoning", allergens: [], purchaseUnit: "oz", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 1.1 },
  { id: "curry-seasoning", name: "Curry seasoning", allergens: [], purchaseUnit: "oz", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.9 },
  { id: "escovitch-seasoning", name: "Escovitch seasoning", allergens: [], purchaseUnit: "oz", usableYieldPercent: 100, estimatedCostPerUsableGramCents: 0.85 },
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
    id: "curry-chicken",
    name: "Curry Chicken",
    category: "protein",
    ingredients: [
      { ingredientId: "chicken", gramsPer100gComponent: 93 },
      { ingredientId: "curry-seasoning", gramsPer100gComponent: 5 },
      { ingredientId: "oil", gramsPer100gComponent: 2 },
    ],
    nutritionPer100g: { calories: 168, proteinGrams: 28, carbGrams: 3, fatGrams: 5, sodiumMg: 330 },
    allergens: [],
  },
  {
    id: "garlic-shrimp",
    name: "Garlic Herb Shrimp",
    category: "protein",
    ingredients: [
      { ingredientId: "shrimp", gramsPer100gComponent: 97 },
      { ingredientId: "oil", gramsPer100gComponent: 3 },
    ],
    nutritionPer100g: { calories: 145, proteinGrams: 24, carbGrams: 1, fatGrams: 5, sodiumMg: 310 },
    allergens: ["crustacean-shellfish"],
  },
  {
    id: "lean-meatballs",
    name: "Lean Beef Meatballs",
    category: "protein",
    ingredients: [{ ingredientId: "beef-90-10", gramsPer100gComponent: 100 }],
    nutritionPer100g: { calories: 205, proteinGrams: 26, carbGrams: 2, fatGrams: 10, sodiumMg: 250 },
    allergens: [],
  },
  {
    id: "escovitch-cod",
    name: "Escovitch Cod",
    category: "protein",
    ingredients: [
      { ingredientId: "cod", gramsPer100gComponent: 94 },
      { ingredientId: "escovitch-seasoning", gramsPer100gComponent: 4 },
      { ingredientId: "oil", gramsPer100gComponent: 2 },
    ],
    nutritionPer100g: { calories: 135, proteinGrams: 25, carbGrams: 2, fatGrams: 3, sodiumMg: 280 },
    allergens: ["fish"],
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
    id: "white-rice",
    name: "White Rice",
    category: "carb",
    ingredients: [{ ingredientId: "rice", gramsPer100gComponent: 100 }],
    nutritionPer100g: { calories: 130, proteinGrams: 2.7, carbGrams: 28, fatGrams: 0.3 },
    allergens: [],
  },
  {
    id: "sweet-potato",
    name: "Roasted Sweet Potato",
    category: "carb",
    ingredients: [
      { ingredientId: "sweet-potato", gramsPer100gComponent: 98 },
      { ingredientId: "oil", gramsPer100gComponent: 2 },
    ],
    nutritionPer100g: { calories: 105, proteinGrams: 2, carbGrams: 22, fatGrams: 1.5, fiberGrams: 3 },
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
  {
    id: "steamed-veg",
    name: "Steamed Vegetables",
    category: "vegetable",
    ingredients: [
      { ingredientId: "broccoli", gramsPer100gComponent: 70 },
      { ingredientId: "carrot", gramsPer100gComponent: 30 },
    ],
    nutritionPer100g: { calories: 39, proteinGrams: 2.6, carbGrams: 7, fatGrams: 0.4, fiberGrams: 3.2 },
    allergens: [],
  },
  {
    id: "escovitch-veg",
    name: "Escovitch Peppers & Onions",
    category: "vegetable",
    ingredients: [{ ingredientId: "pepper-onion", gramsPer100gComponent: 100 }],
    nutritionPer100g: { calories: 36, proteinGrams: 1, carbGrams: 8, fatGrams: 0.2, fiberGrams: 2 },
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
      lean: [{ componentId: "jerk-chicken", grams: 140 }, { componentId: "rice-and-peas", grams: 110 }, { componentId: "yaad-slaw", grams: 110 }],
      balanced: [{ componentId: "jerk-chicken", grams: 170 }, { componentId: "rice-and-peas", grams: 150 }, { componentId: "yaad-slaw", grams: 110 }],
      build: [{ componentId: "jerk-chicken", grams: 210 }, { componentId: "rice-and-peas", grams: 200 }, { componentId: "yaad-slaw", grams: 120 }],
    },
  },
  {
    id: "island-curry-chicken",
    name: "Island Curry Chicken",
    description: "Curry chicken with white rice and steamed vegetables.",
    cuisine: "jamaican",
    core: true,
    proteinComponentId: "curry-chicken",
    allowedProteinSubstitutions: [{ componentId: "jerk-chicken", surchargeCents: 0 }],
    portions: {
      lean: [{ componentId: "curry-chicken", grams: 140 }, { componentId: "white-rice", grams: 105 }, { componentId: "steamed-veg", grams: 130 }],
      balanced: [{ componentId: "curry-chicken", grams: 170 }, { componentId: "white-rice", grams: 150 }, { componentId: "steamed-veg", grams: 130 }],
      build: [{ componentId: "curry-chicken", grams: 210 }, { componentId: "white-rice", grams: 200 }, { componentId: "steamed-veg", grams: 140 }],
    },
  },
  {
    id: "garlic-shrimp-bowl",
    name: "Garlic Herb Shrimp Bowl",
    description: "Garlic herb shrimp with white rice and steamed vegetables.",
    cuisine: "other",
    core: false,
    proteinComponentId: "garlic-shrimp",
    allowedProteinSubstitutions: [{ componentId: "jerk-chicken", surchargeCents: -150 }],
    portions: {
      lean: [{ componentId: "garlic-shrimp", grams: 135 }, { componentId: "white-rice", grams: 105 }, { componentId: "steamed-veg", grams: 130 }],
      balanced: [{ componentId: "garlic-shrimp", grams: 165 }, { componentId: "white-rice", grams: 150 }, { componentId: "steamed-veg", grams: 130 }],
      build: [{ componentId: "garlic-shrimp", grams: 205 }, { componentId: "white-rice", grams: 200 }, { componentId: "steamed-veg", grams: 140 }],
    },
  },
  {
    id: "beef-sweet-potato",
    name: "Lean Meatballs & Sweet Potato",
    description: "Lean beef meatballs with roasted sweet potato and steamed vegetables.",
    cuisine: "american",
    core: false,
    proteinComponentId: "lean-meatballs",
    allowedProteinSubstitutions: [],
    portions: {
      lean: [{ componentId: "lean-meatballs", grams: 135 }, { componentId: "sweet-potato", grams: 120 }, { componentId: "steamed-veg", grams: 130 }],
      balanced: [{ componentId: "lean-meatballs", grams: 165 }, { componentId: "sweet-potato", grams: 165 }, { componentId: "steamed-veg", grams: 130 }],
      build: [{ componentId: "lean-meatballs", grams: 205 }, { componentId: "sweet-potato", grams: 215 }, { componentId: "steamed-veg", grams: 140 }],
    },
  },
  {
    id: "escovitch-cod-plate",
    name: "Escovitch Cod Plate",
    description: "Baked cod with escovitch peppers, rice & peas, and Jamaican slaw.",
    cuisine: "jamaican",
    core: false,
    proteinComponentId: "escovitch-cod",
    allowedProteinSubstitutions: [],
    portions: {
      lean: [{ componentId: "escovitch-cod", grams: 140 }, { componentId: "rice-and-peas", grams: 105 }, { componentId: "escovitch-veg", grams: 100 }],
      balanced: [{ componentId: "escovitch-cod", grams: 170 }, { componentId: "rice-and-peas", grams: 150 }, { componentId: "escovitch-veg", grams: 110 }],
      build: [{ componentId: "escovitch-cod", grams: 210 }, { componentId: "rice-and-peas", grams: 200 }, { componentId: "escovitch-veg", grams: 120 }],
    },
  },
];

export const plans: MealPlan[] = [
  { id: "plan-5", mealCount: 5, label: "5 meals" },
  { id: "plan-10", mealCount: 10, label: "10 meals" },
  { id: "plan-14", mealCount: 14, label: "14 meals" },
  { id: "plan-20", mealCount: 20, label: "20 meals" },
];

export const weeklyMenu: WeeklyMenuItem[] = meals.map((meal, index) => ({
  id: `menu-${index + 1}`,
  mealId: meal.id,
  weekOf: "2026-09-14",
  status: "published",
}));

export const demoOrders: MealPrepOrder[] = [
  {
    id: "order-001",
    status: "locked",
    planId: "plan-10",
    fulfillmentMethod: "pickup",
    selections: [
      { menuItemId: "menu-1", portionSize: "balanced", quantity: 4 },
      { menuItemId: "menu-2", portionSize: "balanced", quantity: 3 },
      { menuItemId: "menu-3", portionSize: "build", quantity: 2 },
      { menuItemId: "menu-1", portionSize: "build", quantity: 1, proteinSubstitutionComponentId: "garlic-shrimp" },
    ],
  },
  {
    id: "order-002",
    status: "locked",
    planId: "plan-5",
    fulfillmentMethod: "delivery",
    selections: [
      { menuItemId: "menu-4", portionSize: "lean", quantity: 2 },
      { menuItemId: "menu-5", portionSize: "balanced", quantity: 2 },
      { menuItemId: "menu-2", portionSize: "lean", quantity: 1 },
    ],
  },
];

export const cateringPackages: CateringPackage[] = [
  {
    id: "drop-off-signature",
    name: "Signature Drop-Off",
    description: "A simple, full-flavor catering option prepared, packed, and delivered for your event.",
    minimumGuests: 20,
    proteinChoices: 2,
    sideChoices: 2,
    serviceLevels: ["drop-off", "buffet-setup"],
    pricingStatus: "draft-costing-required",
  },
  {
    id: "full-service",
    name: "Full Service",
    description: "Food, setup, event staff, service, and breakdown for events that need on-site support.",
    minimumGuests: 30,
    proteinChoices: 2,
    sideChoices: 3,
    serviceLevels: ["full-service"],
    pricingStatus: "draft-costing-required",
  },
];

export const wasteEntries: WasteEntry[] = [
  { id: "waste-1", reason: "prep-loss", quantityGrams: 900, estimatedCostCents: 325, avoidable: false },
  { id: "waste-2", reason: "production-overage", quantityEach: 3, estimatedCostCents: 1380, avoidable: true },
];
