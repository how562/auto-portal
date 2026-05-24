import { getEffectiveVehiclePrice, isUsablePrice } from "./format";
import { isUsedVehicle } from "./vdpDisplay";
import type { VehicleDetail } from "./types";

/** Estimated documentation fee shown in the math box until store-level fees exist. */
export const DEFAULT_DOC_FEE = 150;

export interface ConditionalOffer {
  id: string;
  label: string;
  /** When null, the offer amount is not guaranteed until eligibility is confirmed. */
  amount: number | null;
  note?: string;
}

export interface VehiclePricingBreakdown {
  hasPrice: boolean;
  msrp: number | null;
  dealerDiscount: number | null;
  conditionalOffers: ConditionalOffer[];
  otherOffers: ConditionalOffer[];
  docFee: number;
  salePrice: number | null;
  finalPrice: number | null;
  conditionalOffersTotal: number;
}

function buildNewVehicleConditionalOffers(): ConditionalOffer[] {
  return [
    {
      id: "military",
      label: "Military Appreciation",
      amount: 500,
      note: "For eligible active-duty, veterans, and their families.",
    },
    {
      id: "college",
      label: "College Graduate",
      amount: 500,
      note: "Recent graduates within the last 24 months may qualify.",
    },
    {
      id: "loyalty",
      label: "Brand Loyalty",
      amount: 750,
      note: "Current owners of the same brand may qualify.",
    },
  ];
}

function buildUsedVehicleConditionalOffers(): ConditionalOffer[] {
  return [
    {
      id: "cpo",
      label: "Certified Pre-Owned Benefits",
      amount: null,
      note: "Extended coverage and inspection-backed peace of mind.",
    },
    {
      id: "financing",
      label: "Special Financing",
      amount: null,
      note: "Ask about current APR programs for qualified buyers.",
    },
  ];
}

function buildOtherOffers(vehicle: VehicleDetail): ConditionalOffer[] {
  const used = isUsedVehicle(vehicle.condition);
  const offers: ConditionalOffer[] = [
    {
      id: "trade",
      label: used ? "Trade-In Bonus" : "Conquest Bonus",
      amount: used ? 500 : 1000,
      note: "May apply when you trade in or switch brands.",
    },
    {
      id: "first-responder",
      label: "First Responder",
      amount: 500,
      note: "Police, fire, EMS, and healthcare workers may qualify.",
    },
  ];

  if (!used) {
    offers.push({
      id: "lease-cash",
      label: "Lease Cash",
      amount: null,
      note: "Stackable lease incentives vary by term and credit tier.",
    });
  }

  return offers;
}

export function sumOfferAmounts(offers: ConditionalOffer[]): number {
  return offers.reduce((total, offer) => {
    if (typeof offer.amount === "number" && offer.amount > 0) {
      return total + offer.amount;
    }
    return total;
  }, 0);
}

/**
 * Builds the structured math-box breakdown from available vehicle pricing.
 * Conditional / other offers are illustrative until incentive data is wired in.
 */
export function buildVehiclePricingBreakdown(
  vehicle: VehicleDetail,
): VehiclePricingBreakdown {
  const effective = getEffectiveVehiclePrice(vehicle);
  const msrp = isUsablePrice(vehicle.msrp) ? vehicle.msrp : null;
  const salePrice = isUsablePrice(vehicle.internet_price)
    ? vehicle.internet_price
    : effective.amount;

  const dealerDiscount =
    msrp != null && salePrice != null && msrp > salePrice
      ? msrp - salePrice
      : null;

  const used = isUsedVehicle(vehicle.condition);
  const conditionalOffers = used
    ? buildUsedVehicleConditionalOffers()
    : buildNewVehicleConditionalOffers();
  const otherOffers = buildOtherOffers(vehicle);
  const conditionalOffersTotal = sumOfferAmounts(conditionalOffers);
  const docFee = DEFAULT_DOC_FEE;

  const finalPrice = salePrice != null ? salePrice + docFee : null;

  return {
    hasPrice: salePrice != null,
    msrp,
    dealerDiscount,
    conditionalOffers,
    otherOffers,
    docFee,
    salePrice,
    finalPrice,
    conditionalOffersTotal,
  };
}
