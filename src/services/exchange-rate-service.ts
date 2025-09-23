
'use server';

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
    const response = await fetch(API_URL, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate. Status: ${response.status} ${response.statusText}`);
    }
    const data: ExchangeRateResponse = await response.json();
    return data.rates.UYU;
  } catch (error) {
     if (error instanceof Error) {
        console.error("Exchange rate fetch error:", error.message);
        throw new Error(`Failed to fetch from API: ${error.message}`);
    }
    console.error("An unknown error occurred during exchange rate fetch:", error);
    throw new Error('An unknown error occurred while fetching the exchange rate.');
  }
}
