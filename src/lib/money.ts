export const CURRENCY = "RON";

export function formatMoney(cents: number): string {
  const value = cents / 100;
  const formatted = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(".", ",");
  return `${formatted} lei`;
}
