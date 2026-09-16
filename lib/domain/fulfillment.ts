import type { FulfillmentManifest, MealDefinition, MealPrepOrder, PackedMealLabelRecord, WeeklyMenuItem } from "./types";

const selectionKey = (mealId: string, portionSize: string, substitution?: string) =>
  [mealId, portionSize, substitution ?? "base"].join(":");

export function buildFulfillmentManifests(
  orders: MealPrepOrder[],
  weeklyMenu: WeeklyMenuItem[],
  meals: MealDefinition[],
  packedUnits: PackedMealLabelRecord[],
) {
  const errors: string[] = [];
  const menuById = new Map(weeklyMenu.map((item) => [item.id, item]));
  const mealById = new Map(meals.map((item) => [item.id, item]));
  const availableByKey = new Map<string, PackedMealLabelRecord[]>();

  for (const unit of packedUnits) {
    const key = selectionKey(unit.mealId, unit.portionSize, unit.proteinSubstitutionComponentId);
    if (!availableByKey.has(key)) availableByKey.set(key, []);
    availableByKey.get(key)!.push(unit);
    if (unit.operationalStatus !== "operational-label-ready") errors.push(`Packed unit is not operational-label-ready: ${unit.traceCode}`);
  }
  for (const units of availableByKey.values()) units.sort((a, b) => a.traceCode.localeCompare(b.traceCode));

  const manifests: FulfillmentManifest[] = [];
  const assigned = new Set<string>();
  for (const order of orders) {
    if (!["locked", "in-production"].includes(order.status)) continue;
    if (!order.fulfillmentMethod) {
      errors.push(`Order is missing fulfillment method: ${order.id}`);
      continue;
    }
    const traceCodes: string[] = [];
    for (const selection of order.selections) {
      const menuItem = menuById.get(selection.menuItemId);
      if (!menuItem) { errors.push(`Missing menu item: ${selection.menuItemId}`); continue; }
      const meal = mealById.get(menuItem.mealId);
      if (!meal) { errors.push(`Missing meal: ${menuItem.mealId}`); continue; }
      const key = selectionKey(meal.id, selection.portionSize, selection.proteinSubstitutionComponentId);
      const pool = availableByKey.get(key) ?? [];
      for (let index = 0; index < selection.quantity; index += 1) {
        const unit = pool.shift();
        if (!unit) {
          errors.push(`Packing shortfall for ${order.id}: ${meal.name} ${selection.portionSize}`);
          break;
        }
        traceCodes.push(unit.traceCode);
        assigned.add(unit.traceCode);
      }
    }
    manifests.push({ orderId: order.id, fulfillmentMethod: order.fulfillmentMethod, unitTraceCodes: traceCodes, totalUnits: traceCodes.length });
  }

  const unassignedTraceCodes = packedUnits.filter((unit) => !assigned.has(unit.traceCode)).map((unit) => unit.traceCode).sort();
  if (unassignedTraceCodes.length) errors.push(`Unassigned packed units require disposition: ${unassignedTraceCodes.join(", ")}`);
  const expectedUnits = orders.filter((order) => ["locked", "in-production"].includes(order.status)).flatMap((order) => order.selections).reduce((sum, item) => sum + item.quantity, 0);
  const assignedUnits = manifests.reduce((sum, manifest) => sum + manifest.totalUnits, 0);
  if (assignedUnits !== expectedUnits) errors.push(`Fulfillment assignment count ${assignedUnits} does not match expected locked demand ${expectedUnits}.`);

  return {
    status: errors.length ? "blocked" as const : "ready" as const,
    errors,
    manifests,
    expectedUnits,
    assignedUnits,
    unassignedTraceCodes,
  };
}
