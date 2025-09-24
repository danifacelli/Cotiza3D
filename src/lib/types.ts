
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
  powerConsumption: number; // in Watts
}

export interface Settings {
  laborCostPerHour: number; // in USD
  profitMargin: number; // percentage
  companyName: string;
  companyContact: string;
  companyInstagram?: string;
  currencyDecimalPlaces: number;
  localCurrency: string; // e.g. 'UYU'
  peakEnergyCostKwh: number; // in USD
  offPeakEnergyCostKwh: number; // in USD
  tariffSource: string;
  tariffLastUpdated: string;
  peakTariffStartTime: string; // HH:mm format
  peakTariffEndTime: string; // HH:mm format
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
  status: 'draft' | 'accepted' | 'canceled';
  createdAt: string; // ISO date string

  parts: QuotePart[];
  
  machineId: string;
  printHours: number;
  designCost: number;
  
  width?: number;
  height?: number;
  depth?: number;
  
  tariffType: 'peak' | 'off-peak' | 'mixed';
  peakHours?: number; // Only used when tariffType is 'mixed'
  
  laborHours: number;

  extraCosts: ExtraCost[];
  notes: string;
}
