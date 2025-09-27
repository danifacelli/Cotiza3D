

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

export interface Investment {
  id: string;
  name: string;
  amount: number;
  createdAt: string; // ISO date string
}

export interface FuturePurchase {
  id: string;
  name: string;
  description?: string;
  link?: string;
  priceUSD: number;
  status: 'pending' | 'purchased';
  createdAt: string; // ISO date string
}

export interface Client {
  id: string;
  name: string;
  instagram?: string;
  facebook?: string;
  phone?: string;
  createdAt: string; // ISO date string
}

export type ClientWithStats = Client & {
  lastJobName?: string;
  totalPurchased: number;
};

export interface Quote {
  id: string;
  name: string;
  clientId?: string;
  designId?: string;
  status: 'draft' | 'accepted' | 'in_preparation' | 'ready_to_deliver' | 'delivered' | 'canceled';
  createdAt: string; // ISO date string
  quantity: number;

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
  deliveryDate?: string;
  finalPriceOverride?: number; // Manual override for the total price in USD
  finalPriceOverrideLocal?: number; // Manual override for the total price in Local Currency
}

export interface Design extends Omit<Quote, 'status' | 'clientId' | 'deliveryDate' | 'designId' | 'quantity'> {
  status: 'draft'; // Designs are always draft
  photo1_base64?: string;
  photo2_base64?: string;
  mercadoLibreLink?: string;
  instagramLink?: string;
  link?: string;
}

export interface LinkItem {
  id: string;
  name: string;
  description?: string;
  link: string;
  createdAt: string;
}

