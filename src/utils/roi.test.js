import { describe, it, expect } from 'vitest';
import { getPurchaseROI, getSaleProfit, getRemainingQty } from './roi';

function purchase(overrides = {}) {
  return { id: 'p1', quantity: 10, price: 5, ...overrides };
}

function sale(overrides = {}) {
  return { id: 's1', purchaseId: 'p1', quantity: 1, total: 10, ...overrides };
}

describe('getPurchaseROI', () => {
  it('sin ventas vinculadas: nada vendido, ROI nulo, todo restante', () => {
    const roi = getPurchaseROI(purchase(), []);
    expect(roi.soldQty).toBe(0);
    expect(roi.revenue).toBe(0);
    expect(roi.profit).toBe(0);
    expect(roi.roiPct).toBeNull();
    expect(roi.remainingQty).toBe(10);
    expect(roi.linkedCount).toBe(0);
  });

  it('venta parcial: calcula coste, beneficio y ROI solo sobre lo vendido', () => {
    // Compra: 10 uds a 5€ = 50€. Vende 4 uds por 8€/ud = 32€.
    const sales = [sale({ quantity: 4, total: 32 })];
    const roi = getPurchaseROI(purchase(), sales);
    expect(roi.soldQty).toBe(4);
    expect(roi.revenue).toBe(32);
    expect(roi.costOfSold).toBe(20); // 4 * 5€
    expect(roi.profit).toBe(12); // 32 - 20
    expect(roi.roiPct).toBeCloseTo(60); // 12/20 * 100
    expect(roi.remainingQty).toBe(6);
  });

  it('varias ventas vinculadas se acumulan', () => {
    const sales = [
      sale({ id: 's1', quantity: 2, total: 16 }),
      sale({ id: 's2', quantity: 3, total: 21 }),
    ];
    const roi = getPurchaseROI(purchase(), sales);
    expect(roi.soldQty).toBe(5);
    expect(roi.revenue).toBe(37);
    expect(roi.linkedCount).toBe(2);
    expect(roi.remainingQty).toBe(5);
  });

  it('venta con pérdida da beneficio y ROI negativos', () => {
    // Compra a 5€/ud, vende 4 uds por 3€/ud = 12€ (coste 20€ → pérdida de 8€)
    const sales = [sale({ quantity: 4, total: 12 })];
    const roi = getPurchaseROI(purchase(), sales);
    expect(roi.profit).toBe(-8);
    expect(roi.roiPct).toBeCloseTo(-40);
  });

  it('ignora ventas vinculadas a otra compra', () => {
    const sales = [sale({ purchaseId: 'otra-compra', quantity: 99, total: 999 })];
    const roi = getPurchaseROI(purchase(), sales);
    expect(roi.soldQty).toBe(0);
    expect(roi.linkedCount).toBe(0);
  });

  it('sobreventa (más unidades vendidas que compradas): no deja coste ni restante negativos', () => {
    // Caso límite: si por lo que sea hay más unidades vinculadas que compradas,
    // el coste no debe superar el valor total de la compra ni el restante bajar de 0.
    const sales = [sale({ quantity: 15, total: 100 })]; // compra solo tiene 10 uds
    const roi = getPurchaseROI(purchase(), sales);
    expect(roi.soldQty).toBe(15);
    expect(roi.costOfSold).toBe(50); // min(15, 10) * 5€, no 15 * 5€
    expect(roi.remainingQty).toBe(0); // nunca negativo
  });
});

describe('getSaleProfit', () => {
  it('venta sin vincular devuelve null', () => {
    expect(getSaleProfit(sale({ purchaseId: null }), [purchase()])).toBeNull();
  });

  it('venta vinculada a una compra que ya no existe devuelve null', () => {
    expect(getSaleProfit(sale({ purchaseId: 'no-existe' }), [purchase()])).toBeNull();
  });

  it('calcula coste, beneficio y ROI de la venta vinculada', () => {
    // Compra a 5€/ud, venta de 2 uds por 22€ total → coste 10€, beneficio 12€
    const result = getSaleProfit(sale({ quantity: 2, total: 22 }), [purchase()]);
    expect(result.cost).toBe(10);
    expect(result.profit).toBe(12);
    expect(result.roiPct).toBeCloseTo(120);
    expect(result.purchase.id).toBe('p1');
  });

  it('venta con pérdida da beneficio negativo', () => {
    const result = getSaleProfit(sale({ quantity: 2, total: 4 }), [purchase()]);
    expect(result.profit).toBe(-6); // 4 - 10
    expect(result.roiPct).toBeCloseTo(-60);
  });
});

describe('getRemainingQty', () => {
  it('sin ventas: quedan todas las unidades', () => {
    expect(getRemainingQty(purchase(), [])).toBe(10);
  });

  it('descuenta las unidades ya vendidas', () => {
    const sales = [sale({ quantity: 3 })];
    expect(getRemainingQty(purchase(), sales)).toBe(7);
  });

  it('nunca baja de 0 aunque se venda de más', () => {
    const sales = [sale({ quantity: 999 })];
    expect(getRemainingQty(purchase(), sales)).toBe(0);
  });

  it('excludeSaleId excluye la propia venta al editarla, sin descontarse dos veces', () => {
    const sales = [sale({ id: 's1', quantity: 3 }), sale({ id: 's2', quantity: 2 })];
    // Editando s1: solo debe contar lo vendido en s2.
    expect(getRemainingQty(purchase(), sales, 's1')).toBe(8);
    // Sin excluir nada: cuentan ambas.
    expect(getRemainingQty(purchase(), sales)).toBe(5);
  });
});
