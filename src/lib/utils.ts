
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = 'USD') {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    currencyDisplay: 'code' // This will display 'USD' instead of '$'
  };
  
  // Replace the default currency code with an empty string to avoid "USD USD"
  return new Intl.NumberFormat('en-US', options).format(amount).replace(currencyCode, '').trim() + ` ${currencyCode}`;
}

    
