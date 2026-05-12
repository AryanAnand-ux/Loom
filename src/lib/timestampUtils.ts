/**
 * Shared timestamp utility to normalize Firestore Timestamp objects,
 * plain seconds objects, ISO strings, and raw numbers to milliseconds.
 * Used by both useCloset and useOutfits hooks.
 */
export function getTimestampValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }

  if (value && typeof value === "object" && "seconds" in value) {
    const seconds = (value as { seconds?: number }).seconds;
    return typeof seconds === "number" ? seconds * 1000 : 0;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === "number") return value;

  return 0;
}
