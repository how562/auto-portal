/** Preferred locations for Contact The Cavenders form (must match CMS + API validation). */
export const CONTACT_THE_CAVENDERS_LOCATIONS = [
  "Cavender Buick GMC North",
  "Cavender Buick GMC West",
  "Cavender Cadillac",
  "Cavender Chevrolet",
  "Cavender Grande Ford",
  "Cavender Nissan Rockwall",
  "Cavender Nissan San Marcos",
  "Jaguar San Antonio",
  "Land Rover San Antonio",
] as const;

export type ContactTheCavendersLocation =
  (typeof CONTACT_THE_CAVENDERS_LOCATIONS)[number];

export function isContactTheCavendersLocation(
  value: string,
): value is ContactTheCavendersLocation {
  return (CONTACT_THE_CAVENDERS_LOCATIONS as readonly string[]).includes(value);
}
