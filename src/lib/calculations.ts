
import type { Quote, Material, Machine, Settings, QuotePart } from './types';

export interface CostBreakdown {
  materialCost: number;
  machineDepreciationCost: number;
  energyCost: number;
  laborCost: number;
  subtotal: number;
  totalExtraCosts: number;
  subtotalWithExtras: number;
  profitAmount: number;
  total: number;
}

interface CalculationInput extends Partial<Omit<Quote, 'printHours' | 'parts'>> {
    parts?: Partial<QuotePart>[];
    printHours?: number;
}

export function calculateCosts(
  quote: CalculationInput,
  materials: Material[],
  machines: Machine[],
  settings: Settings
): CostBreakdown | null {
  
  const machine = machines.find(m => m.id === quote.machineId);
  const printHours = quote.printHours || 0;
  const timeOfDay = quote.printTimeOfDay || 'day';

  if (!machine || printHours <= 0) {
    return null;
  }
  
  let materialCost = 0;
  if (quote.parts) {
    for (const part of quote.parts) {
        const material = materials.find(m => m.id === part.materialId);
        const grams = Number(part.materialGrams) || 0;
        if (material && grams > 0) {
          materialCost += (grams / 1000) * material.cost;
        }
    }
  }

  const machineDepreciationCost = machine.costPerHour * printHours;
  
  const powerConsumption = timeOfDay === 'day' ? machine.powerConsumptionDay : machine.powerConsumptionNight;
  const energyCostPerKwh = timeOfDay === 'day' ? (settings.energyCostPerKwhDay || 0) : (settings.energyCostPerKwhNight || 0);
  const energyCost = (powerConsumption / 1000) * printHours * energyCostPerKwh;

  const laborCost = (settings.laborCostPerHour || 0) * printHours;
  
  const subtotal = materialCost + machineDepreciationCost + energyCost + laborCost;
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
  const subtotalWithExtras = subtotal + totalExtraCosts;

  const profitAmount = subtotalWithExtras * ((settings.profitMargin || 0) / 100);
  
  const total = subtotalWithExtras + profitAmount;

  return {
    materialCost,
    machineDepreciationCost,
    energyCost,
    laborCost,
    subtotal,
    totalExtraCosts,
    subtotalWithExtras,
    profitAmount,
    total,
  };
}
