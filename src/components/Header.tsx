import React, { useState, useRef } from 'react';
import { 
  Refrigerator, 
  ShoppingCart, 
  ChefHat, 
  PieChart, 
  Sparkles, 
  Bot, 
  PlusCircle, 
  AlertTriangle,
  RotateCcw,
  Wallet,
  ChevronDown,
  Check,
  User,
  Globe,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Camera,
  Cloud,
  CloudCheck,
  LogOut,
  LogIn,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Account } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'pantry' | 'shopping' | 'stores' | 'recipes' | 'weight' | 'analytics' | 'accounts';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pantryCount: number;
  shoppingPendingCount: number;
  expiringCount: number;
  spentThisMonth: number;
  monthlyTarget: number;
  activeAccount?: Account;
  accounts?: Account[];
  onSelectAccount?: (id: string) => void;
  onOpenQuickAdd: () => void;
  onOpenLabelScanner: () => void;
  onOpenAssistant: () => void;
  onOpenTutorial?: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pantryCount,
  shoppingPendingCount,
  expiringCount,
  spentThisMonth,
  monthlyTarget,
  activeAccount,
  accounts = [],
  onSelectAccount,
  onOpenQuickAdd,
  onOpenLabelScanner,
  onOpenAssistant,
  onOpenTutorial,
  onResetDemo,
}) => {
  const { theme } = useTheme();
  const { user, isAuthenticated, loading: isAuthLoading, signIn, signOut } = useAuth();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isGoogleMenuOpen, setIsGoogleMenuOpen] = useState(false);
  const budgetPercent = Math.min(100, Math.round((spentThisMonth / monthlyTarget) * 100));
  const navRef = useRef<HTMLInputElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeTabStyle = theme.navActive;
  const inactiveTabStyle = theme.isDark 
    ? 'text-purple-200/80 hover:bg-purple-900/40 hover:text-white' 
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80';

  return (
    <header className={`${theme.headerBg} sticky top-0 z-30 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand & Quick Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3 border-b border-white/10">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-white/30 relative overflow-hidden group">
                <ChefHat className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 border border-white shadow-2xs">
                  AI
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">FreshCart</h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Sparkles className="w-3 h-3 text-slate-900 fill-slate-900" /> Pro AI
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium hidden sm:block">Global AI Recipe Finder & Smart Kitchen</p>
              </div>
            </div>

            {/* Google Authentication & Account User Badge */}
            <div className="flex items-center gap-2">
              {/* Google Sign-in / User Profile Status */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsGoogleMenuOpen(!isGoogleMenuOpen);
                      setIsAccountDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-400/40 rounded-2xl transition-all text-left shadow-xs group"
                    title="Google Cloud Sync Active"
                  >
                    <div className="relative">
                      <img
                        src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={user.displayName || 'Google User'}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-300/80"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950 ring-1 ring-emerald-300" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-emerald-300 font-extrabold tracking-wide uppercase leading-none flex items-center gap-1">
                          <Cloud className="w-2.5 h-2.5 text-emerald-300" /> Google Saved
                        </span>
                      </div>
                      <span className="font-bold text-white text-[11px] leading-tight block truncate max-w-[90px]">
                        {user.displayName || 'My Account'}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-emerald-300/80 group-hover:translate-y-0.5 transition-transform" />
                  </button>

                  {/* Google Profile Menu Dropdown */}
                  {isGoogleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-emerald-100 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100/80 mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={user.displayName || 'User'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                          />
                          <div className="overflow-hidden">
                            <span className="font-black text-slate-900 text-xs block truncate">
                              {user.displayName || 'Google Account'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium block truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] font-bold text-emerald-800">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Account Cloud Synced
                          </span>
                          <span className="bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded-full">
                            Online
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setIsGoogleMenuOpen(false);
                            setActiveTab('accounts');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Manage Household Accounts</span>
                        </button>

                        <button
                          onClick={async () => {
                            await signIn();
                            setIsGoogleMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Switch Google Account</span>
                        </button>

                        <button
                          onClick={async () => {
                            await signOut();
                            setIsGoogleMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  disabled={isAuthLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-white/40 rounded-2xl transition-all shadow-md text-xs font-extrabold group"
                  title="Sign in with Google to save your kitchen data per account"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
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
                  )}
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )}

              {/* Household Account Switcher Badge */}
              {activeAccount && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(!isAccountDropdownOpen);
                      setIsGoogleMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl transition-all text-left shadow-2xs group"
                  >
                    <div className="relative">
                      <img
                        src={activeAccount.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={activeAccount.ownerName || activeAccount.name}
                        className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                    </div>
                    <div className="text-xs hidden md:block">
                      <span className="text-[9px] text-emerald-800 font-bold block uppercase tracking-wider leading-none">
                        Profile
                      </span>
                      <span className="font-extrabold text-slate-900 text-[11px] leading-tight block truncate max-w-[80px]">
                        {activeAccount.ownerName || activeAccount.name}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-emerald-700 transition-transform group-hover:translate-y-0.5" />
                  </button>

                  {/* Account Switcher Dropdown */}
                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Switch Profile Account
                        </span>
                        <button
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            setActiveTab('accounts');
                          }}
                          className="text-[11px] text-emerald-700 font-bold hover:underline"
                        >
                          Manage
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                        {accounts.map((acc) => {
                          const isSelected = acc.id === activeAccount.id;
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                if (onSelectAccount) onSelectAccount(acc.id);
                                setIsAccountDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-2xl transition-colors text-left ${
                                isSelected
                                  ? 'bg-emerald-50/80 text-emerald-950 font-bold border border-emerald-200'
                                  : 'hover:bg-slate-50 text-slate-700 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={acc.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                />
                                <div className="text-xs">
                                  <span className="font-bold block text-slate-900 leading-none">{acc.ownerName}</span>
                                  <span className="text-[10px] text-slate-500 font-medium">{acc.name} ({acc.type})</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 mr-1" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            setActiveTab('accounts');
                          }}
                          className="w-full text-center text-xs font-bold text-emerald-800 hover:text-emerald-950 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Account Center & Avatars</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-end">
            {/* Expiration Alert Badge */}
            {expiringCount > 0 && (
              <button
                onClick={() => setActiveTab('recipes')}
                className="flex items-center gap-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 px-3 py-2 rounded-2xl transition-colors font-bold"
                title="Click to generate waste-reducing AI recipes"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span>{expiringCount} expiring soon</span>
              </button>
            )}

            {/* Budget Gauge Pill */}
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50/80 border border-emerald-100 px-3.5 py-2 rounded-2xl text-xs">
              <span className="text-slate-500 font-medium">Budget:</span>
              <span className="font-bold text-emerald-900">₹{spentThisMonth} / ₹{monthlyTarget}</span>
              <div className="w-12 h-1.5 bg-emerald-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    budgetPercent > 90 ? 'bg-rose-500' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>

            {/* AI Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all shadow-md shadow-emerald-100"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>AI Quick Add</span>
            </button>

            {/* Food Label Photo & Notepad Scanner Button */}
            <button
              onClick={onOpenLabelScanner}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-3.5 py-2.5 rounded-2xl transition-all shadow-md shadow-amber-200 border border-amber-300"
              title="Snap food labels, upload photos or notepad notes"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Scan Label / Notepad</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all"
            >
              <Bot className="w-4 h-4 text-orange-600" />
              <span>Ask Sprout AI</span>
            </button>

            {/* AI Tutorial / Guide Button */}
            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-500/30 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all"
                title="Open AI App Tutorial & Tour"
              >
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                <span className="hidden sm:inline">AI Tutorial</span>
              </button>
            )}

            {/* Clear All Data */}
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors text-xs font-bold"
              title="Clear All Inventory & Start Fresh"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xl:inline">Clear Data</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation with Horizontal Scroll Controls */}
        <div className="relative group/hotbar">
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 p-1.5 rounded-full shadow-md border border-slate-200/80 transition-all opacity-80 hover:opacity-100 hidden sm:flex items-center justify-center -ml-2"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 p-1.5 rounded-full shadow-md border border-slate-200/80 transition-all opacity-80 hover:opacity-100 hidden sm:flex items-center justify-center -mr-2"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Nav Hotbar Container */}
          <nav 
            ref={navRef as any}
            className="flex space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 px-1 scrollbar-none scroll-smooth touch-pan-x" 
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab('pantry')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'pantry' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span>Pantry Inventory</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'pantry' ? 'bg-white/20 text-white' : 'bg-black/10 text-current'
              }`}>
                {pantryCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'shopping' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Shopping List</span>
              {shoppingPendingCount > 0 && (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === 'shopping' ? 'bg-white/20 text-white' : 'bg-amber-400 text-slate-950'
                }`}>
                  {shoppingPendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'stores' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Online Markets</span>
              <span className="text-[10px] bg-white/20 text-current font-bold px-1.5 py-0.5 rounded-full">
                Shop
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'recipes' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Global Recipe Chef</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-200 border border-purple-400/30 font-bold px-1.5 py-0.5 rounded-full">
                AI
              </span>
            </button>

            <button
              onClick={() => setActiveTab('weight')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'weight' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Weight & Health</span>
              <span className="text-[10px] bg-white/20 text-current font-bold px-1.5 py-0.5 rounded-full">
                BMI & Diet
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'analytics' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Budget & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'accounts' ? activeTabStyle : inactiveTabStyle
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Accounts & Profit Tracker</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
