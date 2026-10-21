import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  X, 
  Globe, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Download, 
  Upload, 
  RotateCcw, 
  Truck, 
  Droplets, 
  Scale, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Database, 
  Smartphone,
  Sliders,
  ChevronRight,
  Flame,
  Utensils
} from 'lucide-react';
import { AppSettings, DietPreferenceType } from '../types';

interface LeftEdgeSettingsDrawerProps {
  onResetData?: () => void;
  pantryCount?: number;
  shoppingCount?: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  unitSystem: 'metric',
  themeMode: 'light',
  expirationLeadDays: 5,
  lowStockThreshold: 1,
  defaultDeliveryPartner: 'Blinkit',
  dailyWaterTargetGlasses: 8,
  dailyCalorieTarget: 2000,
  defaultDietPref: 'veg',
  enableNotifications: true,
  enableSoundEffects: true,
  autoAddExpiringToShopping: false,
};

export const LeftEdgeSettingsDrawer: React.FC<LeftEdgeSettingsDrawerProps> = ({
  onResetData,
  pantryCount = 0,
  shoppingCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'pantry' | 'wellness' | 'data'>('general');
  const [isHoverEdgeActive, setIsHoverEdgeActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State initialized from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('freshcart_app_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('freshcart_app_settings', JSON.stringify(settings));
  }, [settings]);

  // Hover detection at the left edge of the window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // If cursor within 12px of left screen edge, highlight trigger or open
      if (e.clientX <= 12 && !isOpen) {
        setIsHoverEdgeActive(true);
      } else if (e.clientX > 60 && !isOpen) {
        setIsHoverEdgeActive(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'currency') {
        const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
        next.currencySymbol = symbols[value as string] || '₹';
      }
      return next;
    });
    showToast('Settings saved successfully!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Export JSON Backup
  const handleExportData = () => {
    try {
      const exportObject = {
        app: 'FreshCart Smart Pantry',
        version: '2.5',
        exportedAt: new Date().toISOString(),
        settings,
        pantryItems: localStorage.getItem('freshcart_pantry_items') ? JSON.parse(localStorage.getItem('freshcart_pantry_items')!) : [],
        shoppingItems: localStorage.getItem('freshcart_shopping_items') ? JSON.parse(localStorage.getItem('freshcart_shopping_items')!) : [],
        weightLogs: localStorage.getItem('freshcart_weight_logs') ? JSON.parse(localStorage.getItem('freshcart_weight_logs')!) : [],
        transactions: localStorage.getItem('freshcart_transactions') ? JSON.parse(localStorage.getItem('freshcart_transactions')!) : [],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `freshcart_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('All app data exported to JSON file!');
    } catch (err) {
      console.error(err);
      alert('Failed to export data.');
    }
  };

  // Import JSON Backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) localStorage.setItem('freshcart_app_settings', JSON.stringify(parsed.settings));
        if (parsed.pantryItems) localStorage.setItem('freshcart_pantry_items', JSON.stringify(parsed.pantryItems));
        if (parsed.shoppingItems) localStorage.setItem('freshcart_shopping_items', JSON.stringify(parsed.shoppingItems));
        if (parsed.weightLogs) localStorage.setItem('freshcart_weight_logs', JSON.stringify(parsed.weightLogs));
        if (parsed.transactions) localStorage.setItem('freshcart_transactions', JSON.stringify(parsed.transactions));

        showToast('Backup restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Invisible Hover Zone on Left Screen Edge */}
      <div
        onClick={() => setIsOpen(true)}
        className={`fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 pointer-events-auto ${
          isHoverEdgeActive ? 'w-4 bg-emerald-500/30 backdrop-blur-2xs shadow-lg' : 'w-2 bg-transparent'
        }`}
        title="Hover or click to open Settings"
      />

      {/* Floating Left Edge Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900 text-white px-2.5 py-3.5 rounded-r-2xl shadow-xl border-r border-t border-b border-slate-700/80 flex flex-col items-center gap-2 group transition-all duration-300 hover:bg-emerald-600 hover:px-3.5 hover:shadow-emerald-500/20 ${
          isHoverEdgeActive ? 'translate-x-1 scale-105 bg-emerald-600' : ''
        }`}
        aria-label="Open Left Settings Drawer"
      >
        <Settings className="w-4 h-4 text-emerald-400 group-hover:rotate-90 group-hover:text-white transition-all duration-300" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 [writing-mode:vertical-lr] rotate-180 group-hover:text-white">
          Settings
        </span>
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-300"
        />
      )}

      {/* Slide-Out Drawer Panel */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-80 sm:w-96 bg-slate-900 text-white z-50 shadow-2xl border-r border-slate-800 transition-transform duration-300 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-tight">App Settings & Preferences</h3>
              <p className="text-[11px] text-slate-400 font-medium">Customize your FreshCart experience</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 bg-slate-950/80 p-1.5 gap-1 border-b border-slate-800 text-[11px] font-bold">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'pantry', label: 'Pantry', icon: Database },
            { id: 'wellness', label: 'Health', icon: Scale },
            { id: 'data', label: 'Backup', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          {/* Toast Alert */}
          {toastMessage && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* --- TAB 1: GENERAL & CURRENCY --- */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Currency Picker */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Display Currency</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold">{settings.currencySymbol} ({settings.currency})</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { code: 'INR', symbol: '₹', name: 'Rupee' },
                    { code: 'USD', symbol: '$', name: 'Dollar' },
                    { code: 'EUR', symbol: '€', name: 'Euro' },
                    { code: 'GBP', symbol: '£', name: 'Pound' },
                  ].map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => updateSetting('currency', curr.code as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settings.currency === curr.code
                          ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-2xs'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      }`}
                    >
                      <span className="block text-sm font-black">{curr.symbol}</span>
                      <span className="text-[9px] text-slate-400">{curr.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FreshCart Visual Theme Appearance */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="font-bold text-slate-200 flex items-center justify-between text-xs">
                  <span>FreshCart Visual Theme</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full capitalize border border-emerald-500/30">
                    Active: {settings.appearanceTheme || 'emerald'}
                  </span>
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { 
                      id: 'emerald', 
                      name: '💎 Emerald Gem', 
                      desc: 'Gem-like design, comfortable for eyes and elegant with mint teal accents.',
                      bgClass: 'from-emerald-900 via-teal-950 to-emerald-950 border-emerald-500/50 text-emerald-100',
                      badgeBg: 'bg-emerald-500 text-slate-950'
                    },
                    { 
                      id: 'midnight', 
                      name: '🌌 Midnight Cosmic', 
                      desc: 'Dark cosmic theme with glittering stars, deep charcoal gray cards, and high-contrast white text.',
                      bgClass: 'from-purple-950 via-indigo-950 to-slate-950 border-purple-500/50 text-purple-100',
                      badgeBg: 'bg-purple-500 text-white'
                    },
                    { 
                      id: 'sunset', 
                      name: '🌅 Sunset Beach', 
                      desc: 'Warm beach theme with golden sand gradients, coral wave badges and amber glow.',
                      bgClass: 'from-rose-950 via-orange-950 to-amber-950 border-orange-500/50 text-amber-100',
                      badgeBg: 'bg-orange-500 text-white'
                    },
                    { 
                      id: 'ocean', 
                      name: '🌊 Ocean Breeze', 
                      desc: 'Blue, cool theme with seafoam cyan accents, aquatic cards and wave highlights.',
                      bgClass: 'from-sky-950 via-cyan-950 to-blue-950 border-cyan-500/50 text-cyan-100',
                      badgeBg: 'bg-cyan-400 text-slate-950'
                    },
                    { 
                      id: 'berry', 
                      name: '🍇 Berry Lavender', 
                      desc: 'Pink, purple and soft lavender theme with lush magenta buttons and sweet highlights.',
                      bgClass: 'from-fuchsia-950 via-purple-950 to-pink-950 border-fuchsia-500/50 text-fuchsia-100',
                      badgeBg: 'bg-fuchsia-400 text-slate-950'
                    },
                  ].map((thm) => {
                    const isSelected = (settings.appearanceTheme || 'emerald') === thm.id;
                    return (
                      <button
                        key={thm.id}
                        onClick={() => {
                          updateSetting('appearanceTheme', thm.id as any);
                          window.dispatchEvent(new Event('freshcart_theme_change'));
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden bg-gradient-to-r ${thm.bgClass} ${
                          isSelected
                            ? 'ring-2 ring-white shadow-lg scale-[1.01]'
                            : 'opacity-70 hover:opacity-100 hover:scale-[1.005]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs flex items-center gap-2">
                            <span>{thm.name}</span>
                          </span>
                          {isSelected && (
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${thm.badgeBg}`}>
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-80 leading-relaxed font-medium">
                          {thm.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unit System */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Measurement Units</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSetting('unitSystem', 'metric')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.unitSystem === 'metric'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <span className="font-bold block">Metric System</span>
                    <span className="text-[10px] text-slate-300 font-normal">kg, grams, liters, cm</span>
                  </button>
                  <button
                    onClick={() => updateSetting('unitSystem', 'imperial')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.unitSystem === 'imperial'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <span className="font-bold block">Imperial System</span>
                    <span className="text-[10px] text-slate-300 font-normal">lbs, oz, fl oz, feet/in</span>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Audio & Sound Effects</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Play subtle chime cues when completing items</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableSoundEffects}
                    onChange={(e) => updateSetting('enableSoundEffects', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Smart Alerts & Badges</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Highlight items expiring within {settings.expirationLeadDays} days</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: PANTRY & GROCERY RULES --- */}
          {activeTab === 'pantry' && (
            <div className="space-y-5">
              {/* Expiration Threshold */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Expiration Warning Lead Time</span>
                  <span className="text-emerald-400 font-extrabold">{settings.expirationLeadDays} Days</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={settings.expirationLeadDays}
                    onChange={(e) => updateSetting('expirationLeadDays', Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Pantry items expiring within this day threshold will show urgent warnings in your inventory.
                </p>
              </div>

              {/* Delivery Partner */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Default 10-Min Quick Commerce Partner</label>
                <select
                  value={settings.defaultDeliveryPartner}
                  onChange={(e) => updateSetting('defaultDeliveryPartner', e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Blinkit">⚡ Blinkit (10 mins)</option>
                  <option value="Zepto">🚀 Zepto (10 mins)</option>
                  <option value="Swiggy Instamart">🛒 Swiggy Instamart</option>
                  <option value="BigBasket Now">📦 BigBasket Now</option>
                  <option value="Amazon Fresh">🚚 Amazon Fresh</option>
                </select>
              </div>

              {/* Auto Add Expiring Items Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-slate-200 block">Auto-Shopping Sync</span>
                  <span className="text-[10px] text-slate-400">Suggest auto-adding items about to expire to your shopping list</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAddExpiringToShopping}
                  onChange={(e) => updateSetting('autoAddExpiringToShopping', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* --- TAB 3: WELLNESS & DIET TARGETS --- */}
          {activeTab === 'wellness' && (
            <div className="space-y-5">
              {/* Age Category Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Age Category Mode</span>
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase">
                    {settings.ageCategory?.replace('_', ' ') || 'Young Adult'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'child', label: '👶 Child', age: 'Ages 4-12', cal: 1600, water: 6 },
                    { id: 'teenager', label: '🎧 Teenager', age: 'Ages 13-19', cal: 2400, water: 9 },
                    { id: 'young_adult', label: '🏃 Young Adult', age: 'Ages 20-35', cal: 2200, water: 8 },
                    { id: 'middle_adult', label: '💼 Middle Adult', age: 'Ages 36-59', cal: 2000, water: 8 },
                    { id: 'senior', label: '👵 Senior / Old', age: 'Ages 60+', cal: 1800, water: 7 },
                  ].map((ac) => {
                    const isSelected = (settings.ageCategory || 'young_adult') === ac.id;
                    return (
                      <button
                        key={ac.id}
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            ageCategory: ac.id as any,
                            dailyCalorieTarget: ac.cal,
                            dailyWaterTargetGlasses: ac.water,
                          }));
                          showToast(`Age mode set to ${ac.label}. Calories set to ${ac.cal} kcal!`);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-200 border-amber-400/80 font-extrabold shadow-sm'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                        }`}
                      >
                        <span className="font-bold text-xs block text-white">{ac.label}</span>
                        <span className="text-[9px] text-slate-400 block">{ac.age} • {ac.cal} kcal</span>
                      </button>
                    );
                  })}
                </div>

                {/* Age Nutritional Advice Box */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tailored Nutrition Guidelines:</span>
                  </div>
                  {(settings.ageCategory === 'child') && (
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Focused on bone growth & energy: High Calcium (Amul Milk, Curd), Fruit Fibers, Whole Grains & low artificial sugars.
                    </p>
                  )}
                  {(settings.ageCategory === 'teenager') && (
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Focused on muscle development & study brain fuel: High Protein (Paneer, Eggs, Chana), Hydration & Iron.
                    </p>
                  )}
                  {(!settings.ageCategory || settings.ageCategory === 'young_adult') && (
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Focused on active workout stamina & metabolic balance: Balanced Protein (Dal, Sprouts), Complex Carbs & Hydration.
                    </p>
                  )}
                  {(settings.ageCategory === 'middle_adult') && (
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Focused on cardiovascular wellness: Low Glycemic Atta, Healthy Fats (Nuts, Olive Oil, Flaxseed) & Controlled Sodium.
                    </p>
                  )}
                  {(settings.ageCategory === 'senior') && (
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Focused on joint strength & soft digestibility: High Vitamin D, Gentle Fiber (Khichdi, Soups, Stews) & Hydration.
                    </p>
                  )}
                </div>
              </div>
              {/* Daily Water Target */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Daily Water Goal</span>
                  <span className="text-sky-400 font-extrabold">{settings.dailyWaterTargetGlasses} Glasses (~{(settings.dailyWaterTargetGlasses * 0.25).toFixed(1)}L)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[8, 10, 12].map((g) => (
                    <button
                      key={g}
                      onClick={() => updateSetting('dailyWaterTargetGlasses', g)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settings.dailyWaterTargetGlasses === g
                          ? 'bg-sky-600 text-white border-sky-400 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="font-extrabold text-sm block">{g} Glasses</span>
                      <span className="text-[9px] text-slate-400">{(g * 250)} ml</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calorie Goal Target */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Daily Calorie Target</span>
                  <span className="text-amber-400 font-extrabold">{settings.dailyCalorieTarget} kcal</span>
                </label>
                <input
                  type="range"
                  min="1200"
                  max="3500"
                  step="50"
                  value={settings.dailyCalorieTarget}
                  onChange={(e) => updateSetting('dailyCalorieTarget', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Default Diet Pref */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Default Diet Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'veg', label: '🌿 Pure Veg' },
                    { id: 'non_veg', label: '🍗 Non-Veg' },
                    { id: 'high_protein', label: '💪 High Protein' },
                    { id: 'sattvic', label: '🧘 Sattvic' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updateSetting('defaultDietPref', p.id as DietPreferenceType)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        settings.defaultDietPref === p.id
                          ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 4: DATA BACKUP & RESET --- */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                  <Database className="w-4 h-4" />
                  <span>Data Export & Import</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Safely backup your entire pantry inventory, shopping lists, financial ledger, and weight progress into a standard JSON file.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleExportData}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON Backup</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-600"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import JSON Backup</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportData}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Reset Data Danger Zone */}
              <div className="p-3.5 bg-rose-950/30 rounded-2xl border border-rose-900/50 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reset Demo Data</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Restores FreshCart to default Indian pantry items, budget goals, and sample accounts.
                </p>

                {onResetData && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all data to initial demo state?')) {
                        onResetData();
                        showToast('Demo data restored!');
                      }
                    }}
                    className="w-full py-2 px-3 bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-700/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Initial Demo Data</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col gap-1 items-center justify-center text-center">
          <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">FreshCart Pro AI v2.5</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local Secure</span>
            </span>
          </div>
          <div className="pt-2 border-t border-slate-900 w-full text-xs font-bold text-amber-300/90 tracking-wide">
            Made by Akshat Shrivastava.
          </div>
        </div>
      </div>
    </>
  );
};
