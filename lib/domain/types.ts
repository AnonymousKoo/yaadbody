export type MoneyCents = number;
export type PortionSize = "lean" | "balanced" | "build";
export type MealCount = 5 | 10 | 14 | 20;
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
  mealCount: MealCount;
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

export type MealPrepOrderDraft = MealPrepOrder & {
  status: "draft";
  fulfillmentMethod: FulfillmentMethod;
  customerAllergenFilters: Allergen[];
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


export type CustomerGoal =
  | "fat-loss"
  | "healthy-eating"
  | "maintain"
  | "muscle"
  | "save-time";

export type FulfillmentMethod = "pickup" | "delivery";

export type CustomerMealIntake = {
  goal: CustomerGoal;
  desiredMealCount: MealCount;
  preferredCuisines: MealDefinition["cuisine"][];
  allergens: Allergen[];
  dislikedProteinComponentIds: string[];
  fulfillmentMethod: FulfillmentMethod;
};

export type CateringEventType =
  | "birthday"
  | "corporate"
  | "graduation"
  | "wedding"
  | "family-gathering"
  | "other";

export type CateringInquiry = {
  eventType: CateringEventType;
  eventDate: string;
  guestCount: number;
  serviceLevel: CateringServiceLevel;
  location: string;
  contactEmail: string;
  dietaryNotes: string;
};

export type RecipeBatchTest = {
  id: string;
  componentId: string;
  rawInputGrams: number;
  cookedOutputGrams: number;
  actualBatchCostCents: MoneyCents;
  notes?: string;
};


export type CostConfidence = "demo" | "measured-once" | "validated";
export type MassUnit = "g" | "kg" | "oz" | "lb";

export type IngredientPurchaseObservation = {
  ingredientId: string;
  packageQuantity: number;
  packageUnit: MassUnit;
  packagePriceCents: MoneyCents;
  usableYieldPercent: number;
  confidence: CostConfidence;
  sourceLabel?: string;
};

export type BatchIngredientUsage = {
  ingredientId: string;
  gramsUsed: number;
};

export type MeasuredBatchCostInput = {
  id: string;
  componentId: string;
  rawInputGrams: number;
  cookedOutputGrams: number;
  expectedYieldPercent: number;
  ingredientUsage: BatchIngredientUsage[];
  purchases: IngredientPurchaseObservation[];
};

export type ComponentCostEvidence = {
  componentId: string;
  costPerCooked100gCents: MoneyCents;
  measuredYieldPercent: number;
  confidence: CostConfidence;
  evidenceRunCount: number;
  costSpreadPercent?: number;
  yieldSpreadPercent?: number;
};

export type PackagingCostLine = {
  id: string;
  name: string;
  costPerMealCents: MoneyCents;
  confidence: CostConfidence;
};

export type OperatingCostCategory = "waste" | "direct-labor" | "fulfillment" | "payment-fee" | "overhead";

export type OperatingCostLine = {
  id: string;
  name: string;
  category: OperatingCostCategory;
  costPerMealCents: MoneyCents;
  confidence: CostConfidence;
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
