export type LocationType = 'Fridge' | 'Freezer' | 'Pantry' | 'Spice Cabinet';

export type CategoryType = 
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Pantry & Grains'
  | 'Bakery'
  | 'Frozen'
  | 'Snacks & Sweets'
  | 'Beverages'
  | 'Condiments & Spices'
  | 'Household & Personal';

export interface PantryItem {
  id: string;
  name: string;
  category: CategoryType;
  location: LocationType;
  quantity: number;
  unit: string;
  estimatedPcs?: string;   // e.g. "12 Accurate Pcs" or "Approx 6 Pcs"
  expirationDate?: string; // YYYY-MM-DD (Optional)
  purchaseDate: string;   // YYYY-MM-DD
  price: number;          // Estimated/actual cost
  lowStockThreshold: number;
  notes?: string;
  isOpened?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: CategoryType;
  quantity: number;
  unit: string;
  estimatedPcs?: string;   // e.g. "12 Accurate Pcs" or "Approx 6 Pcs"
  estimatedPrice: number;
  isPurchased: boolean;
  priority: 'high' | 'medium' | 'low';
  aisle?: string;
  addedFromPantry?: boolean;
  notes?: string;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pantryMatchPercent: number;
  usedPantryItems: { name: string; quantity: string }[];
  missingIngredients: { name: string; estimatedPrice: number }[];
  instructions: string[];
  caloriesPerServing: number;
  summary: string;
}

export interface WasteLog {
  id: string;
  itemName: string;
  category: CategoryType;
  quantity: number;
  unit: string;
  estimatedValue: number;
  date: string; // YYYY-MM-DD
  reason: 'Expired' | 'Spoiled' | 'Leftover' | 'Other';
}

export interface BudgetGoal {
  monthlyTarget: number;
  spentThisMonth: number;
}

export type AccountType = 'Personal' | 'Family' | 'Business' | 'Shared' | 'Savings';

export interface Account {
  id: string;
  name: string;
  ownerName: string;
  avatar: string;
  type: AccountType;
  monthlyBudget: number;
  color: string;
  description?: string;
  createdAt: string;
}

export type IncomeCategory = 'Salary' | 'Business Sales' | 'Grocery Allowance' | 'Refund / Cashback' | 'Catering' | 'Other Income';
export type ExpenseCategory = 'Grocery & Food' | 'Kitchen Equipment' | 'Dining Out' | 'Utilities' | 'Supplies' | 'Other Expense';

export interface FinancialTransaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  category: IncomeCategory | ExpenseCategory | string;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  isAutoGroceryExpense?: boolean;
}

export type AgeCategoryType = 'child' | 'teenager' | 'young_adult' | 'middle_adult' | 'senior';
export type AppearanceThemeType = 'emerald' | 'midnight' | 'sunset' | 'ocean' | 'berry';

export interface AppSettings {
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  unitSystem: 'metric' | 'imperial';
  themeMode: 'light' | 'dark' | 'sunset';
  appearanceTheme?: AppearanceThemeType;
  ageCategory?: AgeCategoryType;
  expirationLeadDays: number;
  lowStockThreshold: number;
  defaultDeliveryPartner: string;
  dailyWaterTargetGlasses: number;
  dailyCalorieTarget: number;
  defaultDietPref: DietPreferenceType;
  enableNotifications: boolean;
  enableSoundEffects: boolean;
  autoAddExpiringToShopping: boolean;
}

export interface WeightLogEntry {
  id: string;
  date: string;
  weightKg: number;
  bmi: number;
  notes?: string;
}

export type MoodType = 'stressed' | 'energetic' | 'tired' | 'calm' | 'recovery' | 'craving_sweet';
export type DayContextType = 'workday' | 'weekend' | 'workout' | 'detox';
export type DietPreferenceType = 'veg' | 'non_veg' | 'high_protein' | 'low_carb' | 'sattvic';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
