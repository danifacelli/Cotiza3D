
import type { Quote, Material, Machine, Settings } from './types';

export interface CostBreakdown {
  materialCost: number;
  machineEnergyCost: number;
  machineDepreciationCost: number;
  laborCost: number;
  subtotal: number;
  totalExtraCosts: number;
  subtotalWithExtras: number;
  profitAmount: number;
  subtotalWithProfit: number;
  ivaAmount: number;
  total: number;
  totalUYU: number;
}

export function calculateCosts(
  quote: Partial<Pick<Quote, 'materialId' | 'materialGrams' | 'machineId' | 'printHours' | 'extraCosts'>>,
  materials: Material[],
  machines: Machine[],
  settings: Settings
): CostBreakdown | null {
  const material = materials.find(m => m.id === quote.materialId);
  const machine = machines.find(m => m.id === quote.machineId);

  if (!material || !machine || !quote.materialGrams || !quote.printHours) {
    return null;
  }

  // Material cost is based on the cost per KG stored in the material object
  const materialCost = (quote.materialGrams / 1000) * material.cost;
  
  const machineEnergyCost = (machine.powerConsumption / 1000) * quote.printHours * settings.energyCostPerKwh;
  const machineDepreciationCost = machine.costPerHour * quote.printHours;
  const laborCost = settings.laborCostPerHour * quote.printHours;
  
  const subtotal = materialCost + machineEnergyCost + machineDepreciationCost + laborCost;
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + cost.amount, 0);
  const subtotalWithExtras = subtotal + totalExtraCosts;

  const profitAmount = subtotalWithExtras * (settings.profitMargin / 100);
  const subtotalWithProfit = subtotalWithExtras + profitAmount;
  
  const ivaAmount = subtotalWithProfit * (settings.iva / 100);
  const total = subtotalWithProfit + ivaAmount;

  return {
    materialCost,
    machineEnergyCost,
    machineDepreciationCost,
    laborCost,
    subtotal,
    totalExtraCosts,
    subtotalWithExtras,
    profitAmount,
    subtotalWithProfit,
    ivaAmount,
    total,
    totalUYU: total * settings.exchangeRate,
  };
}
