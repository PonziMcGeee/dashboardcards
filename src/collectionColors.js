export const COLOR_PALETTE = [
  { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  { dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700' },
  { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  { dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700' },
  { dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
  { dot: 'bg-pink-400',   badge: 'bg-pink-100 text-pink-700' },
  { dot: 'bg-teal-400',   badge: 'bg-teal-100 text-teal-700' },
  { dot: 'bg-red-400',    badge: 'bg-red-100 text-red-700' },
];

export function getCollectionColor(collections, name) {
  const col = collections.find(c => c.name === name);
  if (!col) return { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' };
  return COLOR_PALETTE[col.colorIndex % COLOR_PALETTE.length];
}
