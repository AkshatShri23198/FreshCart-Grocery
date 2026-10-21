import React, { useState } from 'react';
import { PantryItem, ShoppingItem, CategoryType, LocationType } from '../types';
import { Sparkles, X, Loader2, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface AiQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParsedPantryItems: (items: Omit<PantryItem, 'id'>[]) => void;
  onAddParsedShoppingItems: (items: Omit<ShoppingItem, 'id' | 'isPurchased'>[]) => void;
}

export const AiQuickAddModal: React.FC<AiQuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddParsedPantryItems,
  onAddParsedShoppingItems,
}) => {
  const [rawText, setRawText] = useState('');
  const [destination, setDestination] = useState<'pantry' | 'shopping'>('pantry');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/parse-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          targetDestination: destination,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to parse text');
      }

      const data = await res.json();
      setParsedPreview(data.items || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    const todayStr = '2026-07-23';

    if (destination === 'pantry') {
      const pantryList: Omit<PantryItem, 'id'>[] = parsedPreview.map((i) => {
        const expDays = i.expirationDaysFromNow || 7;
        const d = new Date('2026-07-23T00:00:00');
        d.setDate(d.getDate() + expDays);
        return {
          name: i.name,
          category: (i.category as CategoryType) || 'Pantry & Grains',
          location: (i.location as LocationType) || 'Pantry',
          quantity: i.quantity || 1,
          unit: i.unit || 'pcs',
          expirationDate: d.toISOString().split('T')[0],
          purchaseDate: todayStr,
          price: i.price || 60,
          lowStockThreshold: 1,
          notes: i.notes || undefined,
        };
      });
      onAddParsedPantryItems(pantryList);
    } else {
      const shoppingList: Omit<ShoppingItem, 'id' | 'isPurchased'>[] = parsedPreview.map((i) => ({
        name: i.name,
        category: (i.category as CategoryType) || 'Pantry & Grains',
        quantity: i.quantity || 1,
        unit: i.unit || 'pcs',
        estimatedPrice: i.price || 60,
        priority: 'medium',
        notes: i.notes || undefined,
      }));
      onAddParsedShoppingItems(shoppingList);
    }

    // Reset & close
    setRawText('');
    setParsedPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">AI Smart Receipt & List Parser</h3>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Paste messy notes, text receipts, or written lists below. Gemini AI will automatically categorize, estimate expiration dates, prices, and locations!
          </p>

          {/* Destination Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Add Items To:</span>
            <div className="flex border border-emerald-100 rounded-2xl p-1 bg-emerald-50 text-xs">
              <button
                type="button"
                onClick={() => setDestination('pantry')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  destination === 'pantry' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pantry & Fridge
              </button>
              <button
                type="button"
                onClick={() => setDestination('shopping')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  destination === 'shopping' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-600'
                }`}
              >
                Shopping List
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              rows={4}
              placeholder="e.g.:
- 2 liters toned milk ₹60
- 3 kg Shimla apples
- 1 packet Amul butter ₹270
- 12 farm fresh eggs"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
            />
          </div>

          {/* Parse Button */}
          {!parsedPreview && (
            <button
              onClick={handleParse}
              disabled={isLoading || !rawText.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl transition-colors shadow-md shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Parsing List with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Parse Text List</span>
                </>
              )}
            </button>
          )}

          {errorMsg && <div className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-2xl">{errorMsg}</div>}

          {/* Parsed Preview Table */}
          {parsedPreview && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Parsed {parsedPreview.length} items successfully:
                </span>
                <button
                  onClick={() => setParsedPreview(null)}
                  className="text-[11px] text-slate-500 font-bold hover:underline"
                >
                  Edit Input
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {parsedPreview.map((item, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {item.quantity} {item.unit} • {item.category} ({item.location})
                      </div>
                    </div>
                    <span className="font-bold text-slate-800">₹{(item.price || 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirmAdd}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Add {parsedPreview.length} Items to {destination === 'pantry' ? 'Pantry' : 'Shopping List'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
