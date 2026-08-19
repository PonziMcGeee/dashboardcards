import * as XLSX from 'xlsx';
import { getPurchaseROI, getSaleProfit } from './roi';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function exportAllToExcel(purchases = [], sales = [], inventory = []) {
  const wb = XLSX.utils.book_new();

  const purchaseRows = purchases.map(p => {
    const roi = getPurchaseROI(p, sales);
    return {
      Fecha: p.date,
      Descripción: p.description,
      Colección: p.collection || '',
      Categoría: p.category || '',
      Cantidad: p.quantity,
      'Precio unitario (€)': round2(p.price),
      'Total (€)': round2(p.total),
      'Vendido (uds)': roi.soldQty,
      'Restante (uds)': roi.remainingQty,
      'Ingresos vinculados (€)': round2(roi.revenue),
      'Beneficio (€)': round2(roi.profit),
      'ROI (%)': roi.roiPct !== null ? round2(roi.roiPct) : '',
      Notas: p.notes || '',
    };
  });

  const saleRows = sales.map(s => {
    const linked = getSaleProfit(s, purchases);
    return {
      Fecha: s.date,
      Descripción: s.description,
      Colección: s.collection || '',
      Plataforma: s.platform || '',
      Cantidad: s.quantity,
      'Precio unitario (€)': round2(s.price),
      'Total (€)': round2(s.total),
      'Vinculada a compra': linked ? linked.purchase.description : '',
      'Beneficio (€)': linked ? round2(linked.profit) : '',
      'ROI (%)': linked && linked.roiPct !== null ? round2(linked.roiPct) : '',
      Notas: s.notes || '',
    };
  });

  const inventoryRows = inventory.map(i => {
    const invested = (i.purchasePrice || 0) * (i.quantity || 1);
    const current = (i.currentPrice ?? i.purchasePrice ?? 0) * (i.quantity || 1);
    return {
      Fecha: i.date,
      Descripción: i.description,
      Colección: i.collection || '',
      Cantidad: i.quantity,
      'Precio compra (€)': round2(i.purchasePrice),
      'Precio actual (€)': round2(i.currentPrice ?? i.purchasePrice),
      'Invertido (€)': round2(invested),
      'Valor actual (€)': round2(current),
      'Ganancia (€)': round2(current - invested),
      Notas: i.notes || '',
    };
  });

  if (purchaseRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purchaseRows), 'Compras');
  if (saleRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saleRows), 'Ventas');
  if (inventoryRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inventoryRows), 'Inventario');

  if (!purchaseRows.length && !saleRows.length && !inventoryRows.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Info: 'Sin datos todavía' }]), 'Datos');
  }

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `cardtracker-export-${today}.xlsx`);
}
