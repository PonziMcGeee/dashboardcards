import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as XLSX from 'xlsx';
import { exportAllToExcel } from './exportExcel';

// exportAllToExcel escribe el .xlsx directamente al directorio de trabajo
// actual (vía XLSX.writeFile), así que para probarlo sin ensuciar el repo
// nos movemos a una carpeta temporal antes de cada test y la borramos después.
let originalCwd;
let tmpDir;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = mkdtempSync(join(tmpdir(), 'cardtracker-export-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(tmpDir, { recursive: true, force: true });
});

function readGeneratedWorkbook() {
  const [file] = readdirSync(tmpDir).filter(f => f.endsWith('.xlsx'));
  expect(file).toBeDefined();
  return XLSX.readFile(join(tmpDir, file));
}

describe('exportAllToExcel', () => {
  it('crea una hoja por cada tipo de dato con contenido, y omite las vacías', () => {
    const purchases = [{ id: 'p1', date: '2026-01-01', description: 'Sobre', quantity: 1, price: 5, total: 5 }];
    const sales = [];
    const inventory = [];

    exportAllToExcel(purchases, sales, inventory);

    const wb = readGeneratedWorkbook();
    expect(wb.SheetNames).toContain('Compras');
    expect(wb.SheetNames).not.toContain('Ventas');
    expect(wb.SheetNames).not.toContain('Inventario');
    expect(wb.SheetNames).not.toContain('Datos');
  });

  it('sin ningún dato, genera una hoja de aviso en vez de un libro vacío', () => {
    exportAllToExcel([], [], []);
    const wb = readGeneratedWorkbook();
    expect(wb.SheetNames).toEqual(['Datos']);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['Datos']);
    expect(rows[0].Info).toBe('Sin datos todavía');
  });

  it('incluye las columnas de ROI calculadas en la hoja de Compras', () => {
    const purchases = [{ id: 'p1', date: '2026-01-01', description: 'Caja', collection: 'SV', category: 'Caja', quantity: 2, price: 50, total: 100, notes: '' }];
    const sales = [{ id: 's1', purchaseId: 'p1', date: '2026-01-05', quantity: 1, total: 70 }];

    exportAllToExcel(purchases, sales, []);

    const wb = readGeneratedWorkbook();
    const [row] = XLSX.utils.sheet_to_json(wb.Sheets['Compras']);
    expect(row['Vendido (uds)']).toBe(1);
    expect(row['Restante (uds)']).toBe(1);
    expect(row['Beneficio (€)']).toBe(20); // 70 - (1 * 50)
    expect(row['ROI (%)']).toBe(40); // 20/50 * 100
  });

  it('en la hoja de Ventas, indica de qué compra procede una venta vinculada', () => {
    const purchases = [{ id: 'p1', date: '2026-01-01', description: 'Caja original', quantity: 1, price: 50, total: 50 }];
    const sales = [{ id: 's1', purchaseId: 'p1', date: '2026-01-05', description: 'Reventa', quantity: 1, price: 70, total: 70 }];

    exportAllToExcel(purchases, sales, []);

    const wb = readGeneratedWorkbook();
    const [row] = XLSX.utils.sheet_to_json(wb.Sheets['Ventas']);
    expect(row['Vinculada a compra']).toBe('Caja original');
    expect(row['Beneficio (€)']).toBe(20);
  });

  it('una venta sin vincular no rompe el export y deja esas columnas vacías', () => {
    const sales = [{ id: 's1', purchaseId: null, date: '2026-01-05', description: 'Suelta', quantity: 1, price: 10, total: 10 }];
    exportAllToExcel([], sales, []);
    const wb = readGeneratedWorkbook();
    const [row] = XLSX.utils.sheet_to_json(wb.Sheets['Ventas']);
    expect(row['Vinculada a compra']).toBe('');
    expect(row['Beneficio (€)']).toBe('');
  });

  it('calcula invertido/valor actual/ganancia en la hoja de Inventario', () => {
    const inventory = [{ date: '2026-01-01', description: 'Booster box', quantity: 3, purchasePrice: 40, currentPrice: 55, notes: '' }];
    exportAllToExcel([], [], inventory);
    const wb = readGeneratedWorkbook();
    const [row] = XLSX.utils.sheet_to_json(wb.Sheets['Inventario']);
    expect(row['Invertido (€)']).toBe(120); // 3 * 40
    expect(row['Valor actual (€)']).toBe(165); // 3 * 55
    expect(row['Ganancia (€)']).toBe(45);
  });

  it('inventario sin precio actual usa el precio de compra como valor actual', () => {
    const inventory = [{ date: '2026-01-01', description: 'Sin actualizar', quantity: 1, purchasePrice: 30, currentPrice: undefined, notes: '' }];
    exportAllToExcel([], [], inventory);
    const wb = readGeneratedWorkbook();
    const [row] = XLSX.utils.sheet_to_json(wb.Sheets['Inventario']);
    expect(row['Precio actual (€)']).toBe(30);
    expect(row['Ganancia (€)']).toBe(0);
  });
});
