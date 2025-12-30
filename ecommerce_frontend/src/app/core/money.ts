/**
 * PUBLIC_INTERFACE
 * Convert cents to a formatted currency string.
 */
export function formatMoneyFromCents(
  cents: number,
  currencyCode: string,
  locale = 'en-US',
): string {
  const amount = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    // Fallback if currency code is unexpected
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
