
import type { Settings, Material, Machine, Quote, Design, Investment, FuturePurchase, Client, LinkItem } from './types';
import { nanoid } from 'nanoid';

export const DEFAULT_SETTINGS: Settings = {
  companyName: '',
  companyContact: '',
  companyInstagram: '',
  laborCostPerHour: 0,
  profitMargin: 0,
  currencyDecimalPlaces: 2,
  localCurrency: 'UYU',
  peakEnergyCostKwh: 0,
  offPeakEnergyCostKwh: 0,
  tariffSource: '',
  tariffLastUpdated: new Date().toISOString().split('T')[0],
  peakTariffStartTime: '17:00',
  peakTariffEndTime: '23:00',
};

export const DEFAULT_MATERIALS: Material[] = [
  { id: 'pla_default', name: 'PLA Estándar', type: 'PLA', cost: 0 },
];

export const DEFAULT_MACHINES: Machine[] = [];

export const DEFAULT_QUOTES: Quote[] = [];

export const DEFAULT_DESIGNS: Design[] = [];

export const DEFAULT_INVESTMENTS: Investment[] = [];

export const DEFAULT_FUTURE_PURCHASES: FuturePurchase[] = [];

export const DEFAULT_CLIENTS: Client[] = [];

export const DEFAULT_LINKS: LinkItem[] = [];

// Helper to generate a unique ID
export const generateId = () => nanoid();
