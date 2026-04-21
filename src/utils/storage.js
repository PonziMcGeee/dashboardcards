const KEYS = {
  purchases: 'cardtracker_purchases',
  sales: 'cardtracker_sales',
};

export function loadData(key) {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveData(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data));
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
