
export interface Material {
  id: string;
  name: string;
  type: string;
  cost: number; // Cost per kg in currency from settings
  description?: string;
}

export interface Machine {
  id: string;
  name: string;
  costPerHour: number; // in USD
  powerConsumptionDay: number; // in kWh
  powerConsumptionNight: number; // in kWh
}

export interface Settings {
  laborCostPerHour: number; // in USD
  profitMargin: number; // percentage
  companyName: string;
  companyContact: string;
  currencyDecimalPlaces: number;
}

export interface ExtraCost {
  id: string;
  description: string;
  amount: number;
}

export interface QuotePart {
  id: string;
  materialId: string;
  materialGrams: number;
}

export interface Quote {
  id: string;
  name: string;
  clientName: string;
  status: 'draft' | 'finalized';
  createdAt: string; // ISO date string

  parts: QuotePart[];
  
  machineId: string;
  printHours: number;
  
  laborHours: number;

  extraCosts: ExtraCost[];
  notes: string;
}
