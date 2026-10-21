import React, { useState } from 'react';
import { ShoppingItem, CategoryType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { getMarketSearchUrl } from '../data/marketProducts';
import confetti from 'canvas-confetti';
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Store, 
  DollarSign, 
  Tag, 
  Sparkles, 
  ArrowLeft,
  AlertCircle,
  Clock,
  Layers,
  Globe,
  ExternalLink,
  ChevronDown,
  Zap,
  Copy,
  Check
} from 'lucide-react';

interface ShoppingListViewProps {
  shoppingItems: ShoppingItem[];
  spentThisMonth: number;
  monthlyTarget: number;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onTogglePurchased: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onFinishShoppingTrip: () => number;
  onOpenOnlineStores?: () => void;
}

const COMMON_STAPLES: { name: string; category: CategoryType; price: number; unit: string }[] = [
  { name: 'Fresh Milk (1L)', category: 'Dairy & Eggs', price: 68, unit: 'pouch' },
  { name: 'Brown Bread', category: 'Bakery', price: 45, unit: 'pack' },
  { name: 'Farm Fresh Eggs (6 pcs)', category: 'Dairy & Eggs', price: 55, unit: 'box' },
  { name: 'Ripe Bananas (1 Dozen)', category: 'Produce', price: 60, unit: 'pack' },
  { name: 'Tomatoes (1 kg)', category: 'Produce', price: 40, unit: 'kg' },
  { name: 'Onions (1 kg)', category: 'Produce', price: 35, unit: 'kg' },
  { name: 'Potatoes (1 kg)', category: 'Produce', price: 30, unit: 'kg' },
  { name: 'Amul Butter (100g)', category: 'Dairy & Eggs', price: 58, unit: 'pack' },
  { name: 'Curd / Dahi (400g)', category: 'Dairy & Eggs', price: 35, unit: 'cup' },
  { name: 'Cold Pressed Mustard/Olive Oil', category: 'Condiments & Spices', price: 190, unit: 'bottle' },
  { name: 'Basmati Rice (1 kg)', category: 'Pantry & Grains', price: 110, unit: 'kg' },
  { name: 'Instant Coffee (50g)', category: 'Beverages', price: 160, unit: 'bottle' },
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingItems,
  spentThisMonth,
  monthlyTarget,
  onAddItem,
  onTogglePurchased,
  onDeleteItem,
  onFinishShoppingTrip,
  onOpenOnlineStores,
}) => {
  const { theme } = useTheme();
  const [isInStoreMode, setIsInStoreMode] = useState(false);
  const [activeMarketDropdown, setActiveMarketDropdown] = useState<string | null>(null);
  const [showCartOptimizer, setShowCartOptimizer] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryType>('Produce');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pack');
  const [newItemPcs, setNewItemPcs] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(60);
  const [newItemPriority, setNewItemPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newItemAisle, setNewItemAisle] = useState('');

  // Calculations
  const pendingItems = shoppingItems.filter((i) => !i.isPurchased);
  const purchasedItems = shoppingItems.filter((i) => i.isPurchased);

  const pendingTotal = pendingItems.reduce((acc, curr) => acc + curr.estimatedPrice * curr.quantity, 0);
  const purchasedTotal = purchasedItems.reduce((acc, curr) => acc + curr.estimatedPrice * curr.quantity, 0);
  const grandTotal = pendingTotal + purchasedTotal;

  const remainingBudget = Math.max(0, monthlyTarget - spentThisMonth);
  const isOverBudgetRisk = pendingTotal > remainingBudget;

  const formatQuantity = (qty: number, unit: string) => {
    const unitLower = (unit || 'pcs').toLowerCase().trim();
    const discreteUnits = ['pcs', 'pc', 'pack', 'packs', 'bottle', 'bottles', 'item', 'items', 'box', 'boxes', 'can', 'cans', 'pouch', 'pouches', 'slice', 'slices', 'unit', 'units'];
    if (discreteUnits.includes(unitLower) || Number.isInteger(qty)) {
      return Math.max(1, Math.round(qty));
    }
    return Number(qty.toFixed(1));
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const finalQty = Math.max(1, Math.round(newItemQty));
    onAddItem({
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: finalQty,
      unit: newItemUnit.trim() || 'pack',
      estimatedPcs: newItemPcs.trim() || undefined,
      estimatedPrice: newItemPrice,
      priority: newItemPriority,
      aisle: newItemAisle.trim() || undefined,
    });
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPcs('');
  };

  const handleAddStaple = (staple: typeof COMMON_STAPLES[0]) => {
    onAddItem({
      name: staple.name,
      category: staple.category,
      quantity: 1,
      unit: staple.unit,
      estimatedPrice: staple.price,
      priority: 'medium',
    });
  };

  const handleCopyListToClipboard = () => {
    if (shoppingItems.length === 0) return;
    const text = [
      '🛒 *FreshCart Smart Grocery List*',
      `Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      '',
      '📋 *Items to Buy:*',
      ...pendingItems.map((item, i) => `${i + 1}. [ ] ${item.name} (${item.quantity} ${item.unit}) - ~₹${(item.estimatedPrice * item.quantity).toFixed(0)}`),
      ...(purchasedItems.length > 0 ? [
        '',
        '✅ *Already Picked / In Cart:*',
        ...purchasedItems.map((item) => `• [x] ${item.name} (${item.quantity} ${item.unit})`)
      ] : []),
      '',
      `💰 *Estimated Total:* ₹${grandTotal.toFixed(0)}`,
      'Created with FreshCart'
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  const handleCompleteTrip = () => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const movedCount = onFinishShoppingTrip();
    if (isInStoreMode && movedCount > 0) {
      setIsInStoreMode(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Top Banner: In-Store Mode Switcher & Cost Summary */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-[2rem] p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Smart Grocery Cart</h2>
            </div>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              {pendingItems.length} items to pick • {purchasedItems.length} picked • ₹{pendingTotal.toFixed(0)} estimated remaining
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
            {shoppingItems.length > 0 && (
              <button
                onClick={handleCopyListToClipboard}
                className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white text-xs font-black px-3.5 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 border border-white/20 backdrop-blur-sm active:scale-95"
                title="Copy formatted checklist to clipboard"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied! 📋</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Share List</span>
                  </>
                )}
              </button>
            )}

            {onOpenOnlineStores && (
              <button
                onClick={onOpenOnlineStores}
                className="flex-1 sm:flex-none bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black px-4 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border border-emerald-300 active:scale-95"
              >
                <Globe className="w-4 h-4 text-slate-950" />
                <span>Online Markets</span>
              </button>
            )}

            {purchasedItems.length > 0 && (
              <button
                onClick={handleCompleteTrip}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-100 text-slate-950 text-xs font-black px-5 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 animate-bounce active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Finish Trip ({purchasedItems.length} to Pantry)</span>
              </button>
            )}

            <button
              onClick={() => setIsInStoreMode(!isInStoreMode)}
              className={`flex-1 sm:flex-none text-xs font-black px-5 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                isInStoreMode
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-indigo-900/80 hover:bg-indigo-900 text-white border border-indigo-400/30'
              }`}
            >
              {isInStoreMode ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Exit Store Mode</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-emerald-300" />
                  <span>In-Store Shopping Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shopping Trip Progress Bar */}
        {shoppingItems.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
              <span>Cart Progress ({purchasedItems.length} of {shoppingItems.length} picked)</span>
              <span>{Math.round((purchasedItems.length / shoppingItems.length) * 100)}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-300 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(purchasedItems.length / shoppingItems.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Budget Warning if over budget */}
        {isOverBudgetRisk && (
          <div className="bg-rose-950/90 border border-rose-700 text-rose-200 text-xs p-3.5 rounded-2xl flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              Shopping list estimated total (₹{pendingTotal.toFixed(0)}) exceeds remaining monthly budget (₹{remainingBudget.toFixed(0)}).
            </span>
          </div>
        )}
      </div>

      {/* 1-Click Quick Staples Restock Bar */}
      <div className={`${theme.cardBg} p-4 rounded-[2rem] border ${theme.cardBorder} shadow-xs space-y-2.5`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider ${theme.isDark ? 'text-purple-300' : 'text-emerald-800'} flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Quick Staples Restock:</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Tap to add instantly</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {COMMON_STAPLES.map((staple) => (
            <button
              key={staple.name}
              onClick={() => handleAddStaple(staple)}
              className={`text-xs font-bold px-3 py-1.5 rounded-2xl whitespace-nowrap transition-all border flex items-center gap-1 active:scale-95 ${
                theme.isDark 
                  ? 'bg-slate-800 hover:bg-purple-900/60 border-purple-800/60 text-slate-200 hover:text-white' 
                  : 'bg-emerald-50/70 hover:bg-emerald-600 hover:text-white text-emerald-900 border-emerald-200/80 shadow-2xs'
              }`}
            >
              <Plus className="w-3 h-3 text-emerald-500 group-hover:text-white" />
              <span>{staple.name}</span>
              <span className="text-[10px] opacity-75 font-semibold">₹{staple.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= IN-STORE SHOPPING MODE ================= */}
      {isInStoreMode ? (
        <div className="space-y-6 bg-emerald-50/50 p-5 sm:p-7 rounded-[2rem] border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                In-Store Focus Mode
              </span>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Tap items as you put them in your real cart!
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Cart Tally:</span>
              <span className="text-xl font-bold text-emerald-700">₹{purchasedTotal.toFixed(0)}</span>
            </div>
          </div>

          {shoppingItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">
              Your shopping list is empty! Add items below.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Remaining Items to Buy */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  To Buy ({pendingItems.length})
                </h3>
                {pendingItems.length === 0 ? (
                  <div className="bg-emerald-100/60 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-950 text-xs font-bold">
                    🎉 All items checked! Click "Finish Trip" above to add them to your Pantry.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {pendingItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onTogglePurchased(item.id)}
                        className="w-full bg-white hover:bg-emerald-50/60 border-2 border-emerald-100 hover:border-emerald-400 rounded-2xl p-4 flex items-center justify-between text-left transition-all shadow-2xs group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-7 h-7 rounded-full border-2 border-slate-300 group-hover:border-emerald-600 flex items-center justify-center text-transparent group-hover:text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900">{item.name}</span>
                              {item.priority === 'high' && (
                                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                                  MUST BUY
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              {item.quantity} {item.unit} • {item.aisle || item.category}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-slate-900">
                            ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Already in Cart Section */}
              {purchasedItems.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-emerald-100">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> In Cart ({purchasedItems.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {purchasedItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onTogglePurchased(item.id)}
                        className="w-full bg-white/80 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-left opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 line-through">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= STANDARD SHOPPING LIST MODE ================= */
        <div className="space-y-6">
          {/* Quick Add Form */}
          <form
            onSubmit={handleQuickAddSubmit}
            className={`${theme.cardBg} p-6 rounded-[2rem] border ${theme.cardBorder} shadow-sm space-y-4`}
          >
            <div className={`text-xs font-bold ${theme.textAccent} flex items-center gap-1.5 uppercase tracking-wider`}>
              <Plus className="w-4 h-4" />
              <span>Add Item to Shopping List</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Item name (e.g. Oat Milk, Bananas)..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 border rounded-2xl focus:outline-none ${theme.inputBg} ${theme.inputBorder} font-medium`}
                  required
                />
              </div>

              <div>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as CategoryType)}
                  className={`w-full text-xs px-3 py-2.5 border rounded-2xl ${theme.inputBg} ${theme.inputBorder} font-bold focus:outline-none`}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  step="1"
                  title="Quantity"
                  value={newItemQty}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (isNaN(parsed) || parsed < 1) {
                      setNewItemQty(1);
                    } else {
                      setNewItemQty(Math.max(1, Math.round(parsed)));
                    }
                  }}
                  className={`w-16 text-xs px-2.5 py-2.5 border rounded-2xl font-bold text-center focus:outline-none ${theme.inputBg} ${theme.inputBorder}`}
                />
                <input
                  type="text"
                  placeholder="unit"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className={`w-16 text-xs px-2 py-2.5 border rounded-2xl font-medium focus:outline-none ${theme.inputBg} ${theme.inputBorder}`}
                />
                <input
                  type="text"
                  placeholder="Est/Accurate Pcs"
                  value={newItemPcs}
                  onChange={(e) => setNewItemPcs(e.target.value)}
                  className={`w-28 text-xs px-2 py-2.5 border rounded-2xl font-medium focus:outline-none ${theme.inputBg} ${theme.inputBorder}`}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    className={`w-full text-xs pl-7 pr-2 py-2.5 border rounded-2xl font-bold focus:outline-none ${theme.inputBg} ${theme.inputBorder}`}
                  />
                </div>
                <button
                  type="submit"
                  className={`${theme.primaryBtn} text-xs font-extrabold px-5 py-2.5 rounded-2xl transition-all shadow-md whitespace-nowrap`}
                >
                  Add Item
                </button>
              </div>
            </div>
          </form>

          {/* Smart Cart Splitter & Market Optimizer */}
          {pendingItems.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/5 rounded-[2rem] border border-amber-300/80 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-2xs">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      Smart Multi-Market Cart Splitter
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Split cart between Blinkit (Dairy/Produce) & Zepto (Snacks/Pantry) to save ~₹120 in delivery & price differences!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCartOptimizer(!showCartOptimizer)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 self-start sm:self-auto border border-amber-300 whitespace-nowrap"
                >
                  <span>{showCartOptimizer ? 'Hide Optimizer' : 'Optimize Cart'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-950 transition-transform ${showCartOptimizer ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showCartOptimizer && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between text-slate-700 font-bold border-b border-slate-100 pb-2">
                    <span>Estimated Cart Comparison:</span>
                    <span className="text-emerald-700 font-extrabold">Best Split Savings: ~₹120 OFF</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between font-extrabold text-amber-950">
                        <span>Cart 1: Blinkit Quick (10 min)</span>
                        <span>₹{(pendingTotal * 0.55).toFixed(0)}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Best for Milk, Eggs, Fresh Vegetables & Bread
                      </p>
                    </div>

                    <div className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-200 space-y-1">
                      <div className="flex items-center justify-between font-extrabold text-indigo-950">
                        <span>Cart 2: Zepto / Instamart</span>
                        <span>₹{(pendingTotal * 0.45).toFixed(0)}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Best for Chips, Chocolates, Atta, Oil & Detergents
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Click store buttons on individual items below to open live app searches!
                    </span>
                    {onOpenOnlineStores && (
                      <button
                        onClick={onOpenOnlineStores}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <span>View Online Markets Directory →</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List of Pending Items */}
          <div className={`${theme.cardBg} rounded-[2rem] border ${theme.cardBorder} p-6 shadow-sm space-y-4`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme.isDark ? 'border-purple-900/50' : 'border-slate-100'}`}>
              <h3 className={`text-sm font-bold ${theme.textPrimary} flex items-center gap-2`}>
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                <span>Items Needed ({pendingItems.length})</span>
              </h3>
              <span className={`text-xs ${theme.textSecondary} font-medium`}>
                Subtotal: <span className={`font-bold ${theme.isDark ? 'text-purple-300' : 'text-emerald-900'}`}>₹{pendingTotal.toFixed(0)}</span>
              </span>
            </div>

            {pendingItems.length === 0 ? (
              <div className={`text-center py-8 ${theme.textSecondary} text-xs font-medium`}>
                No pending items on your shopping list!
              </div>
            ) : (
              <div className={`divide-y ${theme.isDark ? 'divide-purple-900/40' : 'divide-slate-100'}`}>
                {pendingItems.map((item) => {
                  const isDropdownOpen = activeMarketDropdown === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-3 transition-colors border border-transparent ${
                        theme.isDark ? 'hover:bg-purple-950/40 hover:border-purple-800/40' : 'hover:bg-emerald-50/50 hover:border-emerald-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onTogglePurchased(item.id)}
                          className={`w-5 h-5 rounded-lg border-2 ${theme.isDark ? 'border-purple-600 hover:border-purple-400' : 'border-slate-300 hover:border-emerald-600'} flex items-center justify-center text-transparent hover:text-emerald-500 transition-colors mt-0.5 flex-shrink-0`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${theme.textPrimary}`}>{item.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              theme.isDark ? 'bg-purple-950 text-purple-200 border border-purple-800' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            }`}>
                              {item.category}
                            </span>
                            {item.priority === 'high' && (
                              <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                                HIGH
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] ${theme.textSecondary} font-medium mt-0.5 flex items-center gap-2 flex-wrap`}>
                            <span>{formatQuantity(item.quantity, item.unit)} {item.unit} • Est. ₹{(item.estimatedPrice * item.quantity).toFixed(0)}</span>
                            {item.estimatedPcs && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-md border border-amber-200">
                                {item.estimatedPcs}
                              </span>
                            )}
                            {item.aisle && <span className="text-slate-400">({item.aisle})</span>}
                          </div>
                        </div>
                      </div>

                      {/* Online Store Buy Buttons */}
                      <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                        <a
                          href={getMarketSearchUrl('Blinkit', item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-amber-300/80 shadow-2xs"
                          title={`Buy ${item.name} on Blinkit`}
                        >
                          <span>Blinkit</span>
                          <ExternalLink className="w-3 h-3 text-amber-800" />
                        </a>

                        <a
                          href={getMarketSearchUrl('Zepto', item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-indigo-300/80 shadow-2xs"
                          title={`Buy ${item.name} on Zepto`}
                        >
                          <span>Zepto</span>
                          <ExternalLink className="w-3 h-3 text-indigo-800" />
                        </a>

                        {/* Other Markets Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMarketDropdown(isDropdownOpen ? null : item.id)}
                            className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-slate-300/80"
                          >
                            <span>More Markets</span>
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-1 text-xs">
                              <a
                                href={getMarketSearchUrl('Swiggy Instamart', item.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 hover:bg-orange-50 text-slate-800 font-semibold flex items-center justify-between"
                                onClick={() => setActiveMarketDropdown(null)}
                              >
                                <span>Swiggy Instamart</span>
                                <ExternalLink className="w-3 h-3 text-orange-600" />
                              </a>
                              <a
                                href={getMarketSearchUrl('BigBasket', item.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 hover:bg-emerald-50 text-slate-800 font-semibold flex items-center justify-between"
                                onClick={() => setActiveMarketDropdown(null)}
                              >
                                <span>BigBasket</span>
                                <ExternalLink className="w-3 h-3 text-emerald-600" />
                              </a>
                              <a
                                href={getMarketSearchUrl('Amazon Fresh', item.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 hover:bg-teal-50 text-slate-800 font-semibold flex items-center justify-between"
                                onClick={() => setActiveMarketDropdown(null)}
                              >
                                <span>Amazon Fresh</span>
                                <ExternalLink className="w-3 h-3 text-teal-600" />
                              </a>
                              <a
                                href={getMarketSearchUrl('JioMart', item.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 hover:bg-blue-50 text-slate-800 font-semibold flex items-center justify-between"
                                onClick={() => setActiveMarketDropdown(null)}
                              >
                                <span>JioMart</span>
                                <ExternalLink className="w-3 h-3 text-blue-600" />
                              </a>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors ml-1"
                          title="Remove from list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Purchased Items Section */}
          {purchasedItems.length > 0 && (
            <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Checked Off in Cart ({purchasedItems.length})</span>
                </h3>
                <button
                  onClick={handleCompleteTrip}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-2xl transition-colors shadow-md shadow-emerald-100"
                >
                  Move all to Pantry (₹{purchasedTotal.toFixed(0)})
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {purchasedItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTogglePurchased(item.id)}
                        className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="line-through text-slate-400 font-semibold">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({item.quantity} {item.unit})
                      </span>
                    </div>
                    <span className="font-bold text-slate-600">
                      ₹{(item.estimatedPrice * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
