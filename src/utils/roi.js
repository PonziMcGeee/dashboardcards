// Cálculo de ROI/beneficio cuando una venta está vinculada a la compra de origen (sale.purchaseId).

export function getPurchaseROI(purchase, sales) {
  const linked = sales.filter(s => s.purchaseId === purchase.id);
  const soldQty = linked.reduce((sum, s) => sum + s.quantity, 0);
  const revenue = linked.reduce((sum, s) => sum + s.total, 0);
  const costOfSold = purchase.price * Math.min(soldQty, purchase.quantity);
  const profit = revenue - costOfSold;
  const roiPct = costOfSold > 0 ? (profit / costOfSold) * 100 : null;
  const remainingQty = Math.max(purchase.quantity - soldQty, 0);
  return { soldQty, revenue, costOfSold, profit, roiPct, remainingQty, linkedCount: linked.length };
}

export function getSaleProfit(sale, purchases) {
  if (!sale.purchaseId) return null;
  const purchase = purchases.find(p => p.id === sale.purchaseId);
  if (!purchase) return null;
  const cost = purchase.price * sale.quantity;
  const profit = sale.total - cost;
  const roiPct = cost > 0 ? (profit / cost) * 100 : null;
  return { purchase, cost, profit, roiPct };
}

// Unidades de una compra que aún no están vinculadas a ninguna venta.
// excludeSaleId permite recalcular al editar una venta ya vinculada (sin descontarse a sí misma).
export function getRemainingQty(purchase, sales, excludeSaleId = null) {
  const soldQty = sales
    .filter(s => s.purchaseId === purchase.id && s.id !== excludeSaleId)
    .reduce((sum, s) => sum + s.quantity, 0);
  return Math.max(purchase.quantity - soldQty, 0);
}
