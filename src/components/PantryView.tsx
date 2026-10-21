import React, { useState, useMemo } from 'react';
import { 
  PantryItem, 
  LocationType, 
  CategoryType 
} from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Refrigerator, 
  Snowflake, 
  Package, 
  Flame, 
  ShoppingCart, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  Grid,
  List,
  CheckCircle2,
  Clock,
  Sparkles,
  ChefHat,
  Tag,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';

interface PantryViewProps {
  pantryItems: PantryItem[];
  getDaysUntilExpiration: (date: string) => number;
  getFreshnessStatus: (date: string) => 'expired' | 'expiring_soon' | 'fresh';
  onUpdateQuantity: (id: string, delta: number) => void;
  onSendToShopping: (item: PantryItem) => void;
  onLogWasted: (item: PantryItem, reason: 'Expired' | 'Spoiled' | 'Leftover' | 'Other') => void;
  onDelete: (id: string) => void;
  onEdit: (item: PantryItem) => void;
  onOpenAddModal: () => void;
  onOpenAiRecipeForItems: () => void;
}

export const PantryView: React.FC<PantryViewProps> = ({
  pantryItems,
  getDaysUntilExpiration,
  getFreshnessStatus,
  onUpdateQuantity,
  onSendToShopping,
  onLogWasted,
  onDelete,
  onEdit,
  onOpenAddModal,
  onOpenAiRecipeForItems,
}) => {
  const { theme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<LocationType | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [freshnessFilter, setFreshnessFilter] = useState<'all' | 'expiring_soon' | 'expired' | 'fresh' | 'low_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'expiration' | 'name' | 'category' | 'quantity'>('expiration');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isDiscreteUnit = (unit?: string) => {
    const u = (unit || 'pcs').toLowerCase().trim();
    return ['pcs', 'pc', 'pack', 'packs', 'bottle', 'bottles', 'item', 'items', 'box', 'boxes', 'can', 'cans', 'pouch', 'pouches', 'slice', 'slices', 'unit', 'units'].includes(u);
  };

  const formatQty = (qty: number, unit?: string) => {
    if (isDiscreteUnit(unit) || Number.isInteger(qty)) {
      return Math.max(1, Math.round(qty));
    }
    return Number(qty.toFixed(1));
  };

  // Inventory Totals & Metrics
  const totalValue = useMemo(() => {
    return pantryItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [pantryItems]);

  const freshCount = useMemo(() => {
    return pantryItems.filter((i) => getFreshnessStatus(i.expirationDate) === 'fresh').length;
  }, [pantryItems, getFreshnessStatus]);

  const expiringCount = useMemo(() => {
    return pantryItems.filter((i) => getFreshnessStatus(i.expirationDate) === 'expiring_soon').length;
  }, [pantryItems, getFreshnessStatus]);

  const expiredCount = useMemo(() => {
    return pantryItems.filter((i) => getFreshnessStatus(i.expirationDate) === 'expired').length;
  }, [pantryItems, getFreshnessStatus]);

  const lowStockCount = useMemo(() => {
    return pantryItems.filter((i) => i.quantity <= 1).length;
  }, [pantryItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return pantryItems
      .filter((item) => {
        if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchNotes) return false;
        }
        if (freshnessFilter !== 'all') {
          if (freshnessFilter === 'low_stock') {
            if (item.quantity > 1) return false;
          } else {
            const status = getFreshnessStatus(item.expirationDate);
            if (freshnessFilter === 'expiring_soon' && status !== 'expiring_soon') return false;
            if (freshnessFilter === 'expired' && status !== 'expired') return false;
            if (freshnessFilter === 'fresh' && status !== 'fresh') return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiration') {
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'category') {
          return a.category.localeCompare(b.category);
        }
        if (sortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        return 0;
      });
  }, [pantryItems, selectedLocation, selectedCategory, searchQuery, freshnessFilter, sortBy, getFreshnessStatus]);

  const locations: { id: LocationType | 'All'; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Storage', icon: <Package className="w-4 h-4" /> },
    { id: 'Fridge', label: 'Fridge', icon: <Refrigerator className="w-4 h-4" /> },
    { id: 'Freezer', label: 'Freezer', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'Pantry', label: 'Pantry', icon: <Package className="w-4 h-4" /> },
    { id: 'Spice Cabinet', label: 'Spice Cabinet', icon: <Flame className="w-4 h-4" /> },
  ];

  const categories: (CategoryType | 'All')[] = [
    'All',
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
      {/* Top High-Craft Inventory KPI Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-3xl border transition-all ${
          theme.isDark 
            ? 'bg-slate-900/90 border-purple-800/60 shadow-lg shadow-purple-950/30' 
            : 'bg-white border-emerald-100 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Items</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${theme.textPrimary}`}>{pantryItems.length}</span>
            <span className="text-xs text-slate-500 font-semibold">in stock</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border transition-all ${
          theme.isDark 
            ? 'bg-slate-900/90 border-purple-800/60 shadow-lg shadow-purple-950/30' 
            : 'bg-white border-emerald-100 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Value</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${theme.textPrimary}`}>₹{totalValue.toFixed(0)}</span>
            <span className="text-[11px] text-slate-500 font-medium">est. worth</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div 
          onClick={() => setFreshnessFilter(freshnessFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${
            expiringCount > 0
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 shadow-xs'
              : theme.isDark ? 'bg-slate-900/90 border-purple-800/60' : 'bg-white border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expiring (3 Days)</span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">{expiringCount}</span>
            <span className="text-xs text-amber-700/80 font-semibold">need cook</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full" 
              style={{ width: `${pantryItems.length > 0 ? (expiringCount / pantryItems.length) * 100 : 0}%` }} 
            />
          </div>
        </div>

        <div 
          onClick={() => setFreshnessFilter(freshnessFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${
            lowStockCount > 0
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 shadow-xs'
              : theme.isDark ? 'bg-slate-900/90 border-purple-800/60' : 'bg-white border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">{lowStockCount}</span>
            <span className="text-xs text-rose-700/80 font-semibold">reorder</span>
          </div>
          <div className="w-full bg-rose-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full" 
              style={{ width: `${pantryItems.length > 0 ? (lowStockCount / pantryItems.length) * 100 : 0}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Expiration Attention Banner if items need attention */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className={`border rounded-[2rem] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
          theme.isDark 
            ? 'bg-orange-950/60 border-orange-800/80 text-orange-100' 
            : 'bg-orange-50 border-orange-200 text-orange-950'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-orange-500/20 text-orange-300 rounded-2xl mt-0.5 sm:mt-0 flex-shrink-0 border border-orange-500/30">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${theme.isDark ? 'text-orange-100' : 'text-orange-950'}`}>Food Expiration Alert</h3>
              <p className={`text-xs mt-0.5 font-medium leading-relaxed ${theme.isDark ? 'text-orange-200/90' : 'text-orange-800/90'}`}>
                You have <span className="font-bold">{expiringCount} item(s) expiring soon</span>
                {expiredCount > 0 && <span> and <span className="font-bold text-rose-500">{expiredCount} expired</span></span>}. Rescue them with AI recipes before they spoil!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAiRecipeForItems}
            className="w-full sm:w-auto text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md shadow-orange-900/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
          >
            <ChefHat className="w-4 h-4" />
            <span>Generate Waste-Zero AI Recipes</span>
          </button>
        </div>
      )}

      {/* Control Bar: Location Tabs & Add Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Location Tabs */}
        <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none p-1.5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xs`}>
          {locations.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            const count = loc.id === 'All' 
              ? pantryItems.length 
              : pantryItems.filter((i) => i.location === loc.id).length;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? theme.navActive
                    : theme.isDark ? 'text-purple-300 hover:bg-purple-900/40 hover:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {loc.icon}
                <span>{loc.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-black/10 text-current'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenAddModal}
          className={`${theme.primaryBtn} text-xs font-extrabold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Search & Detailed Filters */}
      <div className={`${theme.cardBg} p-4 rounded-[2rem] border ${theme.cardBorder} shadow-sm space-y-3`}>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pantry items, categories, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 text-xs border rounded-2xl focus:outline-none ${theme.inputBg} ${theme.inputBorder} font-medium`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Filter:</span>
            <select
              value={freshnessFilter}
              onChange={(e) => setFreshnessFilter(e.target.value as any)}
              className={`text-xs border rounded-2xl px-3 py-2.5 font-bold focus:outline-none ${theme.inputBg} ${theme.inputBorder}`}
            >
              <option value="all">All Items</option>
              <option value="expiring_soon">⏰ Expiring Soon (3 days)</option>
              <option value="low_stock">⚠️ Low Stock (&le; 1 unit)</option>
              <option value="expired">🚨 Expired</option>
              <option value="fresh">✅ Fresh</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-xs border rounded-2xl px-3 py-2.5 ${theme.inputBg} ${theme.inputBorder} font-bold focus:outline-none`}
            >
              <option value="expiration">Sort by Expiration Date</option>
              <option value="name">Sort by Name (A-Z)</option>
              <option value="category">Sort by Category</option>
              <option value="quantity">Sort by Quantity</option>
            </select>
          </div>

          {/* Grid / List Mode */}
          <div className={`hidden sm:flex items-center border rounded-2xl p-1 ${theme.isDark ? 'bg-slate-800 border-purple-800/60' : 'bg-slate-50 border-slate-200'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'grid'
                  ? theme.isDark ? 'bg-purple-600 text-white font-bold' : 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'list'
                  ? theme.isDark ? 'bg-purple-600 text-white font-bold' : 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-2xl whitespace-nowrap transition-all ${
                  isSelected
                    ? theme.isDark ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white shadow-xs'
                    : theme.isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-50 text-slate-600 hover:bg-emerald-100 hover:text-emerald-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item Display Grid / List */}
      {filteredItems.length === 0 ? (
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-[2rem] p-12 text-center space-y-3 shadow-xs`}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Package className="w-7 h-7" />
          </div>
          <h3 className={`text-base font-bold ${theme.textPrimary}`}>No items found</h3>
          <p className={`text-xs ${theme.textSecondary} max-w-sm mx-auto font-medium`}>
            Try resetting your search filters or add a fresh item to your pantry or fridge inventory.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('All');
                setFreshnessFilter('all');
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-2xl transition-all"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenAddModal}
              className={`${theme.primaryBtn} text-xs font-bold px-5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md`}
            >
              <Plus className="w-4 h-4" /> Add Item Now
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const status = getFreshnessStatus(item.expirationDate);
            const daysLeft = getDaysUntilExpiration(item.expirationDate);

            let statusBadge = (
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fresh ({daysLeft}d left)
              </span>
            );

            if (!item.expirationDate) {
              statusBadge = (
                <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-slate-200">
                  <CheckCircle2 className="w-3 h-3 text-slate-500" /> Non-perishable
                </span>
              );
            } else if (status === 'expiring_soon') {
              statusBadge = (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {daysLeft === 0 ? 'Expires today!' : `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                </span>
              );
            } else if (status === 'expired') {
              statusBadge = (
                <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Expired ({Math.abs(daysLeft)}d ago)
                </span>
              );
            }

            return (
              <div
                key={item.id}
                className={`${theme.cardBg} rounded-[2rem] border p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-0.5 group relative ${
                  status === 'expired'
                    ? 'border-rose-400/50 bg-rose-950/20'
                    : status === 'expiring_soon'
                    ? 'border-amber-400/50 bg-amber-950/20'
                    : `${theme.cardBorder}`
                }`}
              >
                <div>
                  {/* Top Category & Location Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-xl border ${
                      theme.isDark 
                        ? 'text-purple-200 bg-purple-950/80 border-purple-800' 
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}>
                      {item.location} • {item.category}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(item)}
                        className={`p-1.5 rounded-xl transition-colors ${theme.isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className={`p-1.5 rounded-xl transition-colors ${theme.isDark ? 'text-slate-300 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Freshness */}
                  <h4 className={`text-base font-black ${theme.textPrimary} line-clamp-1 mb-1.5`}>{item.name}</h4>
                  <div className="mb-3">{statusBadge}</div>

                  {item.notes && (
                    <p className={`text-xs ${theme.textSecondary} italic mb-3 line-clamp-2`}>"{item.notes}"</p>
                  )}

                  {/* Price & Purchase Date */}
                  <div className={`grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-2xl border ${
                    theme.isDark 
                      ? 'bg-slate-800/80 border-purple-800/50 text-slate-300' 
                      : 'bg-emerald-50/50 border-emerald-100 text-slate-500'
                  }`}>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Total Val.</span>
                      <span className={`font-black ${theme.isDark ? 'text-purple-200' : 'text-emerald-900'}`}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Bought</span>
                      <span className={`font-semibold ${theme.textPrimary}`}>{item.purchaseDate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Quantity Controls & Quick Actions */}
                <div className={`pt-3 border-t ${theme.isDark ? 'border-purple-900/50' : 'border-slate-100'} space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${theme.textSecondary} font-bold`}>Qty in Stock:</span>
                    <div className={`flex items-center gap-1.5 p-1 rounded-2xl border ${theme.isDark ? 'bg-slate-800 border-purple-800/60' : 'bg-slate-100 border-slate-200'}`}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, isDiscreteUnit(item.unit) ? -1 : -0.5)}
                        className={`w-6 h-6 rounded-xl font-bold flex items-center justify-center text-xs shadow-2xs ${
                          theme.isDark ? 'bg-purple-900 text-white hover:bg-purple-800' : 'bg-white text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        -
                      </button>
                      <span className={`text-xs font-black px-2 ${theme.textPrimary}`}>
                        {formatQty(item.quantity, item.unit)} {item.unit}
                        {item.estimatedPcs && (
                          <span className="text-[10px] text-amber-700 font-extrabold ml-1 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            ({item.estimatedPcs})
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, isDiscreteUnit(item.unit) ? 1 : 0.5)}
                        className="w-6 h-6 rounded-xl bg-white text-slate-800 font-bold hover:bg-slate-200 flex items-center justify-center text-xs shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Replenish & Waste Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onSendToShopping(item)}
                      className="w-full text-[11px] bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold py-2 rounded-2xl border border-emerald-200 flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95"
                      title="Add item to shopping list"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Buy More
                    </button>
                    <button
                      onClick={() => onLogWasted(item, status === 'expired' ? 'Expired' : 'Spoiled')}
                      className="w-full text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200 text-slate-600 font-bold py-2 rounded-2xl border border-slate-200 flex items-center justify-center gap-1 transition-all active:scale-95"
                      title="Log item as spoiled or wasted"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Log Waste
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode Table */
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/80 border-b border-emerald-100 text-emerald-900 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-5">Item Name</th>
                  <th className="py-3.5 px-5">Location & Category</th>
                  <th className="py-3.5 px-5">Expiration</th>
                  <th className="py-3.5 px-5">Quantity</th>
                  <th className="py-3.5 px-5">Est. Value</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.map((item) => {
                  const status = getFreshnessStatus(item.expirationDate);
                  const daysLeft = getDaysUntilExpiration(item.expirationDate);

                  return (
                    <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        {item.notes && <div className="text-[11px] text-slate-400 italic">{item.notes}</div>}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        <span className="bg-emerald-100/70 text-emerald-900 px-2.5 py-0.5 rounded-lg font-bold">
                          {item.location}
                        </span>
                        <span className="text-slate-400 ml-1.5">• {item.category}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        {status === 'expired' ? (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Expired ({Math.abs(daysLeft)}d ago)
                          </span>
                        ) : status === 'expiring_soon' ? (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">
                            {daysLeft} days left
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, isDiscreteUnit(item.unit) ? -1 : -0.5)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-900 px-1">
                            {formatQty(item.quantity, item.unit)} {item.unit}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, isDiscreteUnit(item.unit) ? 1 : 0.5)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSendToShopping(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
                            title="Add to Shopping List"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
