
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
  const totalPrintHours = quote.printHours || 0;
  const laborHours = quote.laborHours || 0;
  const tariffType = quote.tariffType || 'off-peak';

  logs.push(`Máquina encontrada: ${JSON.stringify(machine)}`);
  logs.push(`Horas de Impresión Totales: ${totalPrintHours}`);
  logs.push(`Tipo de Tarifa: ${tariffType}`);
  logs.push(`Settings: ${JSON.stringify(settings)}`);

  if (!machine || totalPrintHours <= 0 || !settings) {
    logs.push(`[AVISO] Prerrequisitos no cumplidos para cálculo completo.`);
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

  const machineDepreciationCost = machine.costPerHour * totalPrintHours;
  logs.push(`Costo de depreciación: ${machineDepreciationCost}`);
  
  // Energy Cost Calculation
  const powerInKw = (machine.powerConsumption || 0) / 1000;
  const peakPrice = settings.peakEnergyCostKwh || 0;
  const offPeakPrice = settings.offPeakEnergyCostKwh || 0;
  
  let peakHours = 0;
  if (tariffType === 'peak') {
      peakHours = totalPrintHours;
  } else if (tariffType === 'mixed') {
      peakHours = Math.min(quote.peakHours || 0, totalPrintHours);
  }
  const offPeakHours = totalPrintHours - peakHours;

  logs.push(`Potencia en kW: ${powerInKw}`);
  logs.push(`Precio Tarifa Punta: ${peakPrice}`);
  logs.push(`Precio Fuera de Punta: ${offPeakPrice}`);
  logs.push(`Horas en Punta: ${peakHours}`);
  logs.push(`Horas Fuera de Punta: ${offPeakHours}`);

  const peakCost = peakHours * powerInKw * peakPrice;
  const offPeakCost = offPeakHours * powerInKw * offPeakPrice;
  const energyCost = peakCost + offPeakCost;
  logs.push(`Costo de energía calculado: ${energyCost} (Punta: ${peakCost}, Fuera de Punta: ${offPeakCost})`);
  
  const laborCost = (settings.laborCostPerHour || 0) * laborHours;
  logs.push(`Costo de mano de obra: ${laborCost}`);
  
  const subtotal = materialCost + machineDepreciationCost + laborCost + energyCost;
  logs.push(`Subtotal: ${subtotal}`);
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + (Number(cost.amount) || 0), 0);
  const subtotalWithExtras = subtotal + totalExtraCosts;
  logs.push(`Subtotal con extras: ${subtotalWithExtras}`);

  const profitAmount = subtotal * ((settings.profitMargin || 0) / 100);
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

