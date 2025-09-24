
import type { Settings, Material, Machine, Quote, Investment } from './types';
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

export const DEFAULT_INVESTMENTS: Investment[] = [];

// Helper to generate a unique ID
export const generateId = () => nanoid();
