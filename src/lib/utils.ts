import { UAParser } from "ua-parser-js";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function parseDevice(userAgent?: string | null) {
  if (!userAgent) return "Unknown device";
  const { browser, os } = UAParser(userAgent);
  const browserName = browser.name ?? "Unknown browser";
  const osName = os.name ?? "Unknown OS";
  return `${browserName} on ${osName}`;
}

export function filterEmptyValues<T extends Record<string, any>>(
  obj: T,
  options = { removeZero: false },
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_key, value]) => {
      // Skip undefined & null
      if (value === undefined || value === null) return false;

      // Skip empty string
      if (typeof value === "string" && value.trim() === "") return false;

      // Skip empty array
      if (Array.isArray(value) && value.length === 0) return false;

      // Optional: skip number 0
      if (options.removeZero && typeof value === "number" && value === 0) {
        return false;
      }

      return true;
    }),
  ) as Partial<T>;
}
