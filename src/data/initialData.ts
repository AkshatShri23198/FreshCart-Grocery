import { PantryItem, ShoppingItem, WasteLog } from '../types';

// Default initial data is now empty so users can start fresh with their own items
export const INITIAL_PANTRY_ITEMS: PantryItem[] = [];
export const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [];
export const INITIAL_WASTE_LOGS: WasteLog[] = [];

// Utility to generate dates relative to today
const getDateStr = (offsetDays: number): string => {
  const d = new Date('2026-07-23T00:00:00');
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Optional sample demo data if the user wants to populate sample items
export const SAMPLE_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'p1',
    name: 'Amul Taaza Toned Milk',
    category: 'Dairy & Eggs',
    location: 'Fridge',
    quantity: 1,
    unit: 'litre',
    expirationDate: getDateStr(2),
    purchaseDate: getDateStr(-1),
    price: 66,
    lowStockThreshold: 1,
    notes: 'Pasteurised toned milk',
    isOpened: true,
  },
  {
    id: 'p2',
    name: 'Fresh Strawberries (Mahabaleshwar)',
    category: 'Produce',
    location: 'Fridge',
    quantity: 1,
    unit: 'box',
    expirationDate: getDateStr(1),
    purchaseDate: getDateStr(-3),
    price: 149,
    lowStockThreshold: 1,
    notes: 'Eat or blend into smoothie soon',
    isOpened: true,
  },
  {
    id: 'p3',
    name: 'Aashirvaad Shuddh Chakki Atta',
    category: 'Pantry & Grains',
    location: 'Pantry',
    quantity: 5,
    unit: 'kg',
    expirationDate: getDateStr(90),
    purchaseDate: getDateStr(-10),
    price: 260,
    lowStockThreshold: 2,
    notes: '100% whole wheat flour',
    isOpened: true,
  },
];

export const SAMPLE_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 's1',
    name: 'Farm Fresh Eggs (10 Pack)',
    category: 'Dairy & Eggs',
    quantity: 1,
    unit: 'pack',
    estimatedPrice: 85,
    isPurchased: false,
    priority: 'high',
  },
];

export const SAMPLE_WASTE_LOGS: WasteLog[] = [];
