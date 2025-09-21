
import type { Settings, Material, Machine, Quote } from './types';
import { nanoid } from 'nanoid';

export const DEFAULT_SETTINGS: Settings = {
  exchangeRate: 40.0,
  laborCostPerHour: 10,
  energyCostPerKwh: 0.2,
  profitMargin: 50,
  iva: 22,
  companyName: 'Cotiza3D',
  companyContact: 'tuemail@ejemplo.com',
  currencySymbol: '$',
  currencyCode: 'USD',
};

export const DEFAULT_MATERIALS: Material[] = [
  { id: 'pla_default_1', name: 'PLA Estándar Blanco', type: 'PLA', cost: 20 },
  { id: 'pla_default_2', name: 'PLA Silk Dorado', type: 'PLA', cost: 28 },
  { id: 'abs_default', name: 'ABS Gris', type: 'ABS', cost: 22 },
  { id: 'petg_default', name: 'PETG Estándar Negro', type: 'PETG', cost: 25 },
  { id: 'tpu_default', name: 'TPU Flexible Rojo', type: 'TPU/TPE', cost: 35 },
  { id: 'nylon_default', name: 'Nylon Natural', type: 'Nylon', cost: 40 },
  { id: 'asa_default', name: 'ASA Negro Exterior', type: 'ASA', cost: 38 },
  { id: 'pc_default', name: 'Policarbonato Transparente', type: 'PC', cost: 45 },
  { id: 'wood_default', name: 'PLA Filamento Madera', type: 'Wood', cost: 33 },
  { id: 'carbon_default', name: 'PETG Fibra de Carbono', type: 'CarbonFiber', cost: 55 },
];

export const DEFAULT_MACHINES: Machine[] = [
  { id: 'ender3_default', name: 'Creality Ender 3', costPerHour: 0.5, powerConsumption: 150 },
  { id: 'prusa_mk3', name: 'Prusa i3 MK3S+', costPerHour: 0.8, powerConsumption: 200 },
];

export const DEFAULT_QUOTES: Quote[] = [];

// Helper to generate a unique ID
export const generateId = () => nanoid();
