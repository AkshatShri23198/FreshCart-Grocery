import { CategoryType } from '../types';

export interface MarketProduct {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  packSize: string;
  mrp: number;
  bestPrice: number;
  bestStore: 'Blinkit' | 'Zepto' | 'Swiggy Instamart' | 'BigBasket' | 'Amazon Fresh' | 'JioMart';
  rating: number;
  imageUrl: string;
  description: string;
  storePrices: {
    storeName: 'Blinkit' | 'Zepto' | 'Swiggy Instamart' | 'BigBasket' | 'Amazon Fresh' | 'JioMart';
    price: number;
    deliveryTime: string;
    inStock: boolean;
  }[];
}

export const REAL_MARKET_PRODUCTS: MarketProduct[] = [
  // DAIRY & EGGS
  {
    id: 'mp_1',
    name: 'Amul Taaza Toned Fresh Milk',
    brand: 'Amul',
    category: 'Dairy & Eggs',
    packSize: '1 L pouch',
    mrp: 56,
    bestPrice: 56,
    bestStore: 'Blinkit',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
    description: 'Pasteurized toned milk, homogenized with 3.0% fat and 8.5% SNF.',
    storePrices: [
      { storeName: 'Blinkit', price: 56, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Zepto', price: 56, deliveryTime: '8 Mins', inStock: true },
      { storeName: 'Swiggy Instamart', price: 56, deliveryTime: '12 Mins', inStock: true },
      { storeName: 'BigBasket', price: 55, deliveryTime: '15 Mins', inStock: true },
    ]
  },
  {
    id: 'mp_2',
    name: 'Amul Pasteurised Butter',
    brand: 'Amul',
    category: 'Dairy & Eggs',
    packSize: '500 g carton',
    mrp: 275,
    bestPrice: 265,
    bestStore: 'BigBasket',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80',
    description: 'Utterly butterly delicious butter made from pure milk fat.',
    storePrices: [
      { storeName: 'Blinkit', price: 275, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Zepto', price: 270, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'BigBasket', price: 265, deliveryTime: 'Same Day', inStock: true },
      { storeName: 'Amazon Fresh', price: 268, deliveryTime: '2 Hours', inStock: true }
    ]
  },
  {
    id: 'mp_3',
    name: 'Amul Fresh Malai Paneer',
    brand: 'Amul',
    category: 'Dairy & Eggs',
    packSize: '200 g pack',
    mrp: 95,
    bestPrice: 90,
    bestStore: 'Zepto',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80',
    description: 'Rich, soft, creamy cottage cheese packed in hygienic sealed foil.',
    storePrices: [
      { storeName: 'Zepto', price: 90, deliveryTime: '8 Mins', inStock: true },
      { storeName: 'Blinkit', price: 92, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Swiggy Instamart', price: 95, deliveryTime: '11 Mins', inStock: true },
    ]
  },
  {
    id: 'mp_4',
    name: 'Farm Fresh White Eggs (10 Eggs)',
    brand: 'Eggy Farms',
    category: 'Dairy & Eggs',
    packSize: '10 pcs tray',
    mrp: 90,
    bestPrice: 82,
    bestStore: 'Swiggy Instamart',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&auto=format&fit=crop&q=80',
    description: 'Clean, quality-checked white eggs rich in protein.',
    storePrices: [
      { storeName: 'Swiggy Instamart', price: 82, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Blinkit', price: 85, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'BigBasket', price: 80, deliveryTime: '15 Mins', inStock: true },
    ]
  },

  // BAKERY
  {
    id: 'mp_5',
    name: 'Britannia 100% Whole Wheat Bread',
    brand: 'Britannia',
    category: 'Bakery',
    packSize: '400 g pack',
    mrp: 50,
    bestPrice: 48,
    bestStore: 'Blinkit',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
    description: 'Soft, healthy 100% whole wheat bread baked daily with zero maida.',
    storePrices: [
      { storeName: 'Blinkit', price: 48, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Zepto', price: 50, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Swiggy Instamart', price: 50, deliveryTime: '12 Mins', inStock: true },
    ]
  },

  // PRODUCE (VEGETABLES & FRUITS)
  {
    id: 'mp_6',
    name: 'Fresh Hybrid Red Tomatoes',
    brand: 'Farm Fresh',
    category: 'Produce',
    packSize: '1 kg bag',
    mrp: 40,
    bestPrice: 32,
    bestStore: 'Zepto',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
    description: 'Plump, firm, pesticide-tested ripe red tomatoes direct from farms.',
    storePrices: [
      { storeName: 'Zepto', price: 32, deliveryTime: '8 Mins', inStock: true },
      { storeName: 'Blinkit', price: 35, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'BigBasket', price: 30, deliveryTime: 'Same Day', inStock: true },
      { storeName: 'JioMart', price: 28, deliveryTime: 'Tomorrow', inStock: true },
    ]
  },
  {
    id: 'mp_7',
    name: 'Fresh Onions / Pyaz',
    brand: 'Farm Fresh',
    category: 'Produce',
    packSize: '1 kg bag',
    mrp: 35,
    bestPrice: 28,
    bestStore: 'BigBasket',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&auto=format&fit=crop&q=80',
    description: 'Grade-A dried onions essential for curry gravies & salads.',
    storePrices: [
      { storeName: 'BigBasket', price: 28, deliveryTime: '15 Mins', inStock: true },
      { storeName: 'Blinkit', price: 30, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Zepto', price: 32, deliveryTime: '10 Mins', inStock: true },
    ]
  },
  {
    id: 'mp_8',
    name: 'Fresh Robusta Bananas',
    brand: 'Farm Fresh',
    category: 'Produce',
    packSize: '500 g (~3-4 pcs)',
    mrp: 45,
    bestPrice: 38,
    bestStore: 'Blinkit',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80',
    description: 'Naturally ripened sweet, energy-rich Robusta bananas.',
    storePrices: [
      { storeName: 'Blinkit', price: 38, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Swiggy Instamart', price: 40, deliveryTime: '12 Mins', inStock: true },
      { storeName: 'Zepto', price: 39, deliveryTime: '10 Mins', inStock: true },
    ]
  },

  // STAPLES & PANTRY
  {
    id: 'mp_9',
    name: 'Aashirvaad Shuddh Chakki Whole Wheat Atta',
    brand: 'ITC Aashirvaad',
    category: 'Pantry & Grains',
    packSize: '5 kg bag',
    mrp: 270,
    bestPrice: 245,
    bestStore: 'BigBasket',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
    description: '100% stone-ground whole wheat grain flour for soft, fluffy rotis.',
    storePrices: [
      { storeName: 'BigBasket', price: 245, deliveryTime: '15 Mins', inStock: true },
      { storeName: 'JioMart', price: 240, deliveryTime: 'Same Day', inStock: true },
      { storeName: 'Amazon Fresh', price: 248, deliveryTime: '2 Hours', inStock: true },
      { storeName: 'Blinkit', price: 255, deliveryTime: '10 Mins', inStock: true },
    ]
  },
  {
    id: 'mp_10',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'Pantry & Grains',
    packSize: '1 L pouch',
    mrp: 160,
    bestPrice: 138,
    bestStore: 'JioMart',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80',
    description: 'Light, healthy refined sunflower cooking oil with Vitamin A & D.',
    storePrices: [
      { storeName: 'JioMart', price: 138, deliveryTime: 'Same Day', inStock: true },
      { storeName: 'BigBasket', price: 142, deliveryTime: '15 Mins', inStock: true },
      { storeName: 'Amazon Fresh', price: 145, deliveryTime: '2 Hours', inStock: true },
      { storeName: 'Blinkit', price: 150, deliveryTime: '10 Mins', inStock: true }
    ]
  },

  // SNACKS & INSTANT
  {
    id: 'mp_11',
    name: 'Maggi 2-Minute Masala Instant Noodles',
    brand: 'Nestle Maggi',
    category: 'Snacks & Sweets',
    packSize: '12-Pack (840g)',
    mrp: 168,
    bestPrice: 152,
    bestStore: 'Blinkit',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&auto=format&fit=crop&q=80',
    description: 'India’s favorite instant noodles infused with signature roasted spices.',
    storePrices: [
      { storeName: 'Blinkit', price: 152, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Zepto', price: 155, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Swiggy Instamart', price: 156, deliveryTime: '12 Mins', inStock: true },
      { storeName: 'Amazon Fresh', price: 150, deliveryTime: '2 Hours', inStock: true },
    ]
  },
  {
    id: 'mp_12',
    name: "Lay's India's Magic Masala Potato Chips",
    brand: "Lay's",
    category: 'Snacks & Sweets',
    packSize: '50 g pack',
    mrp: 20,
    bestPrice: 20,
    bestStore: 'Blinkit',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80',
    description: 'Crunchy potato chips seasoned with spicy, tangy Indian spices.',
    storePrices: [
      { storeName: 'Blinkit', price: 20, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Zepto', price: 20, deliveryTime: '8 Mins', inStock: true },
      { storeName: 'Swiggy Instamart', price: 20, deliveryTime: '10 Mins', inStock: true },
    ]
  },

  // BEVERAGES
  {
    id: 'mp_13',
    name: 'Brooke Bond Red Label Tea / Chai Patti',
    brand: 'Red Label',
    category: 'Beverages',
    packSize: '500 g box',
    mrp: 310,
    bestPrice: 275,
    bestStore: 'Amazon Fresh',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80',
    description: 'Rich, strong black tea leaves crafted for aromatic kadak chai.',
    storePrices: [
      { storeName: 'Amazon Fresh', price: 275, deliveryTime: '2 Hours', inStock: true },
      { storeName: 'BigBasket', price: 280, deliveryTime: '15 Mins', inStock: true },
      { storeName: 'Blinkit', price: 295, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'JioMart', price: 270, deliveryTime: 'Same Day', inStock: true }
    ]
  },
  {
    id: 'mp_14',
    name: 'Nescafe Classic Instant Coffee Powder',
    brand: 'Nescafe',
    category: 'Beverages',
    packSize: '100 g glass jar',
    mrp: 380,
    bestPrice: 340,
    bestStore: 'Zepto',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
    description: '100% pure soluble coffee powder with bold taste & rich aroma.',
    storePrices: [
      { storeName: 'Zepto', price: 340, deliveryTime: '8 Mins', inStock: true },
      { storeName: 'Blinkit', price: 350, deliveryTime: '10 Mins', inStock: true },
      { storeName: 'Amazon Fresh', price: 335, deliveryTime: '2 Hours', inStock: true }
    ]
  },

  // HOUSEHOLD
  {
    id: 'mp_15',
    name: 'Surf Excel Easy Wash Detergent Powder',
    brand: 'Surf Excel',
    category: 'Household & Personal',
    packSize: '1 kg pack',
    mrp: 155,
    bestPrice: 135,
    bestStore: 'BigBasket',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80',
    description: 'Removes tough stains in half the time without harming fabric color.',
    storePrices: [
      { storeName: 'BigBasket', price: 135, deliveryTime: '15 Mins', inStock: true },
      { storeName: 'JioMart', price: 130, deliveryTime: 'Same Day', inStock: true },
      { storeName: 'Blinkit', price: 145, deliveryTime: '10 Mins', inStock: true }
    ]
  }
];

// Helper to generate accurate search links on online market sites
export const getMarketSearchUrl = (storeName: string, query: string) => {
  const q = encodeURIComponent(query);
  switch (storeName) {
    case 'Blinkit':
      return `https://blinkit.com/s/?q=${q}`;
    case 'Zepto':
      return `https://www.zeptowill.com/search?q=${q}`;
    case 'Swiggy Instamart':
      return `https://www.swiggy.com/instamart/search?custom_back=true&query=${q}`;
    case 'BigBasket':
      return `https://www.bigbasket.com/ps/?q=${q}`;
    case 'Amazon Fresh':
      return `https://www.amazon.in/s?i=nowstore&k=${q}`;
    case 'JioMart':
      return `https://www.jiomart.com/search/${q}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(query + ' buy online India')}`;
  }
};
