
import type { Quote, Material, Machine, Settings, QuotePart } from './types';

export interface CostBreakdown {
  materialCost: number;
  machineDepreciationCost: number;
  energyCost: number;
  laborCost: number;
  subtotal: number; // Production subtotal
  designCost: number;
  totalExtraCosts: number;
  costSubtotal: number; // Production + design + extras
  profitAmount: number;
  total: number;
  isManualPrice: boolean;
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
  const designCost = Number(quote.designCost) || 0;
  const finalPriceOverride = quote.finalPriceOverride;

  logs.push(`Máquina encontrada: ${JSON.stringify(machine)}`);
  logs.push(`Horas de Impresión Totales: ${totalPrintHours}`);
  logs.push(`Tipo de Tarifa: ${tariffType}`);
  logs.push(`Settings: ${JSON.stringify(settings)}`);
  logs.push(`Costo de Diseño: ${designCost}`);

  let materialCost = 0;
  if (quote.parts && quote.parts.length > 0) {
    for (const part of quote.parts) {
        const material = materials.find(m => m.id === part.materialId);
        const grams = Number(part.materialGrams) || 0;
        if (material && grams > 0) {
          materialCost += (grams / 1000) * material.cost;
        }
    }
  }
  logs.push(`Costo de material calculado: ${materialCost}`);

  if (!machine || !settings) {
    logs.push(`[AVISO] No hay máquina o configuración para cálculo completo.`);
    const partialBreakdown: CostBreakdown = {
        materialCost,
        machineDepreciationCost: 0, energyCost: 0, laborCost: 0,
        subtotal: materialCost, designCost: 0, totalExtraCosts: 0,
        costSubtotal: materialCost, profitAmount: 0, total: materialCost,
        isManualPrice: false,
    };
    return { breakdown: totalPrintHours > 0 ? null : partialBreakdown, logs };
  }
  
  const machineDepreciationCost = machine.costPerHour * totalPrintHours;
  logs.push(`Costo de depreciación: ${machineDepreciationCost}`);
  
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
  logs.push(`Subtotal (Producción): ${subtotal}`);
  
  const totalExtraCosts = (quote.extraCosts || []).reduce((acc, cost) => acc + (Number(cost.amount) || 0), 0);
  logs.push(`Costos adicionales: ${totalExtraCosts}`);
  
  const costSubtotal = subtotal + designCost + totalExtraCosts;
  logs.push(`Subtotal de Costo (Producción + Diseño + Extras): ${costSubtotal}`);
  
  let profitAmount: number;
  let total: number;
  const isManualPrice = typeof finalPriceOverride === 'number' && finalPriceOverride >= 0;

  if (isManualPrice) {
    total = finalPriceOverride;
    profitAmount = total - costSubtotal;
    logs.push(`Precio manual aplicado: ${total}`);
    logs.push(`Nueva ganancia calculada: ${profitAmount}`);
  } else {
    profitAmount = costSubtotal * ((settings.profitMargin || 0) / 100);
    total = costSubtotal + profitAmount;
    logs.push(`Monto de ganancia (sobre Subtotal de costo): ${profitAmount}`);
    logs.push(`Total (calculado): ${total}`);
  }

  const breakdown: CostBreakdown = {
    materialCost,
    machineDepreciationCost,
    energyCost,
    laborCost,
    subtotal,
    designCost,
    totalExtraCosts,
    costSubtotal,
    profitAmount,
    total,
    isManualPrice
  };

  logs.push(`Desglose final: ${JSON.stringify(breakdown)}`);
  logs.push("--- FIN DEL CÁLCULO ---");

  return { breakdown, logs };
}
