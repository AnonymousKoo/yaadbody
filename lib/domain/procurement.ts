import { calculateIngredientPurchaseEconomics } from "./costing";
import type { SupplierOffer } from "./types";

const qualityEligible = (status: SupplierOffer["qualityStatus"]) => status === "approved" || status === "preferred";

export function evaluateSupplierOffer(offer: SupplierOffer, requiredUsableGrams = 0) {
  const errors: string[] = [];
  if (!Number.isFinite(offer.allocatedDeliveryCostCents) || offer.allocatedDeliveryCostCents < 0) errors.push("Allocated delivery cost cannot be negative.");
  if (!Number.isFinite(requiredUsableGrams) || requiredUsableGrams < 0) errors.push("Required usable grams cannot be negative.");
  const economics = calculateIngredientPurchaseEconomics(offer);
  if (!economics.valid) errors.push(...economics.errors);

  const landedPackageCostCents = offer.packagePriceCents + offer.allocatedDeliveryCostCents;
  const landedCostPerUsableGramCents = economics.usableGrams > 0 ? landedPackageCostCents / economics.usableGrams : 0;
  const packagesRequired = requiredUsableGrams > 0 && economics.usableGrams > 0 ? Math.ceil(requiredUsableGrams / economics.usableGrams) : 1;
  const usableGramsPurchased = economics.usableGrams * packagesRequired;
  const projectedSpendCents = landedPackageCostCents * packagesRequired;
  const projectedOverageGrams = requiredUsableGrams > 0 ? Math.max(0, usableGramsPurchased - requiredUsableGrams) : 0;
  const eligible = errors.length === 0 && qualityEligible(offer.qualityStatus) && offer.availability !== "out-of-stock";

  return {
    offerId: offer.id,
    supplierName: offer.supplierName,
    eligible,
    errors,
    exclusionReason: errors.length ? errors.join(" ") : !qualityEligible(offer.qualityStatus) ? `Quality status is ${offer.qualityStatus}.` : offer.availability === "out-of-stock" ? "Offer is out of stock." : null,
    purchasedGramsPerPackage: economics.purchasedGrams,
    usableGramsPerPackage: economics.usableGrams,
    landedPackageCostCents,
    landedCostPerUsableGramCents,
    packagesRequired,
    usableGramsPurchased,
    projectedSpendCents,
    projectedOverageGrams,
    confidence: offer.confidence,
    qualityStatus: offer.qualityStatus,
    availability: offer.availability,
  };
}

export function compareSupplierOffers(offers: SupplierOffer[], ingredientId: string, requiredUsableGrams = 0) {
  const relevant = offers.filter((offer) => offer.ingredientId === ingredientId);
  const evaluated = relevant.map((offer) => evaluateSupplierOffer(offer, requiredUsableGrams));
  const eligible = evaluated.filter((offer) => offer.eligible).sort((a, b) => {
    if (a.projectedSpendCents !== b.projectedSpendCents && requiredUsableGrams > 0) return a.projectedSpendCents - b.projectedSpendCents;
    return a.landedCostPerUsableGramCents - b.landedCostPerUsableGramCents;
  });
  const lowestCostEligibleOffer = eligible[0] ?? null;
  const highestEligibleSpend = eligible.length ? Math.max(...eligible.map((offer) => offer.projectedSpendCents)) : null;
  const savingsVsHighestEligibleCents = lowestCostEligibleOffer && highestEligibleSpend !== null ? highestEligibleSpend - lowestCostEligibleOffer.projectedSpendCents : null;

  return {
    ingredientId,
    requiredUsableGrams,
    evaluated,
    eligibleCount: eligible.length,
    lowestCostEligibleOffer,
    savingsVsHighestEligibleCents,
    status: lowestCostEligibleOffer ? (lowestCostEligibleOffer.confidence === "validated" ? "validated-comparison" : "planning-comparison") : "blocked",
  } as const;
}
