
'use server';

const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: {
    [key: string]: number;
  };
}

export async function getExchangeRate(targetCurrency: string): Promise<number> {
  if (targetCurrency === 'USD') return 1;

  try {
    const response = await fetch(API_URL, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate. Status: ${response.status} ${response.statusText}`);
    }
    const data: ExchangeRateResponse = await response.json();

    if (data.result !== 'success' || !data.rates || !data.rates[targetCurrency]) {
        throw new Error(`Invalid data or currency ${targetCurrency} not found in API response.`);
    }

    return data.rates[targetCurrency];
  } catch (error) {
     if (error instanceof Error) {
        console.error("Exchange rate fetch error:", error.message);
        throw new Error(`Failed to fetch from API: ${error.message}`);
    }
    console.error("An unknown error occurred during exchange rate fetch:", error);
    throw new Error('An unknown error occurred while fetching the exchange rate.');
  }
}
