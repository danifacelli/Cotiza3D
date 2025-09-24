
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LATAM_CURRENCIES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number, 
  currencyCode: string = 'USD', 
  decimalPlaces: number = 2,
  display: 'code' | 'symbol' = 'code',
  forcedLocale?: string
) {
  const currencyInfo = LATAM_CURRENCIES.find(c => c.value === currencyCode);
  const locale = forcedLocale || currencyInfo?.locale || 'en-US';

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    currencyDisplay: display
  };
  
  if (display === 'code' && currencyCode === 'USD') {
    return new Intl.NumberFormat('en-US', options).format(amount).replace(currencyCode, '').trim() + ` ${currencyCode}`;
  }
  
  return new Intl.NumberFormat(locale, options).format(amount);
}
