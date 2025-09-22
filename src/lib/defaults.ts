
import type { Settings, Material, Machine, Quote } from './types';
import { nanoid } from 'nanoid';

export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Cotiza3D',
  companyContact: 'tuemail@ejemplo.com',
  laborCostPerHour: 10,
  profitMargin: 50,
  currencyDecimalPlaces: 2,
  energyCostPerKwhDay: 0.2,
  energyCostPerKwhNight: 0.1,
};

export const DEFAULT_MATERIALS: Material[] = [
  { id: 'pla_default_black', name: 'PLA Estándar Negro', type: 'PLA', cost: 20 },
];

export const DEFAULT_MACHINES: Machine[] = [
  { id: 'ender3_default', name: 'Creality Ender 3', costPerHour: 0.5, powerConsumptionDay: 0.15, powerConsumptionNight: 0.15 },
  { id: 'prusa_mk3', name: 'Prusa i3 MK3S+', costPerHour: 0.8, powerConsumptionDay: 0.2, powerConsumptionNight: 0.18 },
];

export const DEFAULT_QUOTES: Quote[] = [];

// Helper to generate a unique ID
export const generateId = () => nanoid();
