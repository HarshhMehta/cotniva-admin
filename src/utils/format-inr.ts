/** Format amount as Indian Rupees (₹) */
export function formatINR(
  value?: number | string | null,
  opts?: { fractionDigits?: number }
): string {
  const n = Number(value ?? 0);
  const digits = opts?.fractionDigits;
  return `₹${(Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    minimumFractionDigits: digits ?? 0,
    maximumFractionDigits: digits ?? 2,
  })}`;
}
