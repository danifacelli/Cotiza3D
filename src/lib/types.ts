export interface Material {
  id: string;
  name: string;
  cost: number; // Cost per kg in USD
}

export interface Machine {
  id: string;
  name: string;
  costPerHour: number; // in USD
  powerConsumption: number; // in Watts
}

export interface Settings {
  exchangeRate: number; // USD to UYU
  laborCostPerHour: number; // in USD
  energyCostPerKwh: number; // in USD
  profitMargin: number; // percentage
  iva: number; // percentage
  companyName: string;
  companyContact: string;
  currencySymbol: string; // e.g., '$'
  currencyCode: string; // e.g., 'USD'
}

export interface ExtraCost {
  id: string;
  description: string;
  amount: number;
}

export interface Quote {
  id: string;
  name: string;
  clientName: string;
  status: 'draft' | 'finalized';
  createdAt: string; // ISO date string

  materialId: string;
  materialGrams: number;
  
  machineId: string;
  printHours: number;

  extraCosts: ExtraCost[];
  notes: string;
}
