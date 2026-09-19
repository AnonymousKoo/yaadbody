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
      message: "For this guest count, Party Trays are the best starting option.",
    };
  }

  const recommendedPackage = packages.find(
    (pkg) => pkg.minimumGuests <= inquiry.guestCount && pkg.serviceLevels.includes(inquiry.serviceLevel),
  );

  if (inquiry.guestCount >= 20 && !recommendedPackage) {
    errors.push("Choose a different service level or adjust the guest count to see an available option.");
  }

  return {
    route: "catering" as const,
    quoteReady: errors.length === 0 && Boolean(recommendedPackage),
    recommendedPackage,
    errors,
    message: recommendedPackage
      ? "This option fits the event details you shared. YaadBody will confirm availability, menu, service, and final pricing before booking."
      : "Adjust the guest count or service level to see the best available option.",
  };
}
