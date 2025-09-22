
import type { Quote, Material, Machine, Settings, QuotePart } from './types';

export interface CostBreakdown {
  materialCost: number;
  machineDepreciationCost: number;
  laborCost: number;
  subtotal: number;
  totalExtraCosts: number;
  subtotalWithExtras: number;
  profitAmount: number;
  subtotalWithProfit: number;
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

  if (!machine) {
    return null;
  }
  
  let materialCost = 0;
  if (quote.parts) {
    for (const part of quote.parts) {
        const material = materials.find(m => m.id === part.materialId);
        if (material && part.materialGrams && part.materialGrams > 0) {
          materialCost += (part.materialGrams / 1000) * material.cost;
        }
    }
  }

  const machineDepreciationCost = machine.costPerHour * printHours;
  const laborCost = settings.laborCostPerHour * printHours;
  
  const subtotal = materialCost + machineDepreciationCost + laborCost;
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + cost.amount, 0);
  const subtotalWithExtras = subtotal + totalExtraCosts;

  const profitAmount = subtotalWithExtras * (settings.profitMargin / 100);
  const subtotalWithProfit = subtotalWithExtras + profitAmount;
  
  const total = subtotalWithProfit;

  return {
    materialCost,
    machineDepreciationCost,
    laborCost,
    subtotal,
    totalExtraCosts,
    subtotalWithExtras,
    profitAmount,
    subtotalWithProfit,
    total,
  };
}
