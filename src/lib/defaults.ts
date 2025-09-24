
import type { Settings, Material, Machine, Quote } from './types';
import { nanoid } from 'nanoid';

export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Daniel Facelli',
  companyContact: 'danielfacelli@ejemplo.com',
  laborCostPerHour: 10,
  profitMargin: 50,
  currencyDecimalPlaces: 2,
  localCurrency: 'UYU',
  peakEnergyCostKwh: 0.351,
  offPeakEnergyCostKwh: 0.139,
  tariffSource: 'UTE, Enero 2024',
  tariffLastUpdated: new Date().toISOString().split('T')[0],
  peakTariffStartTime: '17:00',
  peakTariffEndTime: '23:00',
};

export const DEFAULT_MATERIALS: Material[] = [
  { id: 'pla_default_black', name: 'PLA Estándar Negro', type: 'PLA', cost: 20 },
  { id: 'pla_default_white', name: 'PLA Estándar Blanco', type: 'PLA', cost: 20 },
  { id: 'petg_default_clear', name: 'PETG Transparente', type: 'PETG', cost: 25 },
  { id: 'abs_default_gray', name: 'ABS Gris', type: 'ABS', cost: 22 },
];

export const DEFAULT_MACHINES: Machine[] = [
  { id: 'ender3_default', name: 'Creality Ender 3', costPerHour: 0.5, powerConsumption: 150 },
  { id: 'prusa_mk3', name: 'Prusa i3 MK3S+', costPerHour: 0.8, powerConsumption: 200 },
];

export const DEFAULT_QUOTES: Quote[] = [];

// Helper to generate a unique ID
export const generateId = () => nanoid();
