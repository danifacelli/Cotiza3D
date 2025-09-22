
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
): { breakdown: CostBreakdown | null; logs: string[] } {
  const logs: string[] = [];
  logs.push("--- INICIANDO CÁLCULO ---");
  logs.push(`Input Quote: ${JSON.stringify(quote)}`);
  
  const machine = machines.find(m => m.id === quote.machineId);
  const printHours = quote.printHours || 0;
  const laborHours = quote.laborHours || 0;
  const printTimeOfDay = quote.printTimeOfDay || 'day';

  logs.push(`Máquina encontrada: ${JSON.stringify(machine)}`);
  logs.push(`Horas de Impresión: ${printHours}`);
  logs.push(`Horario de Impresión: ${printTimeOfDay}`);
  logs.push(`Settings: ${JSON.stringify(settings)}`);

  if (!machine || printHours <= 0 || !settings) {
    logs.push(`[ERROR] Prerrequisitos no cumplidos. Máquina: ${!!machine}, Horas: ${printHours}, Config: ${!!settings}`);
    return { breakdown: null, logs };
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
  logs.push(`Costo de material calculado: ${materialCost}`);

  const machineDepreciationCost = machine.costPerHour * printHours;
  logs.push(`Costo de depreciación: ${machineDepreciationCost}`);
  
  const powerInWatts = printTimeOfDay === 'day' ? machine.powerConsumptionDay : machine.powerConsumptionNight;
  const energyPrice = printTimeOfDay === 'day' ? machine.energyCostPerKwhDay : machine.energyCostPerKwhNight;
  const powerInKw = (powerInWatts || 0) / 1000;

  logs.push(`Potencia en Watts: ${powerInWatts}`);
  logs.push(`Potencia en kW: ${powerInKw}`);
  logs.push(`Precio Energía por kWh: ${energyPrice}`);

  const energyCost = powerInKw * printHours * energyPrice;
  logs.push(`Costo de energía calculado: ${energyCost}`);
  
  const laborCost = (settings.laborCostPerHour || 0) * laborHours;
  logs.push(`Costo de mano de obra: ${laborCost}`);
  
  const subtotal = materialCost + machineDepreciationCost + laborCost + energyCost;
  logs.push(`Subtotal: ${subtotal}`);
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + (cost.amount || 0), 0);
  const subtotalWithExtras = subtotal + totalExtraCosts;
  logs.push(`Subtotal con extras: ${subtotalWithExtras}`);

  const profitAmount = subtotalWithExtras * ((settings.profitMargin || 0) / 100);
  logs.push(`Monto de ganancia: ${profitAmount}`);
  
  const total = subtotalWithExtras + profitAmount;
  logs.push(`Total: ${total}`);

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

  logs.push(`Desglose final: ${JSON.stringify(breakdown)}`);
  logs.push("--- FIN DEL CÁLCULO ---");

  return { breakdown, logs };
}
