import React, { useState, useEffect } from 'react';
import { PantryItem, CategoryType, LocationType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { X, Plus, Save } from 'lucide-react';

interface AddPantryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PantryItem, 'id'> | PantryItem) => void;
  initialItem?: PantryItem | null;
}

export const AddPantryItemModal: React.FC<AddPantryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('Produce');
  const [location, setLocation] = useState<LocationType>('Fridge');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pack');
  const [estimatedPcs, setEstimatedPcs] = useState('');
  const [hasNoExpiration, setHasNoExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-07-23');
  const [price, setPrice] = useState(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setLocation(initialItem.location);
      setQuantity(initialItem.quantity);
      setUnit(initialItem.unit || 'pack');
      setEstimatedPcs(initialItem.estimatedPcs || '');
      setHasNoExpiration(!initialItem.expirationDate);
      setExpirationDate(initialItem.expirationDate || '');
      setPurchaseDate(initialItem.purchaseDate || '2026-07-23');
      setPrice(initialItem.price);
      setNotes(initialItem.notes || '');
    } else {
      setName('');
      setCategory('Produce');
      setLocation('Fridge');
      setQuantity(1);
      setUnit('pack');
      setEstimatedPcs('');
      setHasNoExpiration(false);
      // Default exp date 7 days from now
      const d = new Date('2026-07-23T00:00:00');
      d.setDate(d.getDate() + 7);
      setExpirationDate(d.toISOString().split('T')[0]);
      setPurchaseDate('2026-07-23');
      setPrice(60);
      setNotes('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalExpDate = hasNoExpiration ? undefined : (expirationDate || undefined);

    if (initialItem) {
      onSave({
        ...initialItem,
        name: name.trim(),
        category,
        location,
        quantity,
        unit: unit.trim() || 'pack',
        estimatedPcs: estimatedPcs.trim() || undefined,
        expirationDate: finalExpDate,
        purchaseDate,
        price,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        name: name.trim(),
        category,
        location,
        quantity,
        unit: unit.trim() || 'pack',
        estimatedPcs: estimatedPcs.trim() || undefined,
        expirationDate: finalExpDate,
        purchaseDate,
        price,
        lowStockThreshold: 1,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const categories: CategoryType[] = [
    'Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Pantry & Grains',
    'Bakery',
    'Frozen',
    'Snacks & Sweets',
    'Beverages',
    'Condiments & Spices',
    'Household & Personal',
  ];

  const locations: LocationType[] = ['Fridge', 'Freezer', 'Pantry', 'Spice Cabinet'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`${theme.modalBg} w-full max-w-md rounded-[2.5rem] shadow-2xl border ${theme.cardBorder} overflow-hidden`}>
        <div className={`p-6 ${theme.modalHeaderBg} flex items-center justify-between`}>
          <h3 className="text-base font-bold">
            {initialItem ? 'Edit Pantry Item' : 'Add New Pantry Item'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Item Name *</label>
            <input
              type="text"
              placeholder="e.g. Organic Greek Yogurt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Storage Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationType)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-800 focus:outline-none font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-800 focus:outline-none font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setQuantity(isNaN(val) || val < 1 ? 1 : Math.max(1, Math.round(val)));
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Unit</label>
              <input
                type="text"
                placeholder="pack, kg, L, box"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Est. Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Estimated or Accurate Pcs (Count) <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 12 Accurate Pcs, 6 Approx Pcs, 24 Pcs"
              value={estimatedPcs}
              onChange={(e) => setEstimatedPcs(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-2xl focus:outline-none font-medium text-xs bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">Expiration Date</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-700 font-bold">
                  <input
                    type="checkbox"
                    checked={hasNoExpiration}
                    onChange={(e) => setHasNoExpiration(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 w-3 h-3"
                  />
                  <span>No Expiry / Optional</span>
                </label>
              </div>
              <input
                type="date"
                disabled={hasNoExpiration}
                value={hasNoExpiration ? '' : expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium ${
                  hasNoExpiration ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Notes / Brand</label>
            <input
              type="text"
              placeholder="e.g. Pasture raised, unopened"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-md shadow-emerald-200 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-white" />
              <span>{initialItem ? 'Update Item' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
