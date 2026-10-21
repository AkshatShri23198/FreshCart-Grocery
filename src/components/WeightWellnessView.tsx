import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Activity, 
  Scale, 
  Smile, 
  Zap, 
  Droplets, 
  Flame, 
  Sparkles, 
  Plus, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  ShoppingCart, 
  Heart, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Coffee, 
  Sun, 
  Moon, 
  Clock, 
  ArrowRight,
  Send,
  HelpCircle,
  Pizza
} from 'lucide-react';
import { ShoppingItem, MoodType, DayContextType, DietPreferenceType, WeightLogEntry } from '../types';
import { BmiJunkCalendar } from './BmiJunkCalendar';

interface WeightWellnessViewProps {
  onAddShoppingItem?: (item: Omit<ShoppingItem, 'id'>) => void;
}

interface Meal {
  title: string;
  time: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  description: string;
  keyIngredients: string[];
  moodBenefit: string;
}

interface DayMealPlan {
  id: string;
  mood: MoodType;
  dayContext: DayContextType;
  dietPref: DietPreferenceType;
  title: string;
  summary: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
}

interface WorkoutRoutine {
  id: string;
  title: string;
  category: 'Cardio' | 'Strength' | 'Yoga' | 'HIIT';
  durationMins: number;
  estCaloriesBurned: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  description: string;
  exercises: { name: string; durationOrReps: string; target: string }[];
}

export const WeightWellnessView: React.FC<WeightWellnessViewProps> = ({ onAddShoppingItem }) => {
  // --- Sub-Tab State ---
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'bmi_calendar' | 'diet' | 'workout' | 'hydration'>('bmi_calendar');

  // --- Unit Conversion Helpers ---
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    let feet = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);
    if (inches === 12) {
      feet += 1;
      inches = 0;
    }
    return { feet, inches };
  };

  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.max(120, Math.min(220, Math.round(((feet * 12) + inches) * 2.54)));
  };

  const kgToLbs = (kg: number) => parseFloat((kg * 2.20462).toFixed(1));
  const lbsToKg = (lbs: number) => parseFloat((lbs / 2.20462).toFixed(1));

  // --- BMI Calculator State ---
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState<number>(172);

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightKg, setWeightKg] = useState<number>(68);

  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'high'>('moderate');
  const [fitnessGoal, setFitnessGoal] = useState<'loss' | 'maintain' | 'gain'>('loss');

  // --- Weight History Log State ---
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>(() => {
    const saved = localStorage.getItem('freshcart_weight_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'w1', date: '2026-07-01', weightKg: 71.5, bmi: 24.2, notes: 'Starting journey' },
      { id: 'w2', date: '2026-07-10', weightKg: 70.0, bmi: 23.7, notes: 'Consistent walking' },
      { id: 'w3', date: '2026-07-20', weightKg: 68.0, bmi: 23.0, notes: 'Healthy Indian diet & workouts' },
    ];
  });
  const [newLogWeight, setNewLogWeight] = useState<string>('');
  const [newLogNote, setNewLogNote] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('freshcart_weight_logs', JSON.stringify(weightLogs));
  }, [weightLogs]);

  // --- Mood Diet Recommender State ---
  const [selectedMood, setSelectedMood] = useState<MoodType>('stressed');
  const [selectedDay, setSelectedDay] = useState<DayContextType>('workday');
  const [selectedDietPref, setSelectedDietPref] = useState<DietPreferenceType>('veg');
  const [addedMealPlans, setAddedMealPlans] = useState<string[]>([]);

  // --- Hydration Tracker State ---
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('freshcart_water_intake');
    return saved ? parseInt(saved, 10) : 5;
  });

  useEffect(() => {
    localStorage.setItem('freshcart_water_intake', waterGlasses.toString());
  }, [waterGlasses]);

  // --- Workouts Completed Today ---
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [caloriesBurnedToday, setCaloriesBurnedToday] = useState<number>(0);

  // --- Ask AI Wellness Assistant State ---
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- BMI Calculation Logic ---
  const heightMeters = heightCm / 100;
  const bmiValue = heightMeters > 0 ? parseFloat((weightKg / (heightMeters * heightMeters)).toFixed(1)) : 0;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', barColor: 'bg-sky-500' };
    if (bmi <= 24.9) return { label: 'Healthy Weight', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-500' };
    if (bmi <= 29.9) return { label: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', barColor: 'bg-amber-500' };
    return { label: 'Obese', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', barColor: 'bg-rose-500' };
  };

  const bmiCategory = getBmiCategory(bmiValue);

  // Ideal weight range calculation (BMI 18.5 - 24.9)
  const minIdealWeight = parseFloat((18.5 * heightMeters * heightMeters).toFixed(1));
  const maxIdealWeight = parseFloat((24.9 * heightMeters * heightMeters).toFixed(1));

  const minIdealWeightDisplay = weightUnit === 'lbs' ? `${kgToLbs(minIdealWeight)} lbs` : `${minIdealWeight} kg`;
  const maxIdealWeightDisplay = weightUnit === 'lbs' ? `${kgToLbs(maxIdealWeight)} lbs` : `${maxIdealWeight} kg`;

  // Derived Feet & Inches
  const currentFeetInches = cmToFeetInches(heightCm);
  const displayWeightValue = weightUnit === 'kg' ? weightKg : kgToLbs(weightKg);

  const handleFeetChange = (newFeet: number) => {
    const newCm = feetInchesToCm(newFeet, currentFeetInches.inches);
    setHeightCm(newCm);
  };

  const handleInchesChange = (newInches: number) => {
    const newCm = feetInchesToCm(currentFeetInches.feet, newInches);
    setHeightCm(newCm);
  };

  const handleWeightChange = (newVal: number) => {
    if (weightUnit === 'kg') {
      setWeightKg(newVal);
    } else {
      setWeightKg(lbsToKg(newVal));
    }
  };

  // BMR & TDEE Calculation (Mifflin-St Jeor Equation)
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr += gender === 'male' ? 5 : -161;

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725
  };
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  // Target Calorie & Macros
  let targetCalories = tdee;
  if (fitnessGoal === 'loss') targetCalories = Math.max(1200, Math.round(tdee - 450));
  if (fitnessGoal === 'gain') targetCalories = Math.round(tdee + 350);

  const targetProteinG = Math.round((targetCalories * 0.3) / 4); // 30% protein
  const targetCarbsG = Math.round((targetCalories * 0.45) / 4);   // 45% carbs
  const targetFatG = Math.round((targetCalories * 0.25) / 9);     // 25% fats

  const handleAddWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseFloat(newLogWeight);
    let wKg = weightKg;
    if (!isNaN(rawVal) && rawVal > 0) {
      wKg = weightUnit === 'lbs' ? lbsToKg(rawVal) : rawVal;
    }
    const computedBmi = parseFloat((wKg / (heightMeters * heightMeters)).toFixed(1));
    const newEntry: WeightLogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weightKg: wKg,
      bmi: computedBmi,
      notes: newLogNote || `Logged entry (${weightUnit === 'lbs' ? `${kgToLbs(wKg)} lbs` : `${wKg} kg`})`
    };
    setWeightLogs([newEntry, ...weightLogs]);
    setWeightKg(wKg);
    setNewLogWeight('');
    setNewLogNote('');
  };

  // --- Mood Diet Database ---
  const MOOD_DIET_DATABASE: DayMealPlan[] = [
    {
      id: 'plan_stressed_veg',
      mood: 'stressed',
      dayContext: 'workday',
      dietPref: 'veg',
      title: 'Serenity & Mindful Comfort Plan',
      summary: 'Rich in Magnesium, Omega-3s, and Tryptophan to soothe nervous tension, balance cortisol, and elevate mood.',
      totalCalories: 1650,
      totalProtein: 72,
      totalCarbs: 210,
      totalFat: 52,
      meals: [
        {
          title: 'Warm Cinnamon Oats with Almonds & Banana',
          time: 'Morning (8:00 AM)',
          calories: 380,
          proteinG: 14,
          carbsG: 62,
          fatG: 10,
          description: 'Rolled oats cooked in warm almond milk, topped with sliced banana, chia seeds, and raw walnuts.',
          keyIngredients: ['Rolled Oats', 'Almond Milk', 'Banana', 'Chia Seeds', 'Walnuts'],
          moodBenefit: 'Complex carbohydrates boost serotonin production to calm anxious nerves.'
        },
        {
          title: 'Palak Moong Dal with Jeera Rice & Cucumber Raita',
          time: 'Lunch (1:00 PM)',
          calories: 520,
          proteinG: 24,
          carbsG: 78,
          fatG: 14,
          description: 'Soothing yellow moong dal cooked with spinach, tempered with cumin ghee, served with steamed basmati rice and cooling yogurt raita.',
          keyIngredients: ['Yellow Moong Dal', 'Fresh Spinach', 'Basmati Rice', 'Curd/Yogurt', 'Cumin Seeds'],
          moodBenefit: 'Magnesium-rich spinach relaxes blood vessels and reduces fatigue.'
        },
        {
          title: 'Roasted Makhana (Fox Nuts) & Herbal Chamomile Tea',
          time: 'Snack (5:00 PM)',
          calories: 180,
          proteinG: 6,
          carbsG: 28,
          fatG: 5,
          description: 'Lightly roasted makhana with black pepper & rock salt paired with warm chamomile tea.',
          keyIngredients: ['Makhana (Fox Nuts)', 'Rock Salt', 'Chamomile Tea'],
          moodBenefit: 'Chamomile apigenin binds to brain receptors to promote calm and stress reduction.'
        },
        {
          title: 'Paneer Bhurji with Multigrain Roti & Avocado Salad',
          time: 'Dinner (8:00 PM)',
          calories: 570,
          proteinG: 28,
          carbsG: 42,
          fatG: 23,
          description: 'Crumble paneer sauteed with tomatoes, onions and turmeric, served with 2 multigrain rotis and sliced cucumber.',
          keyIngredients: ['Fresh Paneer', 'Tomatoes', 'Onions', 'Multigrain Atta', 'Cucumber'],
          moodBenefit: 'Protein & healthy fats stabilize blood sugar levels through the night.'
        }
      ]
    },
    {
      id: 'plan_energetic_protein',
      mood: 'energetic',
      dayContext: 'workout',
      dietPref: 'high_protein',
      title: 'Power Drive High-Protein Fuel',
      summary: 'Sustained energy with peak lean protein synthesis, complex carbs, and key electrolytes for high productivity.',
      totalCalories: 1950,
      totalProtein: 115,
      totalCarbs: 215,
      totalFat: 58,
      meals: [
        {
          title: 'Masala Egg Omelette & Whole Wheat Toast',
          time: 'Morning (8:00 AM)',
          calories: 420,
          proteinG: 26,
          carbsG: 34,
          fatG: 18,
          description: '3 farm-fresh eggs whisked with onions, green chilies and coriander, served with 2 slices of whole wheat toast.',
          keyIngredients: ['Eggs', 'Onions', 'Green Chilies', 'Whole Wheat Bread'],
          moodBenefit: 'Choline from egg yolks sharpens focus and enhances memory retention.'
        },
        {
          title: 'Grilled Tofu/Paneer Bowl with Quinoa & Roasted Veggies',
          time: 'Lunch (1:30 PM)',
          calories: 580,
          proteinG: 38,
          carbsG: 65,
          fatG: 18,
          description: 'Marinated paneer/tofu cubes grilled with bell peppers, broccoli, and served over fluffly quinoa.',
          keyIngredients: ['Paneer or Tofu', 'Quinoa', 'Broccoli', 'Bell Peppers', 'Olive Oil'],
          moodBenefit: 'High protein content prevents energy slumps and keeps stamina steady.'
        },
        {
          title: 'Sprouted Chana Chaat & Coconut Water',
          time: 'Snack (5:00 PM)',
          calories: 220,
          proteinG: 12,
          carbsG: 38,
          fatG: 3,
          description: 'Boiled sprouted Kala Chana tossed with pomegranate seeds, lemon juice & chat masala + fresh tender coconut water.',
          keyIngredients: ['Sprouted Kala Chana', 'Pomegranate', 'Lemon', 'Coconut Water'],
          moodBenefit: 'Electrolytes from coconut water rehydrate brain cells instantly.'
        },
        {
          title: 'High-Protein Soybean Curry with Whole Wheat Roti',
          time: 'Dinner (8:30 PM)',
          calories: 730,
          proteinG: 39,
          carbsG: 78,
          fatG: 19,
          description: 'Soy chunks simmered in aromatic onion-tomato gravy served with 2 soft rotis and green salad.',
          keyIngredients: ['Soya Chunks', 'Onions', 'Tomatoes', 'Multigrain Atta'],
          moodBenefit: 'Amino acids accelerate muscle repair and overnight metabolic recovery.'
        }
      ]
    },
    {
      id: 'plan_tired_detox',
      mood: 'tired',
      dayContext: 'detox',
      dietPref: 'sattvic',
      title: 'Gentle Vitality & Detox Rebalance',
      summary: 'Easy-to-digest Sattvic foods rich in antioxidants, iron, and gut-friendly probiotics to restore natural vigor.',
      totalCalories: 1450,
      totalProtein: 52,
      totalCarbs: 220,
      totalFat: 38,
      meals: [
        {
          title: 'Warm Lemon-Honey Water & Soaked Nuts + Fresh Papaya',
          time: 'Morning (7:30 AM)',
          calories: 240,
          proteinG: 6,
          carbsG: 38,
          fatG: 8,
          description: 'Fresh bowl of papaya cubes with 5 soaked almonds & 2 walnuts after warm detox lemon honey water.',
          keyIngredients: ['Fresh Papaya', 'Almonds', 'Walnuts', 'Lemon', 'Honey'],
          moodBenefit: 'Papain enzymes soothe digestion and reduce feelings of heaviness.'
        },
        {
          title: 'Wholesome Moong Dal Khichdi with Desi Ghee & Curd',
          time: 'Lunch (1:00 PM)',
          calories: 480,
          proteinG: 18,
          carbsG: 78,
          fatG: 12,
          description: 'Soft comfort khichdi cooked with split moong dal, rice, turmeric, and 1 tsp cow ghee, served with fresh bowl of curd.',
          keyIngredients: ['Split Yellow Moong Dal', 'Rice', 'Cow Ghee', 'Turmeric', 'Curd/Yogurt'],
          moodBenefit: 'Turmeric curcumin fights cellular inflammation and boosts vitality.'
        },
        {
          title: 'Warm Ginger Green Tea & Roasted Chana',
          time: 'Snack (4:30 PM)',
          calories: 160,
          proteinG: 8,
          carbsG: 24,
          fatG: 3,
          description: 'Crunchy roasted Bengal gram with a steaming mug of ginger-infused green tea.',
          keyIngredients: ['Roasted Chana', 'Ginger', 'Green Tea Bags'],
          moodBenefit: 'Gingerols stimulate blood circulation and clear mental brain fog.'
        },
        {
          title: 'Lauki (Bottle Gourd) Soup with Toasted Seeds & Multigrain Toast',
          time: 'Dinner (7:30 PM)',
          calories: 370,
          proteinG: 12,
          carbsG: 55,
          fatG: 10,
          description: 'Smooth bottle gourd & carrot soup seasoned with cumin and black pepper, served with toasted seed bread.',
          keyIngredients: ['Bottle Gourd (Lauki)', 'Carrot', 'Pumpkin Seeds', 'Multigrain Bread'],
          moodBenefit: 'Light evening meal ensures restful deep sleep without heartburn.'
        }
      ]
    }
  ];

  // Selected or Fallback Plan
  const currentPlan = MOOD_DIET_DATABASE.find(p => p.mood === selectedMood) || MOOD_DIET_DATABASE[0];

  const handleAddPlanToShopping = (plan: DayMealPlan) => {
    if (!onAddShoppingItem) return;
    const allIngredients = new Set<string>();
    plan.meals.forEach(m => m.keyIngredients.forEach(i => allIngredients.add(i)));

    allIngredients.forEach(ingName => {
      onAddShoppingItem({
        name: ingName,
        category: 'Pantry & Grains',
        quantity: 1,
        unit: 'pack',
        estimatedPrice: 65,
        isPurchased: false,
        priority: 'medium',
        notes: `For ${plan.title}`
      });
    });

    setAddedMealPlans(prev => [...prev, plan.id]);
    setTimeout(() => {
      setAddedMealPlans(prev => prev.filter(id => id !== plan.id));
    }, 4000);
  };

  // --- Workouts Database ---
  const WORKOUT_DATABASE: WorkoutRoutine[] = [
    {
      id: 'w_hiit',
      title: '15-Min Indian Fat-Burn HIIT',
      category: 'HIIT',
      durationMins: 15,
      estCaloriesBurned: 160,
      level: 'Beginner',
      equipment: 'None (Bodyweight)',
      description: 'Quick cardio burner targeting core and leg strength with zero equipment needed.',
      exercises: [
        { name: 'Jumping Jacks', durationOrReps: '45 secs ON / 15 secs Rest', target: 'Full Body Cardio' },
        { name: 'High Knees', durationOrReps: '45 secs ON / 15 secs Rest', target: 'Lower Body & Heart Rate' },
        { name: 'Bodyweight Squats', durationOrReps: '20 Reps', target: 'Glutes & Quads' },
        { name: 'Standing Torso Twists', durationOrReps: '30 Reps', target: 'Obliques & Core' },
        { name: 'Cool Down Deep Breaths', durationOrReps: '2 Mins', target: 'Heart Rate Recovery' },
      ]
    },
    {
      id: 'w_yoga',
      title: '20-Min Stress Relief & Spine Flow Yoga',
      category: 'Yoga',
      durationMins: 20,
      estCaloriesBurned: 110,
      level: 'Beginner',
      equipment: 'Yoga Mat',
      description: 'Gentle posture flow focused on relieving desk stiffness, lower back tension, and mental stress.',
      exercises: [
        { name: 'Cat-Cow Pose (Marjaryasana)', durationOrReps: '10 Breaths', target: 'Spine Flexibility' },
        { name: 'Downward Dog (Adho Mukha)', durationOrReps: '1 Minute Hold', target: 'Hamstrings & Calves' },
        { name: 'Warrior II Pose (Virabhadrasana)', durationOrReps: '30 secs per side', target: 'Hips & Legs' },
        { name: 'Child\'s Pose (Balasana)', durationOrReps: '3 Minutes Hold', target: 'Deep Relaxation' },
      ]
    },
    {
      id: 'w_strength',
      title: '30-Min High-Protein Muscle Sculpt',
      category: 'Strength',
      durationMins: 30,
      estCaloriesBurned: 240,
      level: 'Intermediate',
      equipment: 'Dumbbells or Water Bottles',
      description: 'Targeted resistance training to build lean muscle mass and boost resting metabolism.',
      exercises: [
        { name: 'Dumbbell Shoulder Press', durationOrReps: '3 Sets x 12 Reps', target: 'Shoulders & Arms' },
        { name: 'Goblet Squats', durationOrReps: '3 Sets x 15 Reps', target: 'Lower Body' },
        { name: 'Push-Ups / Knee Push-Ups', durationOrReps: '3 Sets x 10 Reps', target: 'Chest & Core' },
        { name: 'Dumbbell Bent-Over Rows', durationOrReps: '3 Sets x 12 Reps', target: 'Upper Back' },
        { name: 'Plank Hold', durationOrReps: '3 Sets x 45 Secs', target: 'Core Abs' },
      ]
    }
  ];

  const handleCompleteWorkout = (routine: WorkoutRoutine) => {
    if (!completedWorkouts.includes(routine.id)) {
      setCompletedWorkouts([...completedWorkouts, routine.id]);
      setCaloriesBurnedToday(prev => prev + routine.estCaloriesBurned);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Wellness & Fitness Question: ${aiQuestion}. Give concise, practical advice for someone in India with BMI ${bmiValue} (${bmiCategory.label}).` }],
          pantrySummary: `BMI: ${bmiValue}, Goal: ${fitnessGoal}, Activity: ${activityLevel}`
        })
      });
      const data = await res.json();
      setAiAnswer(data.reply || 'Stay hydrated, prioritize 7-8 hours of sleep, and balance your meals with high-protein lentils, veggies, and fiber!');
    } catch (err) {
      setAiAnswer('For weight management, focus on a 300-500 kcal deficit with 1.2g protein per kg of bodyweight, 30 mins daily walking, and 3L water.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Personal Fitness, Nutrition & Weight Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Weight & Mood-Based Wellness
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Calculate your exact BMI, discover balanced Indian diet plans tailored to your daily mood & schedule, track hydration, and power up with custom workouts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-3xl text-xs space-y-2.5 sm:w-72 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>Today's Vitality Summary</span>
              </span>
              <span className="bg-indigo-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-200 text-[11px]">
              <div className="bg-black/20 p-2 rounded-xl">
                <span className="block text-[10px] text-slate-400">BMI SCORE</span>
                <span className="font-extrabold text-white text-sm">{bmiValue}</span>
              </div>
              <div className="bg-black/20 p-2 rounded-xl">
                <span className="block text-[10px] text-slate-400">BURNED TODAY</span>
                <span className="font-extrabold text-amber-300 text-sm">{caloriesBurnedToday} kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('bmi_calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'bmi_calendar'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-200 border border-amber-300 font-extrabold'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Pizza className="w-4 h-4 text-amber-600 fill-amber-300" />
          <span>🍕 BMI Junk & Healthy Calendar</span>
          <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-1.5 py-0.5 rounded-full">
            New
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'calculator'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>BMI & Calorie Calculator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'diet'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Mood & Day Diet Plan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workout')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'workout'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Target Workouts</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hydration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'hydration'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Droplets className="w-4 h-4 text-sky-400" />
          <span>Hydration Tracker</span>
        </button>
      </div>

      {/* --- TAB 0: BMI JUNK & HEALTHY CALENDAR --- */}
      {activeSubTab === 'bmi_calendar' && (
        <BmiJunkCalendar
          bmiValue={bmiValue}
          bmiCategory={bmiCategory}
          fitnessGoal={fitnessGoal}
          weightKg={weightKg}
          heightCm={heightCm}
          onAddShoppingItem={onAddShoppingItem}
        />
      )}

      {/* --- TAB 1: BMI & METRICS CALCULATOR --- */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Inputs Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-5 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>Body Metrics Inputs</span>
              </h3>
              <span className="text-[10px] bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Height Input with Unit Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 block">Height</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        heightUnit === 'cm' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit('ft')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        heightUnit === 'ft' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      ft / in
                    </button>
                  </div>
                </div>

                {heightUnit === 'cm' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="120"
                      max="220"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <span className="font-black text-slate-900 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl text-xs flex-shrink-0">
                      {heightCm} cm
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Feet</label>
                        <select
                          value={currentFeetInches.feet}
                          onChange={(e) => handleFeetChange(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:outline-none"
                        >
                          {[4, 5, 6, 7].map((f) => (
                            <option key={f} value={f}>{f} ft</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Inches</label>
                        <select
                          value={currentFeetInches.inches}
                          onChange={(e) => handleInchesChange(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:outline-none"
                        >
                          {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>{i} in</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold flex items-center justify-between bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-xl">
                      <span>Equiv: <strong>{heightCm} cm</strong></span>
                      <span>{currentFeetInches.feet}' {currentFeetInches.inches}"</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight Input with Unit Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 block">Weight</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        weightUnit === 'kg' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        weightUnit === 'lbs' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={weightUnit === 'kg' ? "35" : "77"}
                    max={weightUnit === 'kg' ? "150" : "330"}
                    value={displayWeightValue}
                    onChange={(e) => handleWeightChange(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="font-black text-slate-900 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl text-xs flex-shrink-0">
                    {displayWeightValue} {weightUnit}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1 text-right">
                  Equiv: {weightUnit === 'kg' ? `${kgToLbs(weightKg)} lbs` : `${weightKg} kg`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        gender === 'male' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        gender === 'female' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Daily Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Lightly Active (Exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="high">Very Active (Heavy exercise 6-7 days/week)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Weight Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFitnessGoal('loss')}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] border transition-all ${
                      fitnessGoal === 'loss'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Weight Loss
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitnessGoal('maintain')}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] border transition-all ${
                      fitnessGoal === 'maintain'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Maintain
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitnessGoal('gain')}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] border transition-all ${
                      fitnessGoal === 'gain'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Muscle Gain
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Analytics Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-6 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>Calculated Health Metrics</span>
                </h3>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${bmiCategory.bg} ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              </div>

              {/* Big BMI Number & Visual Gauge */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Your Body Mass Index (BMI)</span>
                    <div className="text-4xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                      <span>{bmiValue}</span>
                      <span className="text-xs font-bold text-slate-500">kg/m²</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Ideal Healthy Weight</span>
                    <span className="text-sm font-black text-emerald-700 mt-1 block">
                      {minIdealWeightDisplay} – {maxIdealWeightDisplay}
                    </span>
                  </div>
                </div>

                {/* BMI Meter Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="w-[18.5%] h-full bg-sky-400" title="Underweight (<18.5)" />
                    <div className="w-[28%] h-full bg-emerald-500" title="Normal (18.5-24.9)" />
                    <div className="w-[20%] h-full bg-amber-400" title="Overweight (25-29.9)" />
                    <div className="w-[33.5%] h-full bg-rose-500" title="Obese (30+)" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>15.0</span>
                    <span>18.5 (Under)</span>
                    <span>25.0 (Healthy)</span>
                    <span>30.0 (Over)</span>
                    <span>40.0</span>
                  </div>
                </div>
              </div>

              {/* Energy & Macros Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-indigo-50/80 border border-indigo-100 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-indigo-600 block uppercase">BMR (Metabolism)</span>
                  <span className="text-lg font-black text-slate-900">{bmr} kcal</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">At complete rest</span>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Target Daily Kcal</span>
                  <span className="text-lg font-black text-emerald-950">{targetCalories} kcal</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">For {fitnessGoal} goal</span>
                </div>

                <div className="bg-amber-50/80 border border-amber-100 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-800 block uppercase">Daily Protein</span>
                  <span className="text-lg font-black text-slate-900">{targetProteinG}g</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">30% macro target</span>
                </div>

                <div className="bg-sky-50/80 border border-sky-100 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-sky-800 block uppercase">Daily Carbs & Fats</span>
                  <span className="text-base font-black text-slate-900">{targetCarbsG}g / {targetFatG}g</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Balanced energy</span>
                </div>
              </div>
            </div>

            {/* Weight History Logger */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Log Weight Progress Entry</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">History ({weightLogs.length})</span>
              </div>

              <form onSubmit={handleAddWeightLog} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder={`Weight in ${weightUnit} (e.g. ${displayWeightValue})`}
                  value={newLogWeight}
                  onChange={(e) => setNewLogWeight(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Note (e.g., Post workout)"
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log ({weightUnit})</span>
                </button>
              </form>

              {/* Recent Logs List */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                {weightLogs.map((log) => {
                  const valDisplay = weightUnit === 'lbs' ? `${kgToLbs(log.weightKg)} lbs` : `${log.weightKg} kg`;
                  return (
                    <div
                      key={log.id}
                      className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl text-xs whitespace-nowrap flex items-center gap-2 flex-shrink-0"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900">{valDisplay}</span>
                        <span className="text-[10px] text-slate-400 block">{log.date}</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        BMI {log.bmi}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MOOD & DAY-BASED DIET PLANNER --- */}
      {activeSubTab === 'diet' && (
        <div className="space-y-6">
          {/* Controls Selector Box */}
          <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-500" />
                <span>Configure Today's Mood & Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Select how you feel right now and your day's schedule to receive a perfectly balanced Indian diet plan.
              </p>
            </div>

            {/* Mood Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">1. How do you feel today? (Mood)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: 'stressed', label: '⚡ Stressed', desc: 'Need Mindful Comfort' },
                  { id: 'energetic', label: '🚀 Energetic', desc: 'High Focus Drive' },
                  { id: 'tired', label: '🥱 Tired', desc: 'Sluggish & Need Detox' },
                  { id: 'calm', label: '🧘 Calm', desc: 'Light & Gut Friendly' },
                  { id: 'recovery', label: '🏋️ Workout', desc: 'Post-Exercise Repair' },
                  { id: 'craving_sweet', label: '🥭 Sweet Craving', desc: 'Healthy Natural Fruit' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id as MoodType)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      selectedMood === m.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs block">{m.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${selectedMood === m.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Pref & Context Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">2. Dietary Preference</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'veg', label: '🌿 Pure Veg' },
                    { id: 'non_veg', label: '🍗 Non-Veg' },
                    { id: 'high_protein', label: '💪 High Protein' },
                    { id: 'sattvic', label: '🧘 Sattvic' },
                  ].map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => setSelectedDietPref(pref.id as DietPreferenceType)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedDietPref === pref.id
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">3. Day / Schedule Context</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'workday', label: '💼 Busy Workday' },
                    { id: 'workout', label: '🏃 Heavy Exercise' },
                    { id: 'detox', label: '🌿 Light Detox' },
                  ].map((ctx) => (
                    <button
                      key={ctx.id}
                      onClick={() => setSelectedDay(ctx.id as DayContextType)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedDay === ctx.id
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ctx.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Meal Plan Display Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-0.5 rounded-full text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tailored Diet Plan</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{currentPlan.title}</h3>
                <p className="text-xs text-slate-600 font-medium max-w-2xl">{currentPlan.summary}</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex-shrink-0">
                <div className="text-center px-2">
                  <span className="text-[10px] font-bold text-slate-400 block">KCAL</span>
                  <span className="font-black text-slate-900 text-sm">{currentPlan.totalCalories}</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <span className="text-[10px] font-bold text-slate-400 block">PROTEIN</span>
                  <span className="font-black text-emerald-700 text-sm">{currentPlan.totalProtein}g</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <span className="text-[10px] font-bold text-slate-400 block">CARBS</span>
                  <span className="font-black text-indigo-700 text-sm">{currentPlan.totalCarbs}g</span>
                </div>
              </div>
            </div>

            {/* Meals Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 rounded-3xl border border-slate-200/80 p-5 space-y-3 relative group hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
                      {meal.time}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {meal.calories} kcal • {meal.proteinG}g protein
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-base leading-snug">{meal.title}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{meal.description}</p>

                  <div className="bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl text-[11px] text-amber-900 font-medium flex items-start gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Mood Boost:</strong> {meal.moodBenefit}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {meal.keyIngredients.map((ing, iIdx) => (
                      <span key={iIdx} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Ingredients missing? Sync with FreshCart shopping list to purchase on Blinkit/Zepto in 1 click.
              </span>

              {onAddShoppingItem && (
                <button
                  onClick={() => handleAddPlanToShopping(currentPlan)}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
                >
                  {addedMealPlans.includes(currentPlan.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Added Ingredients to Shopping List!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add Ingredients to Shopping List</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: TARGET WORKOUTS --- */}
      {activeSubTab === 'workout' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {WORKOUT_DATABASE.map((routine) => {
              const isCompleted = completedWorkouts.includes(routine.id);

              return (
                <div
                  key={routine.id}
                  className="bg-white rounded-[2.5rem] border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between space-y-5 relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
                        {routine.category} • {routine.level}
                      </span>
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>~{routine.estCaloriesBurned} kcal</span>
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-lg leading-tight">{routine.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">{routine.description}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {routine.durationMins} Mins
                      </span>
                      <span>•</span>
                      <span>Equipment: {routine.equipment}</span>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Routine Steps</span>
                      <div className="space-y-1.5">
                        {routine.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{ex.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{ex.durationOrReps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteWorkout(routine)}
                    className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Workout Completed! (+{routine.estCaloriesBurned} kcal)</span>
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-4 h-4" />
                        <span>Start & Complete Routine</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 4: HYDRATION TRACKER --- */}
      {activeSubTab === 'hydration' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Droplets className="w-6 h-6 text-sky-500" />
                <span>Daily Hydration Goal (2.5 Liters / 10 Glasses)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Proper water intake flushes toxins, improves skin health, and curbs false hunger pangs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-sky-950">{waterGlasses} / 10</span>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                {(waterGlasses * 0.25).toFixed(2)} Liters
              </span>
            </div>
          </div>

          {/* Glasses Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {Array.from({ length: 10 }).map((_, idx) => {
              const isFilled = idx < waterGlasses;
              return (
                <button
                  key={idx}
                  onClick={() => setWaterGlasses(isFilled ? idx : idx + 1)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                    isFilled
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-100 scale-105'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-300 border-slate-200'
                  }`}
                >
                  <Droplets className={`w-6 h-6 ${isFilled ? 'fill-white' : ''}`} />
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setWaterGlasses(0)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
            >
              Reset today's water counter
            </button>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              {waterGlasses >= 8 ? '🎉 Hydration Goal Achieved!' : `Keep going! ${8 - waterGlasses} glasses remaining to reach daily minimum.`}
            </span>
          </div>
        </div>
      )}

      {/* --- ASK AI WELLNESS ASSISTANT --- */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-lg text-white">Ask Sprout AI Wellness Coach</h3>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Gemini Powered
          </span>
        </div>

        <form onSubmit={handleAskAi} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g.: Indian high-protein vegetarian snacks under 150 kcal?"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            className="flex-1 p-3.5 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 font-medium"
          />
          <button
            type="submit"
            disabled={isAiLoading}
            className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md flex-shrink-0"
          >
            {isAiLoading ? 'Thinking...' : <Send className="w-4 h-4" />}
          </button>
        </form>

        {aiAnswer && (
          <div className="bg-white/10 border border-white/15 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed font-medium">
            <p className="font-bold text-emerald-300 mb-1">Sprout AI Guidance:</p>
            {aiAnswer}
          </div>
        )}
      </div>
    </div>
  );
};
