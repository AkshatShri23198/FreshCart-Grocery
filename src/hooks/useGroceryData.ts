import { useState, useEffect, useRef } from 'react';
import { 
  PantryItem, 
  ShoppingItem, 
  WasteLog, 
  BudgetGoal, 
  Account, 
  FinancialTransaction 
} from '../types';
import { 
  INITIAL_PANTRY_ITEMS, 
  INITIAL_SHOPPING_ITEMS, 
  INITIAL_WASTE_LOGS,
  SAMPLE_PANTRY_ITEMS,
  SAMPLE_SHOPPING_ITEMS,
  SAMPLE_WASTE_LOGS
} from '../data/initialData';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';

const LOCAL_STORAGE_KEYS = {
  PANTRY: 'grocery_tracker_pantry_v1',
  SHOPPING: 'grocery_tracker_shopping_v1',
  WASTE: 'grocery_tracker_waste_v1',
  BUDGET: 'grocery_tracker_budget_v1',
  ACCOUNTS: 'grocery_tracker_accounts_v1',
  TRANSACTIONS: 'grocery_tracker_transactions_v1',
  ACTIVE_ACCOUNT: 'grocery_tracker_active_account_v1',
};

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_main',
    name: 'My Kitchen',
    ownerName: 'Primary Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'Personal',
    monthlyBudget: 15000,
    color: 'emerald',
    description: 'Tap to configure your owner name, budget & preferences',
    createdAt: '2026-07-23',
  }
];

