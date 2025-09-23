
'use client';

const API_URL = 'https://api.frankfurter.app/latest?from=USD&to=UYU';

export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    UYU: number;
  };
}

export async function getUsdToUyuExchangeRate(): Promise<number> {
  try {
    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }
    const data: ExchangeRateResponse = await response.json();
    return data.rates.UYU;
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    throw error;
  }
}
