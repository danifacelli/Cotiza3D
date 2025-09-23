
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number, 
  currencyCode: string = 'USD', 
  decimalPlaces: number = 2,
  display: 'code' | 'symbol' = 'code'
) {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    currencyDisplay: display
  };
  
  // For USD, we want to remove the code but keep the symbol for others
  const locale = currencyCode === 'UYU' ? 'es-UY' : 'en-US';

  if (display === 'code') {
    return new Intl.NumberFormat(locale, options).format(amount).replace(currencyCode, '').trim() + ` ${currencyCode}`;
  }
  
  return new Intl.NumberFormat(locale, options).format(amount);
}
