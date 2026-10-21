import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Sparkles, 
  Refrigerator, 
  ChefHat, 
  ShoppingCart, 
  Wallet, 
  Camera, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  UserPlus, 
  Zap, 
  ShieldCheck,
  Package
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AiOnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData?: () => void;
  onMakeAccount: () => void;
}

export const AiOnboardingTutorialModal: React.FC<AiOnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleData,
  onMakeAccount,
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tutorialSteps = [
    {
      id: 'intro',
      title: 'Welcome to FreshCart Pro AI!',
      subtitle: 'Your Smart Kitchen, Global Recipe Finder & Household Budget Assistant',
      icon: <Bot className="w-8 h-8 text-amber-300" />,
      badge: 'AI Guide',
      aiSpeech: "Hello! 👋 I'm your FreshCart AI Guide. I'm here to help you manage your kitchen inventory, find delicious web recipes, save money on groceries, and track your household budget!",
      highlights: [
        { icon: <Refrigerator className="w-5 h-5 text-emerald-400" />, title: 'Smart Pantry Tracker', desc: 'Real-time inventory for Fridge, Pantry & Freezer with expiration warnings.' },
        { icon: <ChefHat className="w-5 h-5 text-amber-400" />, title: 'Global Recipe Chef', desc: 'Search top-rated web recipes with instant shopping list syncing.' },
        { icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />, title: 'Live Market Comparator', desc: 'Compare prices across Blinkit, Zepto, BigBasket, Instamart & Amazon.' },
        { icon: <Wallet className="w-5 h-5 text-purple-400" />, title: 'Household Budget Center', desc: 'Multi-account financial expense logging and food allowance tracking.' },
      ],
    },
    {
      id: 'pantry',
      title: '1. Smart Pantry & Expiration Tracking',
      subtitle: 'Never let food spoil or go forgotten in the back of your fridge',
      icon: <Refrigerator className="w-8 h-8 text-emerald-300" />,
      badge: 'Pantry Engine',
      aiSpeech: "You can add items manually, quick-add with AI, or use the Camera Label & Notepad Scanner to snap receipts or paste raw grocery notes. We automatically calculate expiration dates and flag items needing attention!",
      highlights: [
        { icon: <Camera className="w-5 h-5 text-amber-400" />, title: 'Label & Photo Scanner', desc: 'Snap food packages or upload handwritten shopping notepad notes.' },
        { icon: <Zap className="w-5 h-5 text-emerald-400" />, title: 'AI Quick Add', desc: 'Type naturally like "Bought 2kg Apples for ₹180" and AI parses it instantly.' },
        { icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />, title: 'Freshness Alerts', desc: 'Color-coded badges (Fresh, Expiring Soon, Expired) keep your kitchen safe.' },
      ],
    },
    {
      id: 'recipes',
      title: '2. Waste-Zero Gemini AI Chef',
      subtitle: 'Turn expiring pantry items into gourmet meals with 1 click',
      icon: <ChefHat className="w-8 h-8 text-amber-300" />,
      badge: 'AI Chef',
      aiSpeech: "Got extra tomatoes, milk, or leftover veggies? Click 'Generate AI Recipe' in the AI Chef tab. Gemini creates step-by-step cooking instructions and automatically deducts the ingredients from your pantry inventory when you cook!",
      highlights: [
        { icon: <Sparkles className="w-5 h-5 text-amber-400" />, title: 'Pantry Match %', desc: 'Find recipes that use 80%+ of ingredients you already own.' },
        { icon: <Package className="w-5 h-5 text-emerald-400" />, title: 'Auto Pantry Deduction', desc: 'Click "Cook & Deduct Pantry" to update stock levels automatically.' },
        { icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />, title: 'Missing Ingredient Transfer', desc: 'Add missing recipe items directly to your shopping list with 1 tap.' },
      ],
    },
    {
      id: 'shopping',
      title: '3. Smart Shopping & Market Price Search',
      subtitle: 'Shop smarter and compare live quick-commerce prices',
      icon: <ShoppingCart className="w-8 h-8 text-cyan-300" />,
      badge: 'Market Engine',
      aiSpeech: "Create custom shopping lists or auto-populate items when pantry stock runs low. Use our Market Search button to check live prices across Blinkit, Zepto, BigBasket, and Instamart. Once bought, transfer them to your pantry with 1 click!",
      highlights: [
        { icon: <Zap className="w-5 h-5 text-cyan-400" />, title: 'In-Store Mode', desc: 'Interactive checklist mode with large tap targets for easy grocery shopping.' },
        { icon: <ShoppingCart className="w-5 h-5 text-emerald-400" />, title: '1-Click Trip Completion', desc: 'Move purchased items directly into your pantry and log budget expenses.' },
      ],
    },
    {
      id: 'account',
      title: '4. Setup Your Personal Account!',
      subtitle: 'Start with a fresh account slate tailored to your household',
      icon: <Wallet className="w-8 h-8 text-purple-300" />,
      badge: 'Account Setup',
      aiSpeech: "We've cleared all default data and set your active account to 'Make your Account'. Click below to customize your account name, avatar, monthly food allowance budget, and preferences now!",
      highlights: [
        { icon: <UserPlus className="w-5 h-5 text-purple-400" />, title: 'Make Your Account', desc: 'Set your name, avatar, and personalized monthly food budget.' },
        { icon: <Wallet className="w-5 h-5 text-emerald-400" />, title: 'Multiple Accounts', desc: 'Create separate wallets for Personal, Family, or Business Catering.' },
      ],
    },
  ];

  const step = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onMakeAccount();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl border ${theme.cardBorder} overflow-hidden my-auto flex flex-col bg-slate-900 text-white relative`}>
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-800/50 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-2xl text-purple-300 shadow-inner">
              {step.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {step.badge} • Step {currentStep + 1} of {tutorialSteps.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">{step.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          {/* AI Speech Bubble */}
          <div className="flex items-start gap-3.5 bg-gradient-to-r from-purple-950/80 to-slate-800/80 p-4 sm:p-5 rounded-3xl border border-purple-700/50 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md flex-shrink-0 mt-0.5">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> FreshCart AI Assistant
              </span>
              <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
                "{step.aiSpeech}"
              </p>
            </div>
          </div>

          {/* Highlights List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.highlights.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-800/80 hover:bg-slate-800 border border-purple-800/40 p-4 rounded-2xl space-y-1 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-purple-700/40">
                    {item.icon}
                  </div>
                  <h4 className="text-xs font-black text-white">{item.title}</h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug pl-8">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep 
                    ? 'w-8 bg-purple-500 shadow-sm shadow-purple-500' 
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-purple-200 text-xs font-bold transition-all border border-purple-800/60"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 font-semibold"
              >
                Skip Tutorial
              </button>
            )}

            {onLoadSampleData && (
              <button
                onClick={() => {
                  onLoadSampleData();
                  onClose();
                }}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-2 rounded-xl transition-all"
              >
                Load Demo Data
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep === tutorialSteps.length - 1 ? (
              <button
                onClick={() => {
                  onMakeAccount();
                  onClose();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 border border-purple-400/40"
              >
                <UserPlus className="w-4 h-4 text-purple-200" />
                <span>Make Your Account Now</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-2xl transition-all shadow-md shadow-purple-900/50 flex items-center justify-center gap-2 border border-purple-400/30"
              >
                <span>Next Feature</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