export function useGroceryData() {
  const { user, isAuthenticated } = useAuth();
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState<boolean>(false);

  // Local state
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PANTRY);
    return saved ? JSON.parse(saved) : INITIAL_PANTRY_ITEMS;
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOPPING);
    return saved ? JSON.parse(saved) : INITIAL_SHOPPING_ITEMS;
  });

  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WASTE);
    return saved ? JSON.parse(saved) : INITIAL_WASTE_LOGS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((acc: Account) => ({
        ...acc,
        ownerName: acc.ownerName || acc.name || 'Account Owner',
        avatar: acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      }));
    }
    return DEFAULT_ACCOUNTS;
  });

  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_ACCOUNT);
    if (saved) return saved;
    return 'acc_main';
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0] || DEFAULT_ACCOUNTS[0];

  const [budgetGoal, setBudgetGoal] = useState<BudgetGoal>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGET);
    return saved ? JSON.parse(saved) : { monthlyTarget: activeAccount ? activeAccount.monthlyBudget : 15000, spentThisMonth: 0 };
  });

  // Keep budget sync with active account
  useEffect(() => {
    if (activeAccount) {
      setBudgetGoal((prev) => ({
        ...prev,
        monthlyTarget: activeAccount.monthlyBudget,
      }));
    }
  }, [activeAccountId, activeAccount?.monthlyBudget]);

  // Firestore Real-Time Subscriptions when User is Authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsCloudSyncing(false);
      setIsInitialLoadDone(true);
      return;
    }

    setIsCloudSyncing(true);
    const userId = user.uid;
    const unsubscribes: Unsubscribe[] = [];

    // 1. Initialize / Fetch User Root Document
    const initUserDoc = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          // New user sign-in: create user profile & initial household account
          const initialAccount: Account = {
            id: 'acc_main',
            name: user.displayName ? `${user.displayName}'s Kitchen` : 'My Kitchen',
            ownerName: user.displayName || 'Me',
            avatar: user.photoURL || DEFAULT_ACCOUNTS[0].avatar,
            type: 'Personal',
            monthlyBudget: 15000,
            color: 'emerald',
            description: `Primary Google account data synced for ${user.email || user.displayName}`,
            createdAt: new Date().toISOString().split('T')[0],
          };

          await setDoc(userDocRef, {
            uid: userId,
            email: user.email || '',
            displayName: user.displayName || 'Kitchen Chef',
            photoURL: user.photoURL || '',
            monthlyBudget: 15000,
            spentThisMonth: 0,
            activeAccountId: 'acc_main',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });

          await setDoc(doc(db, 'users', userId, 'accounts', 'acc_main'), initialAccount);

          // If local items exist, migrate them to cloud
          const savedPantry = localStorage.getItem(LOCAL_STORAGE_KEYS.PANTRY);
          const currentPantry: PantryItem[] = savedPantry ? JSON.parse(savedPantry) : INITIAL_PANTRY_ITEMS;
          const batch = writeBatch(db);
          currentPantry.forEach((item) => {
            batch.set(doc(db, 'users', userId, 'pantryItems', item.id), item);
          });

          const savedShopping = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOPPING);
          const currentShopping: ShoppingItem[] = savedShopping ? JSON.parse(savedShopping) : INITIAL_SHOPPING_ITEMS;
          currentShopping.forEach((item) => {
            batch.set(doc(db, 'users', userId, 'shoppingItems', item.id), item);
          });

          await batch.commit();
        } else {
          // Existing user - update last login
          await setDoc(userDocRef, { lastLoginAt: new Date().toISOString() }, { merge: true });
        }
      } catch (err) {
        console.error('Error initializing user document:', err);
      }
    };

    initUserDoc();

    // 2. Listen to User Root Doc (budget & active account)
    const userDocRef = doc(db, 'users', userId);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.monthlyBudget !== undefined && data.spentThisMonth !== undefined) {
          setBudgetGoal({
            monthlyTarget: data.monthlyBudget,
            spentThisMonth: data.spentThisMonth,
          });
        }
        if (data.activeAccountId) {
          setActiveAccountId(data.activeAccountId);
        }
      }
    });
    unsubscribes.push(unsubUser);

    // 3. Listen to Pantry Items
    const pantryColRef = collection(db, 'users', userId, 'pantryItems');
    const unsubPantry = onSnapshot(pantryColRef, (snapshot) => {
      const items: PantryItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as PantryItem);
      });
      setPantryItems(items);
    });
    unsubscribes.push(unsubPantry);

    // 4. Listen to Shopping Items
    const shoppingColRef = collection(db, 'users', userId, 'shoppingItems');
    const unsubShopping = onSnapshot(shoppingColRef, (snapshot) => {
      const items: ShoppingItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as ShoppingItem);
      });
      setShoppingItems(items);
    });
    unsubscribes.push(unsubShopping);

    // 5. Listen to Waste Logs
    const wasteColRef = collection(db, 'users', userId, 'wasteLogs');
    const unsubWaste = onSnapshot(wasteColRef, (snapshot) => {
      const logs: WasteLog[] = [];
      snapshot.forEach((doc) => {
        logs.push(doc.data() as WasteLog);
      });
      setWasteLogs(logs);
    });
    unsubscribes.push(unsubWaste);

    // 6. Listen to Accounts
    const accountsColRef = collection(db, 'users', userId, 'accounts');
    const unsubAccounts = onSnapshot(accountsColRef, (snapshot) => {
      const accList: Account[] = [];
      snapshot.forEach((doc) => {
        accList.push(doc.data() as Account);
      });
      if (accList.length > 0) {
        setAccounts(accList);
      }
    });
    unsubscribes.push(unsubAccounts);

    // 7. Listen to Transactions
    const txColRef = collection(db, 'users', userId, 'transactions');
    const unsubTx = onSnapshot(txColRef, (snapshot) => {
      const txList: FinancialTransaction[] = [];
      snapshot.forEach((doc) => {
        txList.push(doc.data() as FinancialTransaction);
      });
      // Sort newest first
      txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txList);
      setIsInitialLoadDone(true);
      setIsCloudSyncing(false);
    });
    unsubscribes.push(unsubTx);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [isAuthenticated, user?.uid]);

  // Save to LocalStorage as cache / offline support
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PANTRY, JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.WASTE, JSON.stringify(wasteLogs));
  }, [wasteLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGET, JSON.stringify(budgetGoal));
  }, [budgetGoal]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_ACCOUNT, activeAccountId);
  }, [activeAccountId]);

  // Account Operations
  const handleSetActiveAccountId = async (id: string) => {
    setActiveAccountId(id);
    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { activeAccountId: id }, { merge: true });
      } catch (e) {
        console.error('Error saving active account to Firestore:', e);
      }
    }
  };

  const addAccount = async (acc: Omit<Account, 'id' | 'createdAt'>) => {
    const newAcc: Account = {
      ...acc,
      id: 'acc_' + Date.now() + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAccounts((prev) => [...prev, newAcc]);
    handleSetActiveAccountId(newAcc.id);

    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'accounts', newAcc.id), newAcc);
      } catch (e) {
        console.error('Error adding account to Firestore:', e);
      }
    }
  };

  const updateAccount = async (updated: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'accounts', updated.id), updated, { merge: true });
      } catch (e) {
        console.error('Error updating account in Firestore:', e);
      }
    }
  };

  const deleteAccount = async (id: string) => {
    if (accounts.length <= 1) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (activeAccountId === id) {
      const remaining = accounts.filter((a) => a.id !== id);
      handleSetActiveAccountId(remaining[0].id);
    }
    setTransactions((prev) => prev.filter((t) => t.accountId !== id));

    if (isAuthenticated && user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'accounts', id));
      } catch (e) {
        console.error('Error deleting account from Firestore:', e);
      }
    }
  };

  // Transaction Operations
  const addTransaction = async (t: Omit<FinancialTransaction, 'id'>) => {
    const newT: FinancialTransaction = {
      ...t,
      id: 't_' + Date.now() + Math.random().toString(36).substr(2, 4),
    };
    setTransactions((prev) => [newT, ...prev]);

    let newSpent = budgetGoal.spentThisMonth;
    if (t.type === 'expense' && t.accountId === activeAccountId) {
      newSpent = Number((budgetGoal.spentThisMonth + t.amount).toFixed(2));
      setBudgetGoal((prev) => ({
        ...prev,
        spentThisMonth: newSpent,
      }));
    }

    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'transactions', newT.id), newT);
        if (t.type === 'expense' && t.accountId === activeAccountId) {
          await setDoc(doc(db, 'users', user.uid), { spentThisMonth: newSpent }, { merge: true });
        }
      } catch (e) {
        console.error('Error saving transaction to Firestore:', e);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isAuthenticated && user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      } catch (e) {
        console.error('Error deleting transaction from Firestore:', e);
      }
    }
  };

  // Calculations
  const getDaysUntilExpiration = (expirationDate?: string) => {
    if (!expirationDate) return 999;
    const today = new Date('2026-07-23T00:00:00');
    const exp = new Date(expirationDate + 'T00:00:00');
    if (isNaN(exp.getTime())) return 999;
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getFreshnessStatus = (expirationDate?: string): 'expired' | 'expiring_soon' | 'fresh' => {
    if (!expirationDate) return 'fresh';
    const days = getDaysUntilExpiration(expirationDate);
    if (days < 0) return 'expired';
    if (days <= 3) return 'expiring_soon';
    return 'fresh';
  };

  const expiringSoonItems = pantryItems.filter((item) => {
    const status = getFreshnessStatus(item.expirationDate);
    return status === 'expiring_soon' || status === 'expired';
  });

  // Pantry Actions
  const addPantryItem = async (item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...item,
      id: 'p_' + Date.now() + Math.random().toString(36).substr(2, 4),
    };
    setPantryItems((prev) => [newItem, ...prev]);

    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'pantryItems', newItem.id), newItem);
      } catch (e) {
        console.error('Error saving pantry item to Firestore:', e);
      }
    }
  };

  const updatePantryItem = async (updated: PantryItem) => {
    setPantryItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'pantryItems', updated.id), updated, { merge: true });
      } catch (e) {
        console.error('Error updating pantry item in Firestore:', e);
      }
    }
  };

  const deletePantryItem = async (id: string) => {
    setPantryItems((prev) => prev.filter((item) => item.id !== id));
    if (isAuthenticated && user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'pantryItems', id));
      } catch (e) {
        console.error('Error deleting pantry item from Firestore:', e);
      }
    }
  };

  const updatePantryQuantity = async (id: string, delta: number) => {
    const currentItem = pantryItems.find((p) => p.id === id);
    if (!currentItem) return;

    const discreteUnits = ['pcs', 'pc', 'pack', 'packs', 'bottle', 'bottles', 'item', 'items', 'box', 'boxes', 'can', 'cans', 'pouch', 'pouches', 'slice', 'slices', 'unit', 'units'];
    const isDiscrete = discreteUnits.includes((currentItem.unit || '').toLowerCase().trim());
    const rawQty = currentItem.quantity + delta;
    const newQty = isDiscrete
      ? Math.max(0, Math.round(rawQty))
      : Math.max(0, Number(rawQty.toFixed(2)));

    if (newQty <= 0) {
      deletePantryItem(id);
    } else {
      const updated = { ...currentItem, quantity: newQty };
      updatePantryItem(updated);
    }
  };

  // Add Pantry item to Shopping List
  const sendPantryToShoppingList = async (pantryItem: PantryItem) => {
    const exists = shoppingItems.find(
      (s) => s.name.toLowerCase() === pantryItem.name.toLowerCase() && !s.isPurchased
    );
    if (exists) {
      const updated = { ...exists, quantity: exists.quantity + 1 };
      setShoppingItems((prev) =>
        prev.map((s) => (s.id === exists.id ? updated : s))
      );
      if (isAuthenticated && user) {
        await setDoc(doc(db, 'users', user.uid, 'shoppingItems', exists.id), updated, { merge: true });
      }
    } else {
      const newShoppingItem: ShoppingItem = {
        id: 's_' + Date.now(),
        name: pantryItem.name,
        category: pantryItem.category,
        quantity: 1,
        unit: pantryItem.unit,
        estimatedPrice: pantryItem.price || 3.99,
        isPurchased: false,
        priority: 'high',
        addedFromPantry: true,
      };
      setShoppingItems((prev) => [newShoppingItem, ...prev]);
      if (isAuthenticated && user) {
        await setDoc(doc(db, 'users', user.uid, 'shoppingItems', newShoppingItem.id), newShoppingItem);
      }
    }
  };

  // Shopping List Actions
  const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: 's_' + Date.now() + Math.random().toString(36).substr(2, 4),
      isPurchased: false,
    };
    setShoppingItems((prev) => [newItem, ...prev]);
    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'shoppingItems', newItem.id), newItem);
      } catch (e) {
        console.error('Error saving shopping item to Firestore:', e);
      }
    }
  };

  const toggleShoppingPurchased = async (id: string) => {
    const item = shoppingItems.find((s) => s.id === id);
    if (!item) return;
    const updated = { ...item, isPurchased: !item.isPurchased };

    setShoppingItems((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );

    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'shoppingItems', id), { isPurchased: updated.isPurchased }, { merge: true });
      } catch (e) {
        console.error('Error updating shopping purchase in Firestore:', e);
      }
    }
  };

  const deleteShoppingItem = async (id: string) => {
    setShoppingItems((prev) => prev.filter((s) => s.id !== id));
    if (isAuthenticated && user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'shoppingItems', id));
      } catch (e) {
        console.error('Error deleting shopping item from Firestore:', e);
      }
    }
  };

  // Complete Shopping Trip: Move purchased items to Pantry!
  const finishShoppingTrip = async () => {
    const purchased = shoppingItems.filter((s) => s.isPurchased);
    if (purchased.length === 0) return 0;

    const totalSpent = purchased.reduce((acc, curr) => acc + curr.estimatedPrice * curr.quantity, 0);
    const newSpentTotal = Number((budgetGoal.spentThisMonth + totalSpent).toFixed(2));

    const todayStr = '2026-07-23';
    const newTx: FinancialTransaction = {
      id: 't_' + Date.now(),
      accountId: activeAccountId,
      type: 'expense',
      amount: Number(totalSpent.toFixed(2)),
      category: 'Grocery & Food',
      date: todayStr,
      title: `Grocery Trip (${purchased.length} items)`,
      notes: purchased.map((p) => p.name).slice(0, 4).join(', ') + (purchased.length > 4 ? '...' : ''),
      isAutoGroceryExpense: true,
    };

    if (isAuthenticated && user) {
      try {
        const batch = writeBatch(db);

        // 1. Add/Update items in Pantry
        purchased.forEach((s) => {
          const expDays = s.category === 'Produce' ? 7 : s.category === 'Dairy & Eggs' ? 12 : 30;
          const expDate = new Date('2026-07-23T00:00:00');
          expDate.setDate(expDate.getDate() + expDays);
          const expDateStr = expDate.toISOString().split('T')[0];

          const existing = pantryItems.find((p) => p.name.toLowerCase() === s.name.toLowerCase());
          if (existing) {
            const updatedPantry: PantryItem = {
              ...existing,
              quantity: existing.quantity + s.quantity,
              purchaseDate: todayStr,
              expirationDate: expDateStr,
            };
            batch.set(doc(db, 'users', user.uid, 'pantryItems', existing.id), updatedPantry);
          } else {
            const newPantry: PantryItem = {
              id: 'p_' + Date.now() + Math.random().toString(36).substr(2, 4),
              name: s.name,
              category: s.category,
              location: s.category === 'Produce' || s.category === 'Dairy & Eggs' ? 'Fridge' : 'Pantry',
              quantity: s.quantity,
              unit: s.unit,
              expirationDate: expDateStr,
              purchaseDate: todayStr,
              price: s.estimatedPrice,
              lowStockThreshold: 1,
            };
            batch.set(doc(db, 'users', user.uid, 'pantryItems', newPantry.id), newPantry);
          }

          // Delete purchased item from shopping list
          batch.delete(doc(db, 'users', user.uid, 'shoppingItems', s.id));
        });

        // 2. Add expense transaction
        batch.set(doc(db, 'users', user.uid, 'transactions', newTx.id), newTx);

        // 3. Update user spent total
        batch.set(doc(db, 'users', user.uid), { spentThisMonth: newSpentTotal }, { merge: true });

        await batch.commit();
      } catch (e) {
        console.error('Error committing shopping trip batch to Firestore:', e);
      }
    } else {
      // Local fallback
      setPantryItems((prev) => {
        const copy = [...prev];
        purchased.forEach((s) => {
          const existingIdx = copy.findIndex(
            (p) => p.name.toLowerCase() === s.name.toLowerCase()
          );
          const expDays = s.category === 'Produce' ? 7 : s.category === 'Dairy & Eggs' ? 12 : 30;
          const expDate = new Date('2026-07-23T00:00:00');
          expDate.setDate(expDate.getDate() + expDays);
          const expDateStr = expDate.toISOString().split('T')[0];

          if (existingIdx >= 0) {
            copy[existingIdx] = {
              ...copy[existingIdx],
              quantity: copy[existingIdx].quantity + s.quantity,
              purchaseDate: todayStr,
              expirationDate: expDateStr,
            };
          } else {
            copy.unshift({
              id: 'p_' + Date.now() + Math.random().toString(36).substr(2, 4),
              name: s.name,
              category: s.category,
              location: s.category === 'Produce' || s.category === 'Dairy & Eggs' ? 'Fridge' : 'Pantry',
              quantity: s.quantity,
              unit: s.unit,
              expirationDate: expDateStr,
              purchaseDate: todayStr,
              price: s.estimatedPrice,
              lowStockThreshold: 1,
            });
          }
        });
        return copy;
      });

      setBudgetGoal((prev) => ({
        ...prev,
        spentThisMonth: newSpentTotal,
      }));

      setTransactions((prev) => [newTx, ...prev]);
      setShoppingItems((prev) => prev.filter((s) => !s.isPurchased));
    }

    return purchased.length;
  };

  // Log Wasted Item
  const logWastedItem = async (pantryItem: PantryItem, reason: WasteLog['reason']) => {
    const newLog: WasteLog = {
      id: 'w_' + Date.now(),
      itemName: pantryItem.name,
      category: pantryItem.category,
      quantity: pantryItem.quantity,
      unit: pantryItem.unit,
      estimatedValue: Number((pantryItem.price * pantryItem.quantity).toFixed(2)),
      date: '2026-07-23',
      reason,
    };
    setWasteLogs((prev) => [newLog, ...prev]);
    deletePantryItem(pantryItem.id);

    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'wasteLogs', newLog.id), newLog);
      } catch (e) {
        console.error('Error logging wasted item in Firestore:', e);
      }
    }
  };

  // Clear all data for current account
  const clearAllData = async () => {
    setPantryItems([]);
    setShoppingItems([]);
    setWasteLogs([]);
    setTransactions([]);
    const defaultAcc: Account = {
      id: 'acc_main',
      name: user?.displayName ? `${user.displayName}'s Kitchen` : 'My Kitchen',
      ownerName: user?.displayName || 'Me',
      avatar: user?.photoURL || DEFAULT_ACCOUNTS[0].avatar,
      type: 'Personal',
      monthlyBudget: 15000,
      color: 'emerald',
      description: 'Account settings and budget',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAccounts([defaultAcc]);
    setActiveAccountId('acc_main');
    setBudgetGoal({ monthlyTarget: 15000, spentThisMonth: 0 });

    localStorage.removeItem(LOCAL_STORAGE_KEYS.PANTRY);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SHOPPING);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.WASTE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BUDGET);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCOUNTS, JSON.stringify([defaultAcc]));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_ACCOUNT, 'acc_main');

    if (isAuthenticated && user) {
      try {
        // Clear collections in Firestore
        const batch = writeBatch(db);
        pantryItems.forEach((i) => batch.delete(doc(db, 'users', user.uid, 'pantryItems', i.id)));
        shoppingItems.forEach((i) => batch.delete(doc(db, 'users', user.uid, 'shoppingItems', i.id)));
        wasteLogs.forEach((i) => batch.delete(doc(db, 'users', user.uid, 'wasteLogs', i.id)));
        transactions.forEach((i) => batch.delete(doc(db, 'users', user.uid, 'transactions', i.id)));
        batch.set(doc(db, 'users', user.uid, 'accounts', 'acc_main'), defaultAcc);
        batch.set(doc(db, 'users', user.uid), { monthlyBudget: 15000, spentThisMonth: 0, activeAccountId: 'acc_main' }, { merge: true });
        await batch.commit();
      } catch (e) {
        console.error('Error clearing data in Firestore:', e);
      }
    }
  };

  const loadSampleData = async () => {
    setPantryItems(SAMPLE_PANTRY_ITEMS);
    setShoppingItems(SAMPLE_SHOPPING_ITEMS);
    setWasteLogs(SAMPLE_WASTE_LOGS);
    setBudgetGoal({ monthlyTarget: 15000, spentThisMonth: 850 });

    if (isAuthenticated && user) {
      try {
        const batch = writeBatch(db);
        SAMPLE_PANTRY_ITEMS.forEach((i) => batch.set(doc(db, 'users', user.uid, 'pantryItems', i.id), i));
        SAMPLE_SHOPPING_ITEMS.forEach((i) => batch.set(doc(db, 'users', user.uid, 'shoppingItems', i.id), i));
        SAMPLE_WASTE_LOGS.forEach((i) => batch.set(doc(db, 'users', user.uid, 'wasteLogs', i.id), i));
        batch.set(doc(db, 'users', user.uid), { monthlyBudget: 15000, spentThisMonth: 850 }, { merge: true });
        await batch.commit();
      } catch (e) {
        console.error('Error loading sample data to Firestore:', e);
      }
    }
  };

  const handleSetBudgetGoal = async (goal: BudgetGoal | ((prev: BudgetGoal) => BudgetGoal)) => {
    const updated = typeof goal === 'function' ? goal(budgetGoal) : goal;
    setBudgetGoal(updated);
    if (isAuthenticated && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { 
          monthlyBudget: updated.monthlyTarget, 
          spentThisMonth: updated.spentThisMonth 
        }, { merge: true });
      } catch (e) {
        console.error('Error updating budget in Firestore:', e);
      }
    }
  };

  return {
    pantryItems,
    shoppingItems,
    wasteLogs,
    budgetGoal,
    accounts,
    activeAccountId,
    activeAccount,
    transactions,
    expiringSoonItems,
    isCloudSyncing,
    isInitialLoadDone,
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
    resetDemoData: clearAllData,
    clearAllData,
    loadSampleData,
    setBudgetGoal: handleSetBudgetGoal,
    setPantryItems,
    setShoppingItems,
    setActiveAccountId: handleSetActiveAccountId,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction,
  };
}
