import React from 'react';
import { PantryItem, WasteLog, BudgetGoal } from '../types';
import { 
  PieChart, 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck, 
  Clock,
  Layers
} from 'lucide-react';

interface AnalyticsViewProps {
  pantryItems: PantryItem[];
  wasteLogs: WasteLog[];
  budgetGoal: BudgetGoal;
  getDaysUntilExpiration: (date: string) => number;
  getFreshnessStatus: (date: string) => 'expired' | 'expiring_soon' | 'fresh';
  onUpdateBudget: (newGoal: BudgetGoal) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  pantryItems,
  wasteLogs,
  budgetGoal,
  getDaysUntilExpiration,
  getFreshnessStatus,
  onUpdateBudget,
}) => {
  const [isEditingBudget, setIsEditingBudget] = React.useState(false);
  const [targetInput, setTargetInput] = React.useState(budgetGoal.monthlyTarget.toString());

  // Budget Calcs
  const percentSpent = Math.min(100, Math.round((budgetGoal.spentThisMonth / budgetGoal.monthlyTarget) * 100));
  const remainingBudget = Math.max(0, budgetGoal.monthlyTarget - budgetGoal.spentThisMonth);

  // Waste Calcs
  const totalWastedValue = wasteLogs.reduce((acc, curr) => acc + curr.estimatedValue, 0);
  const totalInventoryValue = pantryItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Expiration Timeline Buckets
  const expiringNext3Days = pantryItems.filter((i) => {
    const d = getDaysUntilExpiration(i.expirationDate);
    return d >= 0 && d <= 3;
  });

  const expiringNext7Days = pantryItems.filter((i) => {
    const d = getDaysUntilExpiration(i.expirationDate);
    return d > 3 && d <= 7;
  });

  const expiringLater = pantryItems.filter((i) => {
    const d = getDaysUntilExpiration(i.expirationDate);
    return d > 7;
  });

  const expiredItems = pantryItems.filter((i) => getDaysUntilExpiration(i.expirationDate) < 0);

  // Category Distribution
  const categoryCounts: Record<string, number> = {};
  pantryItems.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget({ ...budgetGoal, monthlyTarget: val });
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Monthly Budget Card */}
        <div className="bg-indigo-600 text-white rounded-[2rem] p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Monthly Budget Goal
            </span>
            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="text-[11px] font-bold text-emerald-300 hover:underline bg-indigo-700 px-3 py-1 rounded-full"
            >
              {isEditingBudget ? 'Cancel' : 'Edit Goal'}
            </button>
          </div>

          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-2 pt-1">
              <span className="text-sm font-bold text-indigo-200">₹</span>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full text-sm font-bold px-3 py-1.5 bg-indigo-700 text-white border border-indigo-500 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="text-xs bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl"
              >
                Save
              </button>
            </form>
          ) : (
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                ₹{budgetGoal.spentThisMonth.toFixed(0)}
                <span className="text-xs font-semibold text-indigo-200 font-normal ml-1">
                  / ₹{budgetGoal.monthlyTarget.toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 mt-1 font-medium">
                ₹{remainingBudget.toFixed(0)} remaining this month
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 bg-indigo-950/50 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all ${
                  percentSpent > 90 ? 'bg-rose-400' : percentSpent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${percentSpent}%` }}
              />
            </div>
            <div className="text-[10px] text-indigo-200 font-bold text-right">{percentSpent}% spent</div>
          </div>
        </div>

        {/* Inventory Value Card */}
        <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Inventory Value
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-emerald-950 tracking-tight">₹{totalInventoryValue.toFixed(0)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{pantryItems.length} total items in stock</p>
          </div>

          <div className="text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-2xl border border-emerald-100 flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Proper storage extends freshness by up to 40%</span>
          </div>
        </div>

        {/* Wasted Value Card */}
        <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Logged Food Waste
            </span>
            <div className="p-2 bg-rose-100 text-rose-800 rounded-2xl">
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-rose-700 tracking-tight">₹{totalWastedValue.toFixed(0)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{wasteLogs.length} items logged as discarded</p>
          </div>

          <div className="text-xs bg-slate-50 text-slate-700 p-2.5 rounded-2xl border border-slate-100 font-bold">
            {wasteLogs.length === 0 ? 'Zero waste logged! Outstanding job!' : 'Use AI Chef to rescue items early!'}
          </div>
        </div>
      </div>

      {/* Expiration Timeline Matrix */}
      <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Upcoming Expiration Timeline</span>
          </h3>
          <span className="text-xs text-slate-500">Sorted by urgency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Urgent 1-3 Days */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Next 1 - 3 Days
              </span>
              <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                {expiringNext3Days.length}
              </span>
            </div>
            {expiringNext3Days.length === 0 ? (
              <p className="text-xs text-amber-800/70 italic py-2">No items expiring in next 3 days.</p>
            ) : (
              <div className="space-y-1.5">
                {expiringNext3Days.map((item) => (
                  <div key={item.id} className="text-xs bg-white p-2 rounded-xl border border-amber-200 flex justify-between font-medium text-slate-800">
                    <span>{item.name}</span>
                    <span className="text-amber-700 font-bold">{getDaysUntilExpiration(item.expirationDate)}d left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next 4-7 Days */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Next 4 - 7 Days
              </span>
              <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                {expiringNext7Days.length}
              </span>
            </div>
            {expiringNext7Days.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No items expiring in this window.</p>
            ) : (
              <div className="space-y-1.5">
                {expiringNext7Days.map((item) => (
                  <div key={item.id} className="text-xs bg-white p-2 rounded-xl border border-slate-200 flex justify-between font-medium text-slate-800">
                    <span>{item.name}</span>
                    <span className="text-slate-600">{getDaysUntilExpiration(item.expirationDate)}d left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8+ Days */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 8+ Days (Fresh)
              </span>
              <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                {expiringLater.length}
              </span>
            </div>
            {expiringLater.length === 0 ? (
              <p className="text-xs text-emerald-800/70 italic py-2">No long-term items.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {expiringLater.map((item) => (
                  <div key={item.id} className="text-xs bg-white p-2 rounded-xl border border-emerald-100 flex justify-between font-medium text-slate-800">
                    <span>{item.name}</span>
                    <span className="text-emerald-700">{getDaysUntilExpiration(item.expirationDate)}d left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Waste History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Category Distribution</span>
          </h3>

          <div className="space-y-2 pt-1">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / pantryItems.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="text-slate-500">{count} items ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wasted Item Logs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Recent Food Waste Log</span>
          </h3>

          {wasteLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No wasted items logged. Great job preventing waste!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {wasteLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{log.itemName}</div>
                    <div className="text-[10px] text-slate-400">
                      {log.quantity} {log.unit} • {log.reason} on {log.date}
                    </div>
                  </div>
                  <span className="font-bold text-rose-600">-₹{log.estimatedValue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
