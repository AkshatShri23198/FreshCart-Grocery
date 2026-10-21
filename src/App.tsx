/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGroceryData } from './hooks/useGroceryData';
import { Header, ActiveTab } from './components/Header';
import { PantryView } from './components/PantryView';
import { ShoppingListView } from './components/ShoppingListView';
import { AiRecipeView } from './components/AiRecipeView';
import { AnalyticsView } from './components/AnalyticsView';
import { AccountCenterView } from './components/AccountCenterView';
import { WeightWellnessView } from './components/WeightWellnessView';
import { OnlineStoresDirectory } from './components/OnlineStoresDirectory';
import { AiQuickAddModal } from './components/AiQuickAddModal';
import { AddPantryItemModal } from './components/AddPantryItemModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { LeftEdgeSettingsDrawer } from './components/LeftEdgeSettingsDrawer';
import { FoodLabelNotepadScannerModal } from './components/FoodLabelNotepadScannerModal';
import { AiOnboardingTutorialModal } from './components/AiOnboardingTutorialModal';
import { useTheme } from './context/ThemeContext';
import { PantryItem, ShoppingItem } from './types';

export default function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pantry');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLabelScannerOpen, setIsLabelScannerOpen] = useState(false);
  const [isAddPantryOpen, setIsAddPantryOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [editingPantryItem, setEditingPantryItem] = useState<PantryItem | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('freshcart_has_seen_tutorial_v1') !== 'true';
    } catch (e) {
      return true;
    }
  });

  const {
    pantryItems,
    shoppingItems,
    wasteLogs,
    budgetGoal,
    accounts,
    activeAccountId,
    activeAccount,
    transactions,
    expiringSoonItems,
    getDaysUntilExpiration,
    getFreshnessStatus,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    updatePantryQuantity,
    sendPantryToShoppingList,
    addShoppingItem,
    toggleShoppingPurchased,
    deleteShoppingItem,
    finishShoppingTrip,
    logWastedItem,
    resetDemoData,
    setBudgetGoal,
    setActiveAccountId,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction,
  } = useGroceryData();

  // Deduct pantry items after cooking a recipe
  const handleDeductPantryForRecipe = (usedItems: { name: string; quantity: string }[]) => {
    usedItems.forEach((used) => {
      const match = pantryItems.find(
        (p) => p.name.toLowerCase().includes(used.name.toLowerCase()) || used.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (match) {
        updatePantryQuantity(match.id, -1);
      }
    });
  };

  const pendingShoppingCount = shoppingItems.filter((i) => !i.isPurchased).length;

  const [appearanceTheme, setAppearanceTheme] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('freshcart_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.appearanceTheme || 'emerald';
      }
    } catch (e) {}
    return 'emerald';
  });

  React.useEffect(() => {
    const checkTheme = () => {
      try {
        const saved = localStorage.getItem('freshcart_app_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.appearanceTheme && parsed.appearanceTheme !== appearanceTheme) {
            setAppearanceTheme(parsed.appearanceTheme);
          }
        }
      } catch (e) {}
    };
    const interval = setInterval(checkTheme, 800);
    return () => clearInterval(interval);
  }, [appearanceTheme]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${theme.appBg}`}>
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pantryCount={pantryItems.length}
        shoppingPendingCount={pendingShoppingCount}
        expiringCount={expiringSoonItems.length}
        spentThisMonth={budgetGoal.spentThisMonth}
        monthlyTarget={budgetGoal.monthlyTarget}
        activeAccount={activeAccount}
        accounts={accounts}
        onSelectAccount={setActiveAccountId}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenLabelScanner={() => setIsLabelScannerOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onResetDemo={resetDemoData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'pantry' && (
            <motion.div
              key="pantry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <PantryView
                pantryItems={pantryItems}
                getDaysUntilExpiration={getDaysUntilExpiration}
                getFreshnessStatus={getFreshnessStatus}
                onUpdateQuantity={updatePantryQuantity}
                onSendToShopping={sendPantryToShoppingList}
                onLogWasted={logWastedItem}
                onDelete={deletePantryItem}
                onEdit={(item) => {
                  setEditingPantryItem(item);
                  setIsAddPantryOpen(true);
                }}
                onOpenAddModal={() => {
                  setEditingPantryItem(null);
                  setIsAddPantryOpen(true);
                }}
                onOpenAiRecipeForItems={() => setActiveTab('recipes')}
              />
            </motion.div>
          )}

          {activeTab === 'shopping' && (
            <motion.div
              key="shopping"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <ShoppingListView
                shoppingItems={shoppingItems}
                spentThisMonth={budgetGoal.spentThisMonth}
                monthlyTarget={budgetGoal.monthlyTarget}
                onAddItem={addShoppingItem}
                onTogglePurchased={toggleShoppingPurchased}
                onDeleteItem={deleteShoppingItem}
                onFinishShoppingTrip={finishShoppingTrip}
                onOpenOnlineStores={() => setActiveTab('stores')}
              />
            </motion.div>
          )}

          {activeTab === 'stores' && (
            <motion.div
              key="stores"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <OnlineStoresDirectory 
                shoppingItems={shoppingItems} 
                onAddItem={addShoppingItem}
                onGoToShoppingList={() => setActiveTab('shopping')}
              />
            </motion.div>
          )}

          {activeTab === 'recipes' && (
            <motion.div
              key="recipes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <AiRecipeView
                pantryItems={pantryItems}
                getFreshnessStatus={getFreshnessStatus}
                onAddShoppingItem={addShoppingItem}
                onDeductPantryForRecipe={handleDeductPantryForRecipe}
              />
            </motion.div>
          )}

          {activeTab === 'weight' && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <WeightWellnessView onAddShoppingItem={addShoppingItem} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <AnalyticsView
                pantryItems={pantryItems}
                wasteLogs={wasteLogs}
                budgetGoal={budgetGoal}
                getDaysUntilExpiration={getDaysUntilExpiration}
                getFreshnessStatus={getFreshnessStatus}
                onUpdateBudget={setBudgetGoal}
              />
            </motion.div>
          )}

          {activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <AccountCenterView
                accounts={accounts}
                activeAccountId={activeAccountId}
                transactions={transactions}
                onSelectAccount={setActiveAccountId}
                onAddAccount={addAccount}
                onUpdateAccount={updateAccount}
                onDeleteAccount={deleteAccount}
                onAddTransaction={addTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-300">FreshCart Pro AI • Grocery & Zero-Waste AI Assistant</span>
          <span className="text-amber-300 font-extrabold">Made by Akshat Shrivastava.</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AiOnboardingTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          try {
            localStorage.setItem('freshcart_has_seen_tutorial_v1', 'true');
          } catch (e) {}
        }}
        onMakeAccount={() => {
          setActiveTab('accounts');
          try {
            localStorage.setItem('freshcart_has_seen_tutorial_v1', 'true');
          } catch (e) {}
        }}
      />
      <AiQuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddParsedPantryItems={(items) => items.forEach((i) => addPantryItem(i))}
        onAddParsedShoppingItems={(items) => items.forEach((i) => addShoppingItem(i))}
      />

      <FoodLabelNotepadScannerModal
        isOpen={isLabelScannerOpen}
        onClose={() => setIsLabelScannerOpen(false)}
        onAddPantryItems={(items) => items.forEach((i) => addPantryItem(i))}
        onAddShoppingItems={(items) => items.forEach((i) => addShoppingItem(i))}
      />

      <AddPantryItemModal
        isOpen={isAddPantryOpen}
        onClose={() => {
          setIsAddPantryOpen(false);
          setEditingPantryItem(null);
        }}
        initialItem={editingPantryItem}
        onSave={(item) => {
          if ('id' in item) {
            updatePantryItem(item as PantryItem);
          } else {
            addPantryItem(item);
          }
        }}
      />

      <AiAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        pantryItems={pantryItems}
      />

      {/* Hover Settings Drawer on Left Edge of Screen */}
      <LeftEdgeSettingsDrawer
        onResetData={resetDemoData}
        pantryCount={pantryItems.length}
        shoppingCount={pendingShoppingCount}
      />
    </div>
  );
}
