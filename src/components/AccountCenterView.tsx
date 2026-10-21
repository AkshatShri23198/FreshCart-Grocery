import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Users, 
  PiggyBank, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Calendar, 
  Filter,
  Check,
  User,
  Image as ImageIcon,
  Cloud,
  ShieldCheck,
  LogIn,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { Account, FinancialTransaction, AccountType, IncomeCategory, ExpenseCategory } from '../types';
import { AVATAR_PRESETS } from '../data/avatarPresets';
import { useAuth } from '../context/AuthContext';


interface AccountCenterViewProps {
  accounts: Account[];
  activeAccountId: string;
  transactions: FinancialTransaction[];
  onSelectAccount: (id: string) => void;
  onAddAccount: (acc: Omit<Account, 'id' | 'createdAt'>) => void;
  onUpdateAccount: (acc: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddTransaction: (t: Omit<FinancialTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  Personal: <CreditCard className="w-4 h-4" />,
  Family: <Users className="w-4 h-4" />,
  Business: <Building2 className="w-4 h-4" />,
  Shared: <Users className="w-4 h-4" />,
  Savings: <PiggyBank className="w-4 h-4" />,
};

const ACCOUNT_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-900' },
  indigo: { bg: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-900' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-900' },
  rose: { bg: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-900' },
  cyan: { bg: 'bg-cyan-500', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-900' },
};

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Business Sales',
  'Grocery Allowance',
  'Refund / Cashback',
  'Catering',
  'Other Income',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Grocery & Food',
  'Kitchen Equipment',
  'Dining Out',
  'Utilities',
  'Supplies',
  'Other Expense',
];

export function AccountCenterView({
  accounts,
  activeAccountId,
  transactions,
  onSelectAccount,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddTransaction,
  onDeleteTransaction,
}: AccountCenterViewProps) {
  const { user, isAuthenticated, signIn, signOut, loading: isAuthLoading } = useAuth();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState<Account | null>(null);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');


  // Account Modal Form State
  const [accName, setAccName] = useState('');
  const [accOwnerName, setAccOwnerName] = useState('');
  const [accAvatar, setAccAvatar] = useState(AVATAR_PRESETS[0].url);
  const [accType, setAccType] = useState<AccountType>('Personal');
  const [accBudget, setAccBudget] = useState(500);
  const [accColor, setAccColor] = useState('emerald');
  const [accDesc, setAccDesc] = useState('');

  // Transaction Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txCategory, setTxCategory] = useState<string>('Salary');
  const [txDate, setTxDate] = useState('2026-07-23');
  const [txNotes, setTxNotes] = useState('');

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  // Active account transactions
  const accountTx = transactions.filter((t) => t.accountId === activeAccountId);
  const totalIncome = accountTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = accountTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const remainingBudget = activeAccount ? activeAccount.monthlyBudget - totalExpenses : 0;
  const budgetSpentPercent = activeAccount && activeAccount.monthlyBudget > 0
    ? Math.min(100, Math.round((totalExpenses / activeAccount.monthlyBudget) * 100))
    : 0;

  // Filtered transactions for display
  const filteredTx = accountTx.filter((t) => {
    if (txFilter === 'all') return true;
    return t.type === txFilter;
  });

  const handleOpenAddAccount = () => {
    setAccName('');
    setAccOwnerName('');
    setAccAvatar(AVATAR_PRESETS[0].url);
    setAccType('Personal');
    setAccBudget(500);
    setAccColor('emerald');
    setAccDesc('');
    setIsEditingAccount(null);
    setIsAddAccountOpen(true);
  };

  const handleOpenEditAccount = (acc: Account) => {
    setIsEditingAccount(acc);
    setAccName(acc.name);
    setAccOwnerName(acc.ownerName || acc.name);
    setAccAvatar(acc.avatar || AVATAR_PRESETS[0].url);
    setAccType(acc.type);
    setAccBudget(acc.monthlyBudget);
    setAccColor(acc.color || 'emerald');
    setAccDesc(acc.description || '');
    setIsAddAccountOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    const finalOwnerName = accOwnerName.trim() || accName.trim();
    const finalAvatar = accAvatar.trim() || AVATAR_PRESETS[0].url;

    if (isEditingAccount) {
      onUpdateAccount({
        ...isEditingAccount,
        name: accName.trim(),
        ownerName: finalOwnerName,
        avatar: finalAvatar,
        type: accType,
        monthlyBudget: Number(accBudget) || 0,
        color: accColor,
        description: accDesc.trim(),
      });
    } else {
      onAddAccount({
        name: accName.trim(),
        ownerName: finalOwnerName,
        avatar: finalAvatar,
        type: accType,
        monthlyBudget: Number(accBudget) || 0,
        color: accColor,
        description: accDesc.trim(),
      });
    }
    setIsAddAccountOpen(false);
  };

  const handleOpenTxModal = (type: 'income' | 'expense') => {
    setTxType(type);
    setTxTitle('');
    setTxAmount('');
    setTxCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setTxDate('2026-07-23');
    setTxNotes('');
    setIsAddTxOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount || Number(txAmount) <= 0) return;

    onAddTransaction({
      accountId: activeAccountId,
      type: txType,
      amount: Number(txAmount),
      category: txCategory,
      date: txDate,
      title: txTitle.trim(),
      notes: txNotes.trim(),
    });

    setIsAddTxOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Account Switcher Header Banner */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full border border-emerald-500/30">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Account Center & Profit Tracker
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Financial Management & Accounts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Create separate accounts (e.g., Personal Household, Catering, Business), assign dedicated monthly budgets, and track income, expenses, and net profit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleOpenAddAccount}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Create New Account</span>
            </button>
          </div>
        </div>

        {/* Account Tabs Carousel */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 mr-1">
            Active Account:
          </span>
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
            const colorClass = ACCOUNT_COLORS[acc.color] || ACCOUNT_COLORS.emerald;

            return (
              <button
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-white text-slate-950 border-white shadow-lg'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <img
                  src={acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={acc.name}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white/80 shadow-2xs"
                />
                <div className="text-left">
                  <span className="block leading-none font-bold">{acc.ownerName}</span>
                  <span className={`text-[10px] font-normal ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                    {acc.name}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? colorClass.badge : 'bg-slate-700 text-slate-300'}`}>
                  ₹{acc.monthlyBudget}/mo
                </span>
                {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Google Cloud Authorization & Account Sync Status */}
      <div className={`p-6 rounded-[2rem] border transition-all ${
        isAuthenticated && user
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border-emerald-500/30 shadow-lg'
          : 'bg-white text-slate-900 border-emerald-100 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.displayName || 'User'}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <Cloud className="w-7 h-7 text-emerald-600" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {isAuthenticated && user
                    ? `Google Account: ${user.displayName || 'Authorized User'}`
                    : 'Account-Wise Cloud Sync (Google Authorization)'}
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  isAuthenticated && user
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {isAuthenticated && user ? 'Cloud Synced' : 'Guest / Local Storage'}
                </span>
              </div>
              <p className={`text-xs mt-1 font-medium ${
                isAuthenticated && user ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {isAuthenticated && user
                  ? `Logged in as ${user.email}. All pantry stock, shopping lists, financial ledgers, and accounts are encrypted & saved account-wise in real time.`
                  : 'Sign in with your Google account to automatically persist and synchronize your pantry inventory, shopping lists, and ledgers across all your devices.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Switch Google Account</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-800/40 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                disabled={isAuthLoading}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Authorize & Sync with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Account Overview Dashboard */}
      {activeAccount && (
        <div className="space-y-6">
          {/* Section Heading & Edit Account controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={activeAccount.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeAccount.ownerName || activeAccount.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-200 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-lg shadow-2xs">
                  {ACCOUNT_TYPE_ICONS[activeAccount.type]}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{activeAccount.ownerName || activeAccount.name}</h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {activeAccount.type}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-800">Account: {activeAccount.name}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {activeAccount.description || 'Dedicated account budget and profit ledger'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEditAccount(activeAccount)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Edit Account & Budget</span>
              </button>

              {accounts.length > 1 && (
                <button
                  onClick={() => onDeleteAccount(activeAccount.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 4 Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Account Monthly Budget */}
            <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Account Budget
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  ₹{totalExpenses.toFixed(0)}
                  <span className="text-xs font-semibold text-slate-500 ml-1">
                    / ₹{activeAccount.monthlyBudget.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  ₹{remainingBudget >= 0 ? remainingBudget.toFixed(0) : '0'} remaining
                </p>
              </div>
              <div className="space-y-1 pt-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetSpentPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetSpentPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-bold text-right">{budgetSpentPercent}% used</div>
              </div>
            </div>

            {/* 2. Total Income */}
            <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Income
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                  +₹{totalIncome.toFixed(0)}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {accountTx.filter((t) => t.type === 'income').length} income entries
                </p>
              </div>
              <div className="text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-100 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Positive cash inflow</span>
              </div>
            </div>

            {/* 3. Total Expenses */}
            <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Expenses
                </span>
                <div className="p-2 bg-rose-100 text-rose-800 rounded-2xl">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
                  -₹{totalExpenses.toFixed(0)}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {accountTx.filter((t) => t.type === 'expense').length} expense entries
                </p>
              </div>
              <div className="text-xs bg-rose-50 text-rose-800 p-2 rounded-xl border border-rose-100 font-bold flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Outflow & grocery spending</span>
              </div>
            </div>

            {/* 4. Net Profit / Savings */}
            <div className={`rounded-[2rem] p-6 shadow-sm space-y-3 ${
              netProfit >= 0 ? 'bg-emerald-900 text-white' : 'bg-rose-950 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  netProfit >= 0 ? 'text-emerald-200' : 'text-rose-200'
                }`}>
                  Net Profit / Savings
                </span>
                <div className={`p-2 rounded-2xl ${netProfit >= 0 ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-800 text-rose-200'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight">
                  {netProfit >= 0 ? `+₹${netProfit.toFixed(0)}` : `-₹${Math.abs(netProfit).toFixed(0)}`}
                </div>
                <p className={`text-xs mt-1 font-medium ${netProfit >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {netProfit >= 0 ? `${profitMargin}% Profit Margin` : 'Operating at a deficit'}
                </p>
              </div>
              <div className={`text-xs p-2.5 rounded-2xl font-bold ${
                netProfit >= 0 ? 'bg-emerald-800/80 text-emerald-100' : 'bg-rose-900/80 text-rose-100'
              }`}>
                {netProfit >= 0 ? 'Great job! Income exceeds expenses.' : 'Log more income or reduce expenses.'}
              </div>
            </div>
          </div>

          {/* Income & Expense Ledger Section */}
          <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Transaction Ledger for {activeAccount.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Track every income stream and expense logged under this account.
                </p>
              </div>

              {/* Add Income & Add Expense Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenTxModal('income')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Income
                </button>
                <button
                  onClick={() => handleOpenTxModal('expense')}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Expense
                </button>
              </div>
            </div>

            {/* Ledger Filters */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Transactions ({accountTx.length})
                </button>
                <button
                  onClick={() => setTxFilter('income')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Income ({accountTx.filter((t) => t.type === 'income').length})
                </button>
                <button
                  onClick={() => setTxFilter('expense')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expenses ({accountTx.filter((t) => t.type === 'expense').length})
                </button>
              </div>

              <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                Showing {filteredTx.length} records
              </span>
            </div>

            {/* Transactions List */}
            {filteredTx.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                <DollarSign className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  No {txFilter === 'all' ? '' : txFilter} transactions logged under <span className="font-bold">{activeAccount.name}</span> yet.
                </p>
                <button
                  onClick={() => handleOpenTxModal('income')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  + Log your first income or expense
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        tx.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{tx.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            tx.type === 'income' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {tx.category}
                          </span>
                          {tx.isAutoGroceryExpense && (
                            <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                              Auto Grocery Sync
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {tx.date}
                          </span>
                          {tx.notes && <span>• {tx.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <div className={`text-sm font-extrabold ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {tx.type === 'income' ? `+₹${tx.amount.toFixed(0)}` : `-₹${tx.amount.toFixed(0)}`}
                      </div>

                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accounts Comparison Table */}
          <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                All Created Accounts Overview
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Compare monthly budgets, income, expenses, and net profit across all your active accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {accounts.map((acc) => {
                const accTransactions = transactions.filter((t) => t.accountId === acc.id);
                const accIncome = accTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0);
                const accExpenses = accTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const accNet = accIncome - accExpenses;
                const isCurrent = acc.id === activeAccountId;

                return (
                  <div
                    key={acc.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      isCurrent
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-white rounded-xl text-slate-800 shadow-2xs border border-slate-100">
                            {ACCOUNT_TYPE_ICONS[acc.type]}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">{acc.type}</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                        {acc.description || 'Custom account'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">MONTHLY BUDGET</span>
                          <span className="font-extrabold text-slate-900">₹{acc.monthlyBudget.toFixed(0)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">NET PROFIT</span>
                          <span className={`font-extrabold ${accNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {accNet >= 0 ? `+₹${accNet.toFixed(0)}` : `-₹${Math.abs(accNet).toFixed(0)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => handleOpenEditAccount(acc)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => onSelectAccount(acc.id)}
                          className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Switch Account
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Account */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">
                  {isEditingAccount ? 'Edit Account Details' : 'Create New Account'}
                </h3>
              </div>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs font-medium max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Account Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Catering & Events, Main Pantry"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">User / Owner Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan, The Kids, Chef Marco"
                    value={accOwnerName}
                    onChange={(e) => setAccOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Special Picture Selection Grid */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Choose Special Account Picture</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">Pick preset picture or custom URL</span>
                </label>

                {/* Selected Preview Badge */}
                <div className="flex items-center gap-3 p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 mb-2">
                  <img
                    src={accAvatar || AVATAR_PRESETS[0].url}
                    alt="Current Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wider">
                      Selected Account Picture
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {AVATAR_PRESETS.find((p) => p.url === accAvatar)?.label || 'Custom Picture Selected'}
                    </span>
                  </div>
                </div>

                {/* Preset Avatars Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = accAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAccAvatar(preset.url)}
                        className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center relative ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs"
                        />
                        <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {preset.label}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-4 h-4 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Picture URL */}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Or paste custom image URL (https://...)"
                    value={accAvatar}
                    onChange={(e) => setAccAvatar(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Account Category</label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-800 focus:outline-none font-medium"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Family">Family</option>
                    <option value="Business">Business</option>
                    <option value="Shared">Shared Roommates</option>
                    <option value="Savings">Savings / Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Monthly Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={accBudget}
                    onChange={(e) => setAccBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Budget for daily family grocery expenses"
                  value={accDesc}
                  onChange={(e) => setAccDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-md shadow-emerald-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{isEditingAccount ? 'Save Account & Avatar' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Income or Expense Transaction */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-emerald-100 overflow-hidden">
            <div className={`p-6 text-white flex items-center justify-between ${
              txType === 'income' ? 'bg-emerald-950' : 'bg-rose-950'
            }`}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">
                  {txType === 'income' ? 'Log Income Stream' : 'Log Expense Outflow'}
                </h3>
              </div>
              <button onClick={() => setIsAddTxOpen(false)} className="text-slate-300 hover:text-white p-1 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Title / Source *</label>
                <input
                  type="text"
                  placeholder={txType === 'income' ? 'e.g. Client Payment, Salary Deposit' : 'e.g. Weekly Grocery Run, Supplies'}
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(parseFloat(e.target.value) || '')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-800 focus:outline-none font-medium"
                  >
                    {txType === 'income'
                      ? INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)
                      : EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Bank Transfer"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white font-bold rounded-2xl shadow-md flex items-center gap-1.5 ${
                    txType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{txType === 'income' ? 'Record Income' : 'Record Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
