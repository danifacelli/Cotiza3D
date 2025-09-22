
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
  console.log("--- CALCULATE COSTS ---");
  console.log("Input Quote:", quote);
  console.log("Materials:", materials);
  console.log("Machines:", machines);
  console.log("Settings:", settings);
  
  const machine = machines.find(m => m.id === quote.machineId);
  const printHours = quote.printHours || 0;
  const laborHours = quote.laborHours || 0;
  const printTimeOfDay = quote.printTimeOfDay || 'day';

  console.log("Found Machine:", machine);
  console.log("Print Hours:", printHours);
  console.log("Print Time of Day:", printTimeOfDay);

  if (!machine || printHours <= 0 || !settings) {
    console.error("Calculation prerequisites not met. Machine:", machine, "Print Hours:", printHours, "Settings:", settings);
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
  
  const powerInWatts = printTimeOfDay === 'day' ? machine.powerConsumptionDay : machine.powerConsumptionNight;
  const powerInKw = (powerInWatts || 0) / 1000;
  const energyPrice = printTimeOfDay === 'day' ? settings.energyCostPerKwhDay : settings.energyCostPerKwhNight;

  console.log("Power in Watts:", powerInWatts);
  console.log("Power in kW:", powerInKw);
  console.log("Energy Price per kWh:", energyPrice);

  const energyCost = powerInKw * printHours * energyPrice;
  console.log("Calculated Energy Cost:", energyCost);
  
  const laborCost = (settings.laborCostPerHour || 0) * laborHours;
  
  const subtotal = materialCost + machineDepreciationCost + laborCost + energyCost;
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
  const subtotalWithExtras = subtotal + totalExtraCosts;

  const profitAmount = subtotalWithExtras * ((settings.profitMargin || 0) / 100);
  
  const total = subtotalWithExtras + profitAmount;

  const breakdown = {
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

  console.log("Final Breakdown:", breakdown);
  console.log("--- END CALCULATE COSTS ---");

  return breakdown;
}
