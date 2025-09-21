
import type { Quote, Material, Machine, Settings, QuotePart } from './types';

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
}

interface CalculationInput {
    parts?: Partial<QuotePart>[];
    machineId?: string;
    printHours?: number;
    extraCosts?: Quote['extraCosts'];
}

export function calculateCosts(
  quote: CalculationInput,
  materials: Material[],
  machines: Machine[],
  settings: Settings
): CostBreakdown | null {
  
  const machine = machines.find(m => m.id === quote.machineId);

  if (!machine || !quote.printHours || !quote.parts) {
    return null;
  }
  
  let materialCost = 0;
  for (const part of quote.parts) {
      const material = materials.find(m => m.id === part.materialId);
      if (material && part.materialGrams && part.materialGrams > 0) {
        materialCost += (part.materialGrams / 1000) * material.cost;
      }
  }

  // Energy cost: (Power in kW * hours) * cost per kWh
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
  };
}
