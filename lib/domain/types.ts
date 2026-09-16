export type MoneyCents = number;
export type PortionSize = "lean" | "balanced" | "build";
export type Allergen =
  | "milk"
  | "egg"
  | "fish"
  | "crustacean-shellfish"
  | "tree-nuts"
  | "peanuts"
  | "wheat"
  | "soy"
  | "sesame";

export type MacroProfile = {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sodiumMg?: number;
};

export type Ingredient = {
  id: string;
  name: string;
  allergens: Allergen[];
  purchaseUnit: "lb" | "oz" | "each" | "case" | "gallon";
  usableYieldPercent: number;
  estimatedCostPerUsableGramCents: number;
};

export type Component = {
  id: string;
  name: string;
  category: "protein" | "carb" | "vegetable" | "sauce" | "side";
  ingredients: Array<{
    ingredientId: string;
    gramsPer100gComponent: number;
  }>;
  nutritionPer100g: MacroProfile;
  allergens: Allergen[];
};

export type ComponentPortion = {
  componentId: string;
  grams: number;
};

export type MealDefinition = {
  id: string;
  name: string;
  description: string;
  cuisine: "jamaican" | "caribbean" | "american" | "mediterranean" | "latin" | "asian" | "other";
  core: boolean;
  portions: Record<PortionSize, ComponentPortion[]>;
  proteinComponentId: string;
  allowedProteinSubstitutions: Array<{
    componentId: string;
    surchargeCents: MoneyCents;
  }>;
};

export type WeeklyMenuItem = {
  id: string;
  mealId: string;
  weekOf: string;
  status: "draft" | "published" | "retired";
  slotsAvailable?: number;
};

export type MealPlan = {
  id: string;
  mealCount: 5 | 10 | 14 | 20;
  label: string;
};

export type MealSelection = {
  menuItemId: string;
  portionSize: PortionSize;
  quantity: number;
  proteinSubstitutionComponentId?: string;
};

export type MealPrepOrder = {
  id: string;
  status: "draft" | "locked" | "in-production" | "fulfilled" | "cancelled";
  planId: string;
  selections: MealSelection[];
};

export type CateringServiceLevel = "drop-off" | "buffet-setup" | "full-service";

export type CateringPackage = {
  id: string;
  name: string;
  description: string;
  minimumGuests: number;
  proteinChoices: number;
  sideChoices: number;
  serviceLevels: CateringServiceLevel[];
  pricingStatus: "draft-costing-required" | "active";
  startingPricePerGuestCents?: MoneyCents;
};

export type CateringEvent = {
  id: string;
  status: "inquiry" | "quoted" | "deposit-paid" | "confirmed" | "fulfilled" | "cancelled";
  guestCount: number;
  serviceLevel: CateringServiceLevel;
  packageId: string;
  selectedComponentIds: string[];
};

export type WasteReason =
  | "prep-loss"
  | "cooking-loss"
  | "overportioning"
  | "spoilage"
  | "production-overage"
  | "unsold-finished-meal"
  | "damaged-product"
  | "replacement"
  | "sample-or-comp"
  | "packaging-damage"
  | "inventory-variance";

export type WasteEntry = {
  id: string;
  reason: WasteReason;
  quantityGrams?: number;
  quantityEach?: number;
  estimatedCostCents: MoneyCents;
  avoidable: boolean;
};
