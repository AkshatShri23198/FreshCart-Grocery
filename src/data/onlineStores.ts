export interface OnlineStore {
  id: string;
  name: string;
  tagline: string;
  category: 'Fast Delivery (10 Mins)' | 'Organic & Farm Fresh' | 'Supermarket & Bulk' | 'Specialty & Gourmet' | 'Express Delivery';
  logoUrl: string;
  websiteUrl: string;
  searchUrlTemplate: string;
  rating: number;
  avgDeliveryTime: string;
  minOrderForFreeShipping: string;
  membershipRequirement: string;
  promoCode?: string;
  promoDescription?: string;
  perks: string[];
  popularCategories: string[];
  color: string;
}

export const ONLINE_STORES: OnlineStore[] = [
  {
    id: 'blinkit',
    name: 'Blinkit (formerly Grofers)',
    tagline: 'India\'s favorite 10-minute grocery delivery for fresh veggies, milk, snacks & household items',
    category: 'Fast Delivery (10 Mins)',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    websiteUrl: 'https://blinkit.com',
    searchUrlTemplate: 'https://blinkit.com/s/?q={query}',
    rating: 4.9,
    avgDeliveryTime: '8 - 12 Minutes',
    minOrderForFreeShipping: 'Free delivery on orders above ₹199',
    membershipRequirement: 'None (Zomato Gold benefits apply)',
    promoCode: 'BLINKIT50',
    promoDescription: '₹50 off on first order above ₹249',
    perks: ['Ultra-fast 10-minute delivery', 'Fresh dairy & morning bakery', 'Zero hassle returns'],
    popularCategories: ['Fresh Milk & Paneer', 'Atta & Rice', 'Snacks & Namkeen', 'Cleaning Essentials'],
    color: 'amber',
  },
  {
    id: 'zepto',
    name: 'Zepto',
    tagline: 'Lightning-fast 10-minute grocery delivery with fresh farm produce & daily needs',
    category: 'Fast Delivery (10 Mins)',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=80',
    websiteUrl: 'https://www.zeptowill.com',
    searchUrlTemplate: 'https://www.zeptowill.com/search?q={query}',
    rating: 4.8,
    avgDeliveryTime: '10 Minutes',
    minOrderForFreeShipping: 'Free delivery above ₹149 with Zepto Pass',
    membershipRequirement: 'Optional (Zepto Pass for ₹19/month)',
    promoCode: 'ZEPTO100',
    promoDescription: 'Flat ₹100 cashback on first 3 orders',
    perks: ['Zepto Pass free delivery', 'Freshly plucked fruits & vegetables', 'Cold-chain preserved dairy'],
    popularCategories: ['Farm Fresh Produce', 'Cold Drinks & Juices', 'Chocolates & Ice Cream', 'Personal Care'],
    color: 'indigo',
  },
  {
    id: 'instamart',
    name: 'Swiggy Instamart',
    tagline: 'Instant grocery delivery anytime from early morning to late night via Swiggy app',
    category: 'Fast Delivery (10 Mins)',
    logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=150&auto=format&fit=crop&q=80',
    websiteUrl: 'https://www.swiggy.com/instamart',
    searchUrlTemplate: 'https://www.swiggy.com/instamart/search?custom_back=true&query={query}',
    rating: 4.8,
    avgDeliveryTime: '10 - 15 Minutes',
    minOrderForFreeShipping: 'Free for Swiggy One members (above ₹149)',
    membershipRequirement: 'Swiggy One (Optional for extra discounts)',
    promoCode: 'INSTAFRESH',
    promoDescription: 'Up to ₹75 off on grocery cart value ₹399+',
    perks: ['Integrated with Swiggy One', '24x7 instant order availability', 'Great deals on pantry combos'],
    popularCategories: ['Curd, Butter & Cheese', 'Spices & Masalas', 'Biscuits & Munchies'],
    color: 'orange',
  },
  {
    id: 'bigbasket',
    name: 'BigBasket (BB Now & Slotted)',
    tagline: 'Tata\'s complete online supermarket offering 40,000+ products with 10-min BB Now delivery',
    category: 'Supermarket & Bulk',
    logoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=80',
    websiteUrl: 'https://www.bigbasket.com',
    searchUrlTemplate: 'https://www.bigbasket.com/ps/?q={query}',
    rating: 4.7,
    avgDeliveryTime: '15 Mins (BB Now) / Scheduled Same-Day',
    minOrderForFreeShipping: 'Free shipping on orders above ₹500',
    membershipRequirement: 'bbstar membership (Optional ₹299/6 mos)',
    promoCode: 'BBTATA15',
    promoDescription: '15% discount with NeuCoins & Tata Neu',
    perks: ['Fresho organic vegetables', 'Lowest price guarantee on staples', 'NeuCoins rewards on every order'],
    popularCategories: ['Organic Pulses & Grains', 'Exotic Vegetables', 'Ghee & Cooking Oils'],
    color: 'emerald',
  },
  {
    id: 'jiomart',
    name: 'JioMart (Reliance Retail)',
    tagline: 'Wholesale prices on daily groceries, staples, home care & electronics with zero delivery fee',
    category: 'Supermarket & Bulk',
    logoUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=150&auto=format&fit=crop&q=80',
    websiteUrl: 'https://www.jiomart.com',
    searchUrlTemplate: 'https://www.jiomart.com/search/{query}',
    rating: 4.6,
    avgDeliveryTime: 'Same Day / Next Day Slotted',
    minOrderForFreeShipping: 'NO minimum order value for free delivery',
    membershipRequirement: 'Free for all users',
    promoCode: 'JIOFRESH',
    promoDescription: 'Extra ₹100 off on first order above ₹799',
    perks: ['Direct from Reliance Smart stores', 'Zero delivery charge', 'Great bulk discounts on Kirana staples'],
    popularCategories: ['Aashirvaad Atta', 'Fortune Oils', 'Dry Fruits & Nuts', 'Soaps & Detergents'],
    color: 'blue',
  },
  {
    id: 'amazon_fresh_in',
    name: 'Amazon Fresh India',
    tagline: 'High quality groceries delivered in 2-hour slots with Prime savings and cashback',
    category: 'Express Delivery',
    logoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150&auto=format&fit=crop&q=80',
    websiteUrl: 'https://www.amazon.in/alm/storefront',
    searchUrlTemplate: 'https://www.amazon.in/s?i=nowstore&k={query}',
    rating: 4.7,
    avgDeliveryTime: '2-Hour Slotted Delivery',
    minOrderForFreeShipping: 'Free delivery on ₹299+ for Prime',
    membershipRequirement: 'Amazon Prime India',
    promoCode: 'FRESHIN200',
    promoDescription: '₹200 cashback on first Amazon Fresh order',
    perks: ['5% Unlimited cashback on Amazon Pay ICICI card', 'Guaranteed freshness quality check', 'Scheduled convenient slots'],
    popularCategories: ['Fresh Meat & Seafood', 'Imported Chocolates', 'International Sauces'],
    color: 'teal',
  },
];
