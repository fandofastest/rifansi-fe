/**
 * Format a number to Indonesian Rupiah currency format
 * @param amount Number to format
 * @returns Formatted string in Rupiah format (e.g. "Rp 1.234.567")
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Convert Indonesian Rupiah string format to number
 * @param rupiahString Rupiah string (e.g. "Rp 1.234.567")
 * @returns Number value (e.g. 1234567)
 */
export const parseRupiah = (rupiahString: string): number => {
  if (!rupiahString) return 0;
  
  // Remove currency symbol, dots, and commas
  const cleanString = rupiahString
    .replace(/[^\d,.-]/g, '')  // Remove all non-numeric chars except dots, commas, and minus
    .replace(/\./g, '')        // Remove dots (thousand separators in ID locale)
    .replace(/,/g, '.');       // Replace commas with dots (for decimal points)
    
  return parseFloat(cleanString) || 0;
}; 