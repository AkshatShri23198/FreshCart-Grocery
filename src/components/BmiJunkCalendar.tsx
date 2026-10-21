import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  CheckCircle2, 
  Pizza, 
  Salad, 
  Droplets, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ShoppingCart, 
  AlertCircle, 
  Info, 
  RotateCcw, 
  Flame, 
  Scale, 
  Clock, 
  Check, 
  X,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ShoppingItem } from '../types';

interface BmiJunkCalendarProps {
  bmiValue: number;
  bmiCategory: { label: string; color: string; bg: string; barColor: string };
  fitnessGoal: 'loss' | 'maintain' | 'gain';
  weightKg: number;
  heightCm: number;
  onAddShoppingItem?: (item: Omit<ShoppingItem, 'id'>) => void;
}

export type DayType = 'healthy' | 'junk' | 'detox';

export interface CalendarDayPlan {
  dayNumber: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string; // Sun, Mon, etc.
  type: DayType;
  title: string;
  junkFoodItem?: string;
  calorieTarget: number;
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  mitigationTip?: string;
  ingredients: string[];
}

export const BmiJunkCalendar: React.FC<BmiJunkCalendarProps> = ({
  bmiValue,
  bmiCategory,
  fitnessGoal,
  weightKg,
  heightCm,
  onAddShoppingItem
}) => {
  // --- Calendar Date State ---
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(6); // 0 = Jan, 6 = July
  const [preferredCheatPattern, setPreferredCheatPattern] = useState<'weekends' | 'midweek_weekend' | 'sunday_only'>('midweek_weekend');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to generate monthly days based on BMI & preferred pattern
  const generateMonthDays = (year: number, monthIdx: number, bmi: number, pattern: string): CalendarDayPlan[] => {
    const totalDaysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const result: CalendarDayPlan[] = [];

    // Determine allowed junk days frequency based on BMI
    // Underweight (< 18.5): 3 junk days / week
    // Healthy (18.5 - 24.9): 2 junk days / week
    // Overweight (25 - 29.9): 1 junk day / week
    // Obese (>= 30): 1 junk day every 10-14 days
    let junkFrequencyDays = [0, 6]; // Default Sun, Sat
    if (bmi < 18.5) {
      junkFrequencyDays = [0, 3, 6]; // Sun, Wed, Sat
    } else if (bmi <= 24.9) {
      junkFrequencyDays = pattern === 'weekends' ? [0, 6] : pattern === 'sunday_only' ? [0] : [0, 3]; // Sun, Wed
    } else if (bmi <= 29.9) {
      junkFrequencyDays = [0]; // Sunday only
    } else {
      junkFrequencyDays = [0]; // Every second Sunday handled below
    }

    const junkFoodIdeas = [
      { name: 'Cheesy Paneer Pizza Slices', cal: 650, tip: 'Eat salad first & walk 20 mins post meal.' },
      { name: 'Gourmet Veg Burger & Baked Fries', cal: 580, tip: 'Skip sugary soda; drink sparkling lemon water.' },
      { name: 'Butter Paneer & Garlic Naan', cal: 720, tip: 'Keep breakfast and dinner under 300 kcal today.' },
      { name: 'Crispy Chole Bhature', cal: 680, tip: 'Have warm green tea 30 mins after eating to aid digestion.' },
      { name: 'Dark Chocolate Brownie & Ice Cream', cal: 480, tip: 'Enjoy as a reward after 30 mins cardio workout.' },
      { name: 'Street Style Hakka Noodles & Manchurian', cal: 610, tip: 'Drink 2 glasses of water before lunch.' }
    ];

    const healthyMealIdeas = [
      { b: 'Oats Poha with Peanuts & Veggies', l: 'Brown Rice, Rajma Curry & Cucumber Salad', s: 'Roasted Chana & Green Tea', d: 'Moong Dal Khichdi with Curd', cal: 1550, ing: ['Oats', 'Rajma', 'Brown Rice', 'Moong Dal', 'Curd', 'Cucumber'] },
      { b: 'Stuffed Paneer Paratha (Low Oil)', l: 'Multigrain Roti, Bhindi Masala & Sprouts Salad', s: 'Apple Slices & Almonds', d: 'Mixed Veg Soup & Toast', cal: 1600, ing: ['Paneer', 'Multigrain Atta', 'Bhindi', 'Sprouts', 'Apples', 'Almonds'] },
      { b: 'Idli Sambar & Coconut Chutney', l: 'Quinoa Pulao with Mixed Veggies & Boondi Raita', s: 'Handful of Walnuts & Green Tea', d: 'Lauki Soup & Paneer Cubes', cal: 1500, ing: ['Idli Batter', 'Sambar Dal', 'Quinoa', 'Curd', 'Bottle Gourd', 'Walnuts'] },
      { b: 'Vegetable Upma with Mint Chutney', l: 'Yellow Dal Tadka, Jeera Rice & Beetroot Salad', s: 'Roasted Makhana (Lotus Seeds)', d: 'Grilled Paneer Salad with Olives', cal: 1580, ing: ['Sooji/Rava', 'Toor Dal', 'Jeera Rice', 'Beetroot', 'Makhana', 'Paneer'] }
    ];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(year, monthIdx, day);
      const dayOfWeekIdx = dateObj.getDay(); // 0 = Sun, 1 = Mon, ...
      const dayOfWeekStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      let isJunkDay = false;
      if (bmi >= 30) {
        // For Obese, only allow junk every 14 days (e.g. day 7 and day 21)
        if (day === 7 || day === 21) isJunkDay = true;
      } else {
        if (junkFrequencyDays.includes(dayOfWeekIdx)) isJunkDay = true;
      }

      // Day after a Junk Day can be a Detox Day for higher BMI
      const isDetoxDay = !isJunkDay && dayOfWeekIdx === 1 && (bmi >= 25);

      if (isJunkDay) {
        const junkIdea = junkFoodIdeas[day % junkFoodIdeas.length];
        result.push({
          dayNumber: day,
          dateStr,
          dayOfWeek: dayOfWeekStr,
          type: 'junk',
          title: `🍕 Controlled Treat: ${junkIdea.name}`,
          junkFoodItem: junkIdea.name,
          calorieTarget: junkIdea.cal,
          breakfast: 'Light Papaya & Soaked Almonds (200 kcal)',
          lunch: junkIdea.name,
          snack: 'Green Tea & Roasted Chana (120 kcal)',
          dinner: 'Warm Vegetable Soup & Mint Salad (220 kcal)',
          mitigationTip: junkIdea.tip,
          ingredients: [junkIdea.name.split(' ')[0], 'Green Tea', 'Papaya', 'Almonds', 'Mixed Soup Veggies']
        });
      } else if (isDetoxDay) {
        result.push({
          dayNumber: day,
          dateStr,
          dayOfWeek: dayOfWeekStr,
          type: 'detox',
          title: '💧 Gut Detox & Metabolic Reset Day',
          calorieTarget: 1350,
          breakfast: 'Warm Lemon Honey Water + Fresh Papaya & Chia Seeds',
          lunch: 'Yellow Moong Dal Khichdi with Desi Ghee & Curd',
          snack: 'Cucumber Slices & Coconut Water',
          dinner: 'Clear Bottle Gourd (Lauki) Soup & Toast',
          mitigationTip: 'Drink 3.5 Liters of water throughout the day to flush sodium.',
          ingredients: ['Papaya', 'Chia Seeds', 'Yellow Moong Dal', 'Desi Ghee', 'Curd', 'Bottle Gourd', 'Coconut Water']
        });
      } else {
        const healthyIdea = healthyMealIdeas[day % healthyMealIdeas.length];
        result.push({
          dayNumber: day,
          dateStr,
          dayOfWeek: dayOfWeekStr,
          type: 'healthy',
          title: `🥗 Clean Energy Day: ${healthyIdea.b.split(' ')[0]} & Dal`,
          calorieTarget: healthyIdea.cal,
          breakfast: healthyIdea.b,
          lunch: healthyIdea.l,
          snack: healthyIdea.s,
          dinner: healthyIdea.d,
          ingredients: healthyIdea.ing
        });
      }
    }

    return result;
  };

  // State for generated days
  const [daysPlan, setDaysPlan] = useState<CalendarDayPlan[]>(() => 
    generateMonthDays(currentYear, currentMonthIndex, bmiValue, preferredCheatPattern)
  );

  // Modal inspection state
  const [selectedDay, setSelectedDay] = useState<CalendarDayPlan | null>(null);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Handle month change
  const handleMonthPrev = () => {
    let newM = currentMonthIndex - 1;
    let newY = currentYear;
    if (newM < 0) {
      newM = 11;
      newY -= 1;
    }
    setCurrentMonthIndex(newM);
    setCurrentYear(newY);
    setDaysPlan(generateMonthDays(newY, newM, bmiValue, preferredCheatPattern));
  };

  const handleMonthNext = () => {
    let newM = currentMonthIndex + 1;
    let newY = currentYear;
    if (newM > 11) {
      newM = 0;
      newY += 1;
    }
    setCurrentMonthIndex(newM);
    setCurrentYear(newY);
    setDaysPlan(generateMonthDays(newY, newM, bmiValue, preferredCheatPattern));
  };

  const handlePatternChange = (pattern: 'weekends' | 'midweek_weekend' | 'sunday_only') => {
    setPreferredCheatPattern(pattern);
    setDaysPlan(generateMonthDays(currentYear, currentMonthIndex, bmiValue, pattern));
  };

  // Toggle a single day's type manually
  const handleToggleDayType = (dayNumber: number, newType: DayType) => {
    setDaysPlan(prev => prev.map(d => {
      if (d.dayNumber === dayNumber) {
        if (newType === 'junk') {
          return {
            ...d,
            type: 'junk',
            title: '🍕 Controlled Treat: Gourmet Veg Burger & Fries',
            junkFoodItem: 'Gourmet Veg Burger & Fries',
            lunch: 'Gourmet Veg Burger & Fries (600 kcal)',
            mitigationTip: 'Walk 20 mins post-meal and keep dinner light.'
          };
        } else if (newType === 'detox') {
          return {
            ...d,
            type: 'detox',
            title: '💧 Gut Detox & Metabolic Reset Day',
            lunch: 'Moong Dal Khichdi & Curd (450 kcal)',
            mitigationTip: 'Drink 3L+ water today to balance sodium levels.'
          };
        } else {
          return {
            ...d,
            type: 'healthy',
            title: '🥗 Clean Energy Day',
            lunch: 'Brown Rice, Rajma & Salad (550 kcal)'
          };
        }
      }
      return d;
    }));

    if (selectedDay && selectedDay.dayNumber === dayNumber) {
      setSelectedDay(prev => prev ? { ...prev, type: newType } : null);
    }
  };

  // Add ingredients of selected day to shopping list
  const handleAddDayIngredientsToShopping = (day: CalendarDayPlan) => {
    if (!onAddShoppingItem) return;

    day.ingredients.forEach(ing => {
      onAddShoppingItem({
        name: ing,
        category: day.type === 'junk' ? 'Snacks & Sweets' : 'Pantry & Grains',
        quantity: 1,
        unit: 'pack',
        estimatedPrice: day.type === 'junk' ? 120 : 65,
        isPurchased: false,
        priority: day.type === 'junk' ? 'low' : 'medium',
        notes: `For ${day.type.toUpperCase()} Day #${day.dayNumber} (${day.dateStr})`
      });
    });

    setAddedItemNotice(`Added ${day.ingredients.length} items for Day ${day.dayNumber} to FreshCart Shopping List!`);
    setTimeout(() => setAddedItemNotice(null), 3500);
  };

  // Counts summary
  const healthyCount = daysPlan.filter(d => d.type === 'healthy').length;
  const junkCount = daysPlan.filter(d => d.type === 'junk').length;
  const detoxCount = daysPlan.filter(d => d.type === 'detox').length;

  const todayDate = new Date();
  const isCurrentRealMonth = todayDate.getFullYear() === currentYear && todayDate.getMonth() === currentMonthIndex;
  const todayDayNumber = todayDate.getDate();

  return (
    <div className="space-y-6">
      {/* BMI Guidance Header Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>BMI Nutrition & Junk Food Schedule</span>
              </span>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${bmiCategory.bg} ${bmiCategory.color}`}>
                BMI {bmiValue} • {bmiCategory.label}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Personalized {monthNames[currentMonthIndex]} Meal Calendar
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
              {bmiValue < 18.5 && "Since your BMI indicates Underweight, your plan includes 3 controlled high-calorie cheat days per week to safely build healthy weight."}
              {bmiValue >= 18.5 && bmiValue <= 24.9 && "Your BMI is in the Healthy Range! Enjoy the 80/20 balance: 5 clean healthy days + 2 fun treat days per week without guilt."}
              {bmiValue > 24.9 && bmiValue <= 29.9 && "For your BMI (Overweight range), your schedule allows 1 controlled cheat meal day per week followed by a hydration detox day."}
              {bmiValue >= 30 && "For your BMI (Obese range), reward cheat days occur every 14 days with portion limits and post-meal walk guidelines to keep you on track."}
            </p>
          </div>

          {/* Monthly Counts Pills */}
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl text-center space-y-0.5 min-w-[5.5rem]">
              <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center justify-center gap-1">
                <Salad className="w-3 h-3 text-emerald-600" /> Healthy
              </span>
              <span className="text-lg font-black text-emerald-950">{healthyCount} Days</span>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl text-center space-y-0.5 min-w-[5.5rem]">
              <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center justify-center gap-1">
                <Pizza className="w-3 h-3 text-amber-600" /> Junk Treats
              </span>
              <span className="text-lg font-black text-amber-950">{junkCount} Days</span>
            </div>

            {detoxCount > 0 && (
              <div className="bg-sky-50 border border-sky-200/80 p-3 rounded-2xl text-center space-y-0.5 min-w-[5.5rem]">
                <span className="text-[10px] font-bold text-sky-800 uppercase flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-600" /> Detox Days
                </span>
                <span className="text-lg font-black text-sky-950">{detoxCount} Days</span>
              </div>
            )}
          </div>
        </div>

        {/* Added Toast Notice */}
        {addedItemNotice && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between text-xs font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{addedItemNotice}</span>
            </div>
          </div>
        )}

        {/* Preference Selector & Month Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Pattern Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Cheat Day Preference:
            </span>
            <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => handlePatternChange('midweek_weekend')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all ${
                  preferredCheatPattern === 'midweek_weekend'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Wed & Sun
              </button>
              <button
                onClick={() => handlePatternChange('weekends')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all ${
                  preferredCheatPattern === 'weekends'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sat & Sun
              </button>
              <button
                onClick={() => handlePatternChange('sunday_only')}
                className={`px-3 py-1 rounded-xl font-extrabold transition-all ${
                  preferredCheatPattern === 'sunday_only'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sunday Only
              </button>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleMonthPrev}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-slate-900 px-2 min-w-[8rem] text-center">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>
            <button
              onClick={handleMonthNext}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/90 p-6 shadow-sm space-y-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2.5">
          {daysPlan.map((day) => {
            const isToday = isCurrentRealMonth && day.dayNumber === todayDayNumber;

            return (
              <div
                key={day.dayNumber}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[6.5rem] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isToday ? 'ring-2 ring-indigo-500 shadow-md' : ''
                } ${
                  day.type === 'junk'
                    ? 'bg-amber-50/70 hover:bg-amber-100/90 border-amber-200/90'
                    : day.type === 'detox'
                    ? 'bg-sky-50/70 hover:bg-sky-100/90 border-sky-200/90'
                    : 'bg-emerald-50/50 hover:bg-emerald-100/70 border-emerald-200/80'
                }`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${isToday ? 'text-indigo-600 font-extrabold' : 'text-slate-800'}`}>
                    {day.dayNumber}
                  </span>

                  {isToday && (
                    <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">
                      TODAY
                    </span>
                  )}

                  {/* Icon Badge */}
                  {day.type === 'junk' && (
                    <span className="p-1 bg-amber-200 text-amber-900 rounded-lg shadow-2xs" title="Junk Food / Cheat Day">
                      <Pizza className="w-3.5 h-3.5 fill-amber-500 text-amber-800" />
                    </span>
                  )}
                  {day.type === 'detox' && (
                    <span className="p-1 bg-sky-200 text-sky-900 rounded-lg shadow-2xs" title="Detox Reset Day">
                      <Droplets className="w-3.5 h-3.5 text-sky-700" />
                    </span>
                  )}
                  {day.type === 'healthy' && (
                    <span className="p-1 bg-emerald-200 text-emerald-900 rounded-lg shadow-2xs" title="Clean Eating Day">
                      <Salad className="w-3.5 h-3.5 text-emerald-700" />
                    </span>
                  )}
                </div>

                {/* Day Content Title */}
                <div className="space-y-0.5 my-1">
                  <div className={`text-[10px] font-bold line-clamp-2 leading-tight ${
                    day.type === 'junk' ? 'text-amber-950 font-black' : day.type === 'detox' ? 'text-sky-950' : 'text-slate-800'
                  }`}>
                    {day.type === 'junk' ? day.junkFoodItem || 'Pizza / Cheat Day' : day.type === 'detox' ? 'Detox Reset' : day.breakfast.split(' ')[0] + ' & Healthy'}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 block">
                    ~{day.calorieTarget} kcal
                  </span>
                </div>

                {/* Action Indicator */}
                <div className="text-[9px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors flex items-center justify-between pt-1 border-t border-slate-200/40">
                  <span className="uppercase text-[8px] font-extrabold tracking-wider">
                    {day.type === 'junk' ? '🍕 TREAT' : day.type === 'detox' ? '💧 DETOX' : '🥗 CLEAN'}
                  </span>
                  <span>Inspect →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY INSPECTION MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  selectedDay.type === 'junk'
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : selectedDay.type === 'detox'
                    ? 'bg-sky-100 text-sky-950 border-sky-300'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  Day {selectedDay.dayNumber} • {selectedDay.dayOfWeek}, {monthNames[currentMonthIndex]} {selectedDay.dayNumber}
                </span>

                <span className="text-xs font-bold text-slate-500">
                  Target: {selectedDay.calorieTarget} kcal
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mt-2">
                {selectedDay.title}
              </h3>
            </div>

            {/* Day Type Toggle Buttons */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">Change Day Schedule Type:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => handleToggleDayType(selectedDay.dayNumber, 'healthy')}
                  className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    selectedDay.type === 'healthy'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                  }`}
                >
                  <Salad className="w-3.5 h-3.5" />
                  <span>Healthy Day</span>
                </button>

                <button
                  onClick={() => handleToggleDayType(selectedDay.dayNumber, 'junk')}
                  className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    selectedDay.type === 'junk'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                  }`}
                >
                  <Pizza className="w-3.5 h-3.5" />
                  <span>Junk / Treat</span>
                </button>

                <button
                  onClick={() => handleToggleDayType(selectedDay.dayNumber, 'detox')}
                  className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    selectedDay.type === 'detox'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-200'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Detox Reset</span>
                </button>
              </div>
            </div>

            {/* Meal Plan Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Full Day Meal Plan
              </h4>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-slate-900 block">🌅 Breakfast:</span>
                    <span className="text-slate-600 font-medium">{selectedDay.breakfast}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                  selectedDay.type === 'junk' ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div>
                    <span className={`font-extrabold block ${selectedDay.type === 'junk' ? 'text-amber-950' : 'text-slate-900'}`}>
                      ☀️ Lunch:
                    </span>
                    <span className="text-slate-700 font-medium">{selectedDay.lunch}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-slate-900 block">☕ Snack:</span>
                    <span className="text-slate-600 font-medium">{selectedDay.snack}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-slate-900 block">🌙 Dinner:</span>
                    <span className="text-slate-600 font-medium">{selectedDay.dinner}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Junk Mitigation Rules */}
            {selectedDay.type === 'junk' && selectedDay.mitigationTip && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-1.5">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>BMI Junk Meal Guilt-Free Protocol:</span>
                </span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {selectedDay.mitigationTip}
                </p>
              </div>
            )}

            {/* Required Ingredients List */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-700 block">
                Required Grocery Ingredients:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedDay.ingredients.map((ing, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-slate-200">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {onAddShoppingItem && (
                <button
                  onClick={() => handleAddDayIngredientsToShopping(selectedDay)}
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add Ingredients to Shopping List</span>
                </button>
              )}

              <button
                onClick={() => setSelectedDay(null)}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-2xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
