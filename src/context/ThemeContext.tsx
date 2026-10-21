import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppearanceThemeType } from '../types';

export interface ThemeStyles {
  id: AppearanceThemeType;
  name: string;
  isDark: boolean;
  appBg: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  primaryBtn: string;
  secondaryBtn: string;
  accentBadge: string;
  navActive: string;
  navInactive: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  inputBg: string;
  inputBorder: string;
  modalBg: string;
  modalHeaderBg: string;
}

export const THEME_CONFIGS: Record<AppearanceThemeType, ThemeStyles> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Gem',
    isDark: false,
    appBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-emerald-100/60 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900',
    headerBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white border-b border-emerald-800/60 shadow-lg shadow-emerald-950/20',
    cardBg: 'bg-white/95 backdrop-blur-md border-emerald-100 shadow-sm shadow-emerald-900/5',
    cardBorder: 'border-emerald-100',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-200 transition-all active:scale-95',
    secondaryBtn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition-all',
    accentBadge: 'bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold',
    navActive: 'bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-900/30',
    navInactive: 'text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textAccent: 'text-emerald-600 font-extrabold',
    inputBg: 'bg-white',
    inputBorder: 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20',
    modalBg: 'bg-white border-emerald-100',
    modalHeaderBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Cosmic',
    isDark: true,
    appBg: 'bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/60 via-slate-950 to-slate-950',
    headerBg: 'bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-purple-100 border-b border-purple-800/60 shadow-lg shadow-purple-950/60',
    cardBg: 'bg-slate-900/95 backdrop-blur-md border-purple-800/60 shadow-lg shadow-purple-950/50 text-white',
    cardBorder: 'border-purple-800/60',
    primaryBtn: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold shadow-lg shadow-purple-900/50 transition-all active:scale-95 border border-purple-400/30',
    secondaryBtn: 'bg-slate-800 hover:bg-slate-700 text-purple-200 font-bold border border-purple-700/60 transition-all',
    accentBadge: 'bg-slate-800 text-purple-200 border border-purple-700/80 font-bold',
    navActive: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/60 border border-purple-400/30',
    navInactive: 'text-purple-300/80 hover:bg-purple-900/40 hover:text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textAccent: 'text-purple-300 font-extrabold',
    inputBg: 'bg-slate-800 text-white placeholder-slate-400',
    inputBorder: 'border-purple-700/60 focus:border-purple-400 focus:ring-purple-500/30',
    modalBg: 'bg-slate-900 border-purple-800/70 text-slate-100',
    modalHeaderBg: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white border-b border-purple-800/50',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Beach',
    isDark: false,
    appBg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-rose-50/80 text-slate-900 selection:bg-amber-200 selection:text-amber-900',
    headerBg: 'bg-gradient-to-r from-rose-950 via-orange-950 to-amber-950 text-amber-50 border-b border-amber-800/60 shadow-lg shadow-orange-950/20',
    cardBg: 'bg-white/95 backdrop-blur-md border-amber-200/80 shadow-sm shadow-orange-900/5',
    cardBorder: 'border-amber-200/80',
    primaryBtn: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-md shadow-orange-200 transition-all active:scale-95',
    secondaryBtn: 'bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition-all',
    accentBadge: 'bg-orange-100 text-orange-900 border border-orange-200 font-bold',
    navActive: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold shadow-md shadow-orange-900/30',
    navInactive: 'text-amber-200/80 hover:bg-amber-900/40 hover:text-white',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textAccent: 'text-orange-600 font-extrabold',
    inputBg: 'bg-white',
    inputBorder: 'border-amber-200 focus:border-orange-500 focus:ring-orange-500/20',
    modalBg: 'bg-white border-amber-200',
    modalHeaderBg: 'bg-gradient-to-r from-rose-950 via-orange-950 to-amber-950 text-amber-50',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    isDark: false,
    appBg: 'bg-gradient-to-br from-sky-50/90 via-cyan-50/70 to-blue-100/60 text-slate-900 selection:bg-cyan-200 selection:text-cyan-900',
    headerBg: 'bg-gradient-to-r from-sky-950 via-cyan-950 to-blue-950 text-cyan-50 border-b border-cyan-800/60 shadow-lg shadow-cyan-950/20',
    cardBg: 'bg-white/95 backdrop-blur-md border-cyan-100 shadow-sm shadow-cyan-900/5',
    cardBorder: 'border-cyan-100',
    primaryBtn: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-extrabold shadow-md shadow-cyan-200 transition-all active:scale-95',
    secondaryBtn: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-950 font-bold transition-all',
    accentBadge: 'bg-cyan-100 text-cyan-900 border border-cyan-200 font-bold',
    navActive: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold shadow-md shadow-cyan-900/30',
    navInactive: 'text-cyan-200/80 hover:bg-cyan-900/40 hover:text-white',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textAccent: 'text-cyan-600 font-extrabold',
    inputBg: 'bg-white',
    inputBorder: 'border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500/20',
    modalBg: 'bg-white border-cyan-100',
    modalHeaderBg: 'bg-gradient-to-r from-sky-950 via-cyan-950 to-blue-950 text-cyan-50',
  },
  berry: {
    id: 'berry',
    name: 'Berry Lavender',
    isDark: false,
    appBg: 'bg-gradient-to-br from-fuchsia-50/90 via-purple-50/70 to-pink-100/60 text-slate-900 selection:bg-fuchsia-200 selection:text-fuchsia-900',
    headerBg: 'bg-gradient-to-r from-fuchsia-950 via-purple-950 to-pink-950 text-fuchsia-50 border-b border-fuchsia-800/60 shadow-lg shadow-fuchsia-950/20',
    cardBg: 'bg-white/95 backdrop-blur-md border-fuchsia-100 shadow-sm shadow-fuchsia-900/5',
    cardBorder: 'border-fuchsia-100',
    primaryBtn: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-extrabold shadow-md shadow-fuchsia-200 transition-all active:scale-95',
    secondaryBtn: 'bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-950 font-bold transition-all',
    accentBadge: 'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 font-bold',
    navActive: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-extrabold shadow-md shadow-fuchsia-900/30',
    navInactive: 'text-fuchsia-200/80 hover:bg-fuchsia-900/40 hover:text-white',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textAccent: 'text-fuchsia-600 font-extrabold',
    inputBg: 'bg-white',
    inputBorder: 'border-fuchsia-200 focus:border-fuchsia-500 focus:ring-fuchsia-500/20',
    modalBg: 'bg-white border-fuchsia-100',
    modalHeaderBg: 'bg-gradient-to-r from-fuchsia-950 via-purple-950 to-pink-950 text-fuchsia-50',
  },
};

interface ThemeContextType {
  appearanceTheme: AppearanceThemeType;
  setAppearanceTheme: (theme: AppearanceThemeType) => void;
  theme: ThemeStyles;
}

const ThemeContext = createContext<ThemeContextType>({
  appearanceTheme: 'emerald',
  setAppearanceTheme: () => {},
  theme: THEME_CONFIGS.emerald,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appearanceTheme, setAppearanceThemeState] = useState<AppearanceThemeType>(() => {
    try {
      const saved = localStorage.getItem('freshcart_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appearanceTheme && THEME_CONFIGS[parsed.appearanceTheme as AppearanceThemeType]) {
          return parsed.appearanceTheme as AppearanceThemeType;
        }
      }
    } catch (e) {}
    return 'emerald';
  });

  const setAppearanceTheme = (newTheme: AppearanceThemeType) => {
    setAppearanceThemeState(newTheme);
    try {
      const saved = localStorage.getItem('freshcart_app_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.appearanceTheme = newTheme;
      localStorage.setItem('freshcart_app_settings', JSON.stringify(parsed));
      // Dispatch custom event for cross-component reactive updates
      window.dispatchEvent(new Event('freshcart_theme_change'));
    } catch (e) {}
  };

  useEffect(() => {
    const syncTheme = () => {
      try {
        const saved = localStorage.getItem('freshcart_app_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.appearanceTheme && parsed.appearanceTheme !== appearanceTheme && THEME_CONFIGS[parsed.appearanceTheme as AppearanceThemeType]) {
            setAppearanceThemeState(parsed.appearanceTheme as AppearanceThemeType);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('freshcart_theme_change', syncTheme);
    window.addEventListener('storage', syncTheme);
    const interval = setInterval(syncTheme, 500);

    return () => {
      window.removeEventListener('freshcart_theme_change', syncTheme);
      window.removeEventListener('storage', syncTheme);
      clearInterval(interval);
    };
  }, [appearanceTheme]);

  const activeThemeConfig = THEME_CONFIGS[appearanceTheme] || THEME_CONFIGS.emerald;

  return (
    <ThemeContext.Provider
      value={{
        appearanceTheme,
        setAppearanceTheme,
        theme: activeThemeConfig,
      }}
    >
      {/* Background Starry Sky effect for Midnight theme */}
      {appearanceTheme === 'midnight' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
          {/* Cosmic Nebulae */}
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-[450px] h-[450px] bg-indigo-900/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-10 w-[600px] h-[400px] bg-fuchsia-950/25 rounded-full blur-3xl" />

          {/* Twinkling Star Field */}
          <div className="absolute inset-0">
            <div className="absolute top-[5%] left-[12%] w-1.5 h-1.5 bg-white rounded-full animate-ping shadow-[0_0_8px_#ffffff]" />
            <div className="absolute top-[12%] left-[82%] w-2 h-2 bg-purple-200 rounded-full animate-pulse shadow-[0_0_10px_#e9d5ff]" />
            <div className="absolute top-[18%] left-[45%] w-1 h-1 bg-white rounded-full animate-ping shadow-[0_0_6px_#ffffff]" />
            <div className="absolute top-[25%] left-[22%] w-2.5 h-2.5 bg-indigo-200 rounded-full animate-pulse shadow-[0_0_12px_#c7d2fe]" />
            <div className="absolute top-[32%] left-[70%] w-1.5 h-1.5 bg-fuchsia-200 rounded-full animate-ping shadow-[0_0_8px_#f5d0fe]" />
            <div className="absolute top-[40%] left-[88%] w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_6px_#ffffff]" />
            <div className="absolute top-[48%] left-[15%] w-2 h-2 bg-purple-300 rounded-full animate-ping shadow-[0_0_10px_#d8b4fe]" />
            <div className="absolute top-[55%] left-[58%] w-1.5 h-1.5 bg-indigo-100 rounded-full animate-pulse shadow-[0_0_8px_#e0e7ff]" />
            <div className="absolute top-[62%] left-[33%] w-1 h-1 bg-white rounded-full animate-ping shadow-[0_0_6px_#ffffff]" />
            <div className="absolute top-[70%] left-[80%] w-2 h-2 bg-fuchsia-100 rounded-full animate-pulse shadow-[0_0_10px_#fae8ff]" />
            <div className="absolute top-[78%] left-[25%] w-1.5 h-1.5 bg-purple-200 rounded-full animate-ping shadow-[0_0_8px_#e9d5ff]" />
            <div className="absolute top-[85%] left-[62%] w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_12px_#ffffff]" />
            <div className="absolute top-[92%] left-[10%] w-1 h-1 bg-indigo-200 rounded-full animate-ping shadow-[0_0_6px_#c7d2fe]" />
            <div className="absolute top-[95%] left-[90%] w-1.5 h-1.5 bg-fuchsia-200 rounded-full animate-pulse shadow-[0_0_8px_#f5d0fe]" />

            {/* Sparkle Star Vectors */}
            <svg className="absolute top-10 left-[28%] w-6 h-6 text-purple-200/90 animate-pulse drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <svg className="absolute top-[38%] left-[82%] w-7 h-7 text-indigo-100/90 animate-ping drop-shadow-[0_0_10px_rgba(224,231,255,0.9)]" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <svg className="absolute top-[65%] left-[8%] w-5 h-5 text-fuchsia-200/90 animate-pulse drop-shadow-[0_0_8px_rgba(245,208,254,0.8)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <svg className="absolute top-[20%] left-[92%] w-5 h-5 text-white animate-ping drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" style={{ animationDuration: '4s' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <svg className="absolute top-[82%] left-[75%] w-6 h-6 text-purple-200/90 animate-pulse drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
            <svg className="absolute top-[52%] left-[42%] w-4 h-4 text-fuchsia-100 animate-ping drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" style={{ animationDuration: '2.5s' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
        </div>
      )}

      {/* Beach Wave Background effect for Sunset theme */}
      {appearanceTheme === 'sunset' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-full h-48 bg-gradient-to-t from-orange-200/40 via-amber-100/20 to-transparent" />
        </div>
      )}

      {/* Ocean Wave Background effect for Ocean theme */}
      {appearanceTheme === 'ocean' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
          <div className="absolute -top-20 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-300 via-sky-300 to-blue-300 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-cyan-200/40 via-sky-100/20 to-transparent" />
        </div>
      )}

      {/* Berry Bloom Background effect for Berry theme */}
      {appearanceTheme === 'berry' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
          <div className="absolute top-10 -left-20 w-96 h-96 bg-gradient-to-br from-fuchsia-300 via-purple-300 to-pink-300 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-300 via-purple-200 to-transparent rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
