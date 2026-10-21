import React, { useState, useEffect } from 'react';
import { PantryItem, ShoppingItem } from '../types';
import { 
  ChefHat, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Utensils, 
  Loader2,
  BookOpen,
  Globe,
  Search,
  ExternalLink,
  Bookmark,
  Check,
  Flame,
  X,
  Share2,
  ShoppingCart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';

interface AiRecipeViewProps {
  pantryItems: PantryItem[];
  getFreshnessStatus: (date: string) => 'expired' | 'expiring_soon' | 'fresh';
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onDeductPantryForRecipe: (usedItems: { name: string; quantity: string }[]) => void;
}

interface WebRecipe {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  caloriesPerServing: number;
  ingredients: string[];
  instructions: string[];
  summary: string;
}

export const AiRecipeView: React.FC<AiRecipeViewProps> = ({
  pantryItems,
  onAddShoppingItem,
}) => {
  const { theme } = useTheme();

  // Search & Filter state
  const [webSearchQuery, setWebSearchQuery] = useState('Butter Chicken');
  const [webCuisine, setWebCuisine] = useState('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isLoadingWeb, setIsLoadingWeb] = useState(false);
  const [webRecipes, setWebRecipes] = useState<WebRecipe[]>([]);
  const [webErrorMsg, setWebErrorMsg] = useState<string | null>(null);
  const [savedWebRecipes, setSavedWebRecipes] = useState<string[]>([]);
  const [addedIngredients, setAddedIngredients] = useState<Record<string, boolean>>({});
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<WebRecipe | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Search Global Web Recipes
  const handleSearchWebRecipes = async (queryToSearch?: string) => {
    const q = queryToSearch !== undefined ? queryToSearch : webSearchQuery;
    if (!q.trim()) return;

    setIsLoadingWeb(true);
    setWebErrorMsg(null);

    try {
      const res = await fetch('/api/ai/web-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: q,
          cuisine: webCuisine === 'All' ? '' : webCuisine,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to search web recipes');
      }

      const data = await res.json();
      setWebRecipes(data.recipes || []);
    } catch (err: any) {
      console.error(err);
      setWebErrorMsg(err.message || 'Error fetching web recipes.');
    } finally {
      setIsLoadingWeb(false);
    }
  };

  useEffect(() => {
    handleSearchWebRecipes('Butter Chicken');
  }, []);

  const handleAddMissingToShopping = (ingKey: string, ingName: string) => {
    onAddShoppingItem({
      name: ingName,
      category: 'Pantry & Grains',
      quantity: 1,
      unit: 'pack',
      estimatedPrice: 90,
      priority: 'medium',
    });
    setAddedIngredients((prev) => ({ ...prev, [ingKey]: true }));
    showToast(`Added "${ingName}" to shopping list! 🛒`);
  };

  const handleAddAllIngredients = (recipe: WebRecipe) => {
    let addedCount = 0;
    recipe.ingredients.forEach((ing, idx) => {
      const ingKey = `${recipe.id}_${idx}`;
      if (!addedIngredients[ingKey]) {
        onAddShoppingItem({
          name: ing,
          category: 'Pantry & Grains',
          quantity: 1,
          unit: 'pack',
          estimatedPrice: 80,
          priority: 'medium',
        });
        setAddedIngredients((prev) => ({ ...prev, [ingKey]: true }));
        addedCount++;
      }
    });
    showToast(`Added ${addedCount || 'all'} ingredients to shopping list! 🎉`);
  };

  const toggleBookmark = (id: string) => {
    if (savedWebRecipes.includes(id)) {
      setSavedWebRecipes(savedWebRecipes.filter((r) => r !== id));
      showToast('Removed from saved recipes');
    } else {
      setSavedWebRecipes([...savedWebRecipes, id]);
      showToast('Saved to your favorite recipes! ⭐️');
    }
  };

  const startCooking = (recipe: WebRecipe) => {
    setActiveCookingRecipe(recipe);
    setCompletedSteps({});
  };

  const toggleStep = (stepIdx: number) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepIdx]: !prev[stepIdx] };
      const totalSteps = activeCookingRecipe?.instructions.length || 0;
      const doneCount = Object.values(next).filter(Boolean).length;
      if (doneCount === totalSteps && totalSteps > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('🎉 Bravo! You finished cooking the entire dish!');
      }
      return next;
    });
  };

  const popularSearches = [
    'Butter Chicken', 'Paneer Tikka Masala', 'Vegetable Biryani', 
    'Pasta Carbonara', 'Avocado Toast', 'Tacos', 'Thai Green Curry'
  ];

  const cuisines = ['All', 'Indian', 'Italian', 'Mexican', 'Asian', 'Continental', 'Healthy & Salads'];

  const displayedRecipes = showSavedOnly 
    ? webRecipes.filter(r => savedWebRecipes.includes(r.id))
    : webRecipes;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Search Header */}
      <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden border border-purple-800/50">
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-500/20 text-purple-200 px-3.5 py-1 rounded-full border border-purple-400/30">
            <Globe className="w-3.5 h-3.5 text-cyan-300" /> Global Recipe AI Search
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Global AI Recipe Finder</h2>
          <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed font-medium">
            Search top-rated authentic recipes from around the world. Get realistic prep times, exact ingredient breakdowns, and add required ingredients straight to your FreshCart shopping list!
          </p>

          {/* Search Bar Input */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any dish or recipe (e.g., Paneer Butter Masala, Pizza, Tacos)..."
                value={webSearchQuery}
                onChange={(e) => setWebSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchWebRecipes()}
                className="w-full text-xs pl-10 pr-4 py-3.5 bg-slate-900/90 border border-purple-600/60 text-white placeholder-purple-300/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold"
              />
            </div>
            <button
              onClick={() => handleSearchWebRecipes()}
              disabled={isLoadingWeb}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 whitespace-nowrap border border-purple-400/30 disabled:opacity-50 active:scale-95"
            >
              {isLoadingWeb ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Searching AI...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-cyan-300" />
                  <span>Search Recipes</span>
                </>
              )}
            </button>
          </div>

          {/* Cuisine Pill Filters */}
          <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-purple-300 mr-1 whitespace-nowrap">Cuisine:</span>
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setWebCuisine(c);
                  handleSearchWebRecipes(webSearchQuery);
                }}
                className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-all whitespace-nowrap border ${
                  webCuisine === c
                    ? 'bg-purple-500 text-white border-purple-300 shadow-sm'
                    : 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border-purple-700/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Popular Search Suggestions */}
          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-purple-300 mr-1">Trending:</span>
            {popularSearches.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setWebSearchQuery(item);
                  handleSearchWebRecipes(item);
                }}
                className="text-[10px] font-bold bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 px-2.5 py-1 rounded-xl transition-all active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {webErrorMsg && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-4 rounded-2xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{webErrorMsg}</span>
        </div>
      )}

      {/* Web Recipe Results Grid */}
      {displayedRecipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black ${theme.textPrimary} flex items-center gap-2`}>
              <ChefHat className="w-4 h-4 text-purple-400" />
              <span>Found {displayedRecipes.length} Global Recipes</span>
            </h3>

            {savedWebRecipes.length > 0 && (
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  showSavedOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-slate-950' : ''}`} />
                <span>{showSavedOnly ? 'Show All' : `Saved (${savedWebRecipes.length})`}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedRecipes.map((recipe) => {
              const isSaved = savedWebRecipes.includes(recipe.id);
              return (
                <div
                  key={recipe.id}
                  className={`${theme.cardBg} border ${theme.cardBorder} rounded-[2rem] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative group`}
                >
                  <div className="space-y-3">
                    {/* Top Badge & Source */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        theme.isDark ? 'bg-indigo-950 text-indigo-200 border-indigo-800' : 'bg-purple-50 text-purple-900 border-purple-200'
                      }`}>
                        {recipe.sourceName || 'Web Recipe'}
                      </span>
                      
                      <button
                        onClick={() => toggleBookmark(recipe.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isSaved 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : theme.isDark ? 'text-slate-400 hover:text-white border-slate-800' : 'text-slate-400 hover:text-slate-700 border-slate-200'
                        }`}
                        title="Save Recipe"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
                      </button>
                    </div>

                    {/* Title & Summary */}
                    <h3 className={`text-base font-black ${theme.textPrimary} leading-snug`}>{recipe.title}</h3>
                    <p className={`text-xs ${theme.textSecondary} leading-relaxed font-medium line-clamp-2`}>{recipe.summary}</p>

                    {/* Metadata Pills */}
                    <div className={`flex items-center gap-2 text-[11px] font-bold ${theme.textSecondary} flex-wrap`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {recipe.prepTime} prep • {recipe.cookTime} cook
                      </span>
                      <span>•</span>
                      <span>{recipe.servings} Servings</span>
                      {recipe.caloriesPerServing > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-extrabold">{recipe.caloriesPerServing} kcal</span>
                        </>
                      )}
                    </div>

                    {/* Web Ingredients List */}
                    <div className="space-y-2 pt-2 border-t border-purple-900/30">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${theme.textPrimary}`}>
                          Ingredients ({recipe.ingredients.length}):
                        </span>
                        <button
                          onClick={() => handleAddAllIngredients(recipe)}
                          className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          title="Add all ingredients to shopping cart"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Shop All</span>
                        </button>
                      </div>

                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {recipe.ingredients.map((ing, idx) => {
                          const ingKey = `${recipe.id}_${idx}`;
                          const isAdded = !!addedIngredients[ingKey];
                          return (
                            <div key={idx} className={`flex items-center justify-between text-xs p-1.5 rounded-xl border ${
                              theme.isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-100'
                            }`}>
                              <span className={`${theme.textPrimary} font-medium line-clamp-1`}>{ing}</span>
                              <button
                                onClick={() => handleAddMissingToShopping(ingKey, ing)}
                                disabled={isAdded}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 whitespace-nowrap ml-2 flex-shrink-0 ${
                                  isAdded
                                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }`}
                                title="Add to Shopping List"
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Added
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" /> Shop
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Link & Action */}
                  <div className={`pt-3 border-t ${theme.isDark ? 'border-purple-900/40' : 'border-slate-100'} flex items-center justify-between gap-2`}>
                    <a
                      href={recipe.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(recipe.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <span>Web Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => startCooking(recipe)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Cook Mode</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Step-by-Step Cooking Mode Modal */}
      {activeCookingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-[2.5rem] p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-white shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/30 text-purple-300 rounded-2xl border border-purple-500/40">
                  <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">Live Kitchen Cooking Mode</span>
                  <h3 className="text-xl font-black text-white">{activeCookingRecipe.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveCookingRecipe(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-purple-800/40 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Prep Time</span>
                <span className="text-sm font-black text-purple-200">{activeCookingRecipe.prepTime}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-purple-800/40 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Cook Time</span>
                <span className="text-sm font-black text-purple-200">{activeCookingRecipe.cookTime}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-purple-800/40 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Servings</span>
                <span className="text-sm font-black text-amber-300">{activeCookingRecipe.servings} People</span>
              </div>
            </div>

            {/* Step-by-Step Instructions with Interactive Checkboxes */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center justify-between">
                <span>Cooking Steps (Tap to complete):</span>
                <span className="text-amber-300">
                  {Object.values(completedSteps).filter(Boolean).length} of {activeCookingRecipe.instructions.length} done
                </span>
              </h4>

              <div className="space-y-2.5">
                {activeCookingRecipe.instructions.map((step, idx) => {
                  const isDone = !!completedSteps[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isDone 
                          ? 'bg-emerald-950/40 border-emerald-600/60 opacity-80' 
                          : 'bg-slate-800/70 border-slate-700 hover:border-purple-500'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {step}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveCookingRecipe(null)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95"
              >
                Done Cooking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
