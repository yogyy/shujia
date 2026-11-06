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
