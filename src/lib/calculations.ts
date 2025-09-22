
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

interface CalculationInput extends Partial<Omit<Quote, 'printHours' | 'laborHours' | 'parts'>> {
    parts?: Partial<QuotePart>[];
    printHours?: number;
    laborHours?: number;
}

export function calculateCosts(
  quote: CalculationInput,
  materials: Material[],
  machines: Machine[],
  settings: Settings
): CostBreakdown | null {
  
  const machine = machines.find(m => m.id === quote.machineId);
  const printHours = quote.printHours || 0;
  const laborHours = quote.laborHours || 0;
  const printTimeOfDay = quote.printTimeOfDay || 'day';

  if (!machine || printHours <= 0 || !settings) {
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
  
  const powerConsumption = printTimeOfDay === 'day' ? machine.powerConsumptionDay : machine.powerConsumptionNight;
  const energyPrice = printTimeOfDay === 'day' ? settings.energyCostPerKwhDay : settings.energyCostPerKwhNight;
  const energyCost = (powerConsumption * printHours) * energyPrice;
  
  const laborCost = (settings.laborCostPerHour || 0) * laborHours;
  
  const subtotal = materialCost + machineDepreciationCost + laborCost + energyCost;
  
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
