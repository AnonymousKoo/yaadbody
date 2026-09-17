import type { CateringInquiry, CateringPackage } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function evaluateCateringInquiry(inquiry: CateringInquiry, packages: CateringPackage[]) {
  const errors: string[] = [];
  if (!inquiry.eventDate) errors.push("Event date is required.");
  if (!inquiry.location.trim()) errors.push("Event city or ZIP is required.");
  if (!EMAIL_PATTERN.test(inquiry.contactEmail.trim())) errors.push("A valid contact email is required.");
  if (!Number.isFinite(inquiry.guestCount) || inquiry.guestCount < 1) errors.push("Guest count must be at least 1.");

  if (inquiry.guestCount > 0 && inquiry.guestCount < 20) {
    return {
      route: "party-trays" as const,
      quoteReady: false,
      recommendedPackage: undefined,
      errors,
      message: "This size is better routed to Party Trays instead of a catering quote.",
    };
  }

  const recommendedPackage = packages.find(
    (pkg) => pkg.minimumGuests <= inquiry.guestCount && pkg.serviceLevels.includes(inquiry.serviceLevel),
  );

  if (inquiry.guestCount >= 20 && !recommendedPackage) {
    errors.push("The selected service level does not have a package for this guest count yet.");
  }

  return {
    route: "catering" as const,
    quoteReady: errors.length === 0 && Boolean(recommendedPackage),
    recommendedPackage,
    errors,
    message: recommendedPackage
      ? "The inquiry has enough structure for a costing review. Pricing still requires validated food, labor, packaging, delivery, and margin inputs."
      : "Adjust the guest count or service level before costing review.",
  };
}
