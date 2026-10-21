import React, { useState } from 'react';
import { ONLINE_STORES, OnlineStore } from '../data/onlineStores';
import { REAL_MARKET_PRODUCTS, MarketProduct, getMarketSearchUrl } from '../data/marketProducts';
import { ShoppingItem, CategoryType } from '../types';
import { 
  Globe, 
  ExternalLink, 
  Search, 
  Truck, 
  Tag, 
  Star, 
  Check, 
  Copy, 
  ShoppingCart, 
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  Building2,
  ArrowRight,
  Store,
  Plus
} from 'lucide-react';

interface OnlineStoresDirectoryProps {
  shoppingItems?: ShoppingItem[];
  onAddItem?: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onGoToShoppingList?: () => void;
}

export const OnlineStoresDirectory: React.FC<OnlineStoresDirectoryProps> = ({
  shoppingItems = [],
  onAddItem,
  onGoToShoppingList
}) => {
  const [activeSection, setActiveSection] = useState<'products' | 'stores'>('products');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('All');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('All');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<string>('All');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const pendingItemsCount = shoppingItems.filter(i => !i.isPurchased).length;

  const productCategories: string[] = [
    'All',
    'Dairy & Eggs',
    'Produce',
    'Pantry & Grains',
    'Bakery',
    'Snacks & Sweets',
    'Beverages',
    'Household & Personal'
  ];

  const marketNames = ['All', 'Blinkit', 'Zepto', 'Swiggy Instamart', 'BigBasket', 'Amazon Fresh', 'JioMart'];

  // Filter products
  const filteredProducts = REAL_MARKET_PRODUCTS.filter(product => {
    const matchesCat = selectedProductCategory === 'All' || product.category === selectedProductCategory;
    const matchesStore = selectedStoreFilter === 'All' || product.storePrices.some(sp => sp.storeName === selectedStoreFilter);
    const q = productSearchQuery.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(q) ||
                          product.brand.toLowerCase().includes(q) ||
                          product.category.toLowerCase().includes(q) ||
                          product.description.toLowerCase().includes(q);
    return matchesCat && matchesStore && matchesSearch;
  });

  // Filter store directory
  const filteredStores = ONLINE_STORES.filter(store => {
    const matchesCategory = selectedStoreCategory === 'All' || store.category === selectedStoreCategory;
    const matchesSearch = store.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
                          store.tagline.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
                          store.perks.some(p => p.toLowerCase().includes(storeSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddProductToCart = (product: MarketProduct) => {
    if (!onAddItem) return;
    onAddItem({
      name: `${product.name} (${product.packSize})`,
      category: product.category,
      quantity: 1,
      unit: 'pack',
      estimatedPrice: product.bestPrice,
      priority: 'medium',
      notes: `From ${product.bestStore} via Online Markets`
    });

    setAddedItemNotice(product.name);
    setTimeout(() => setAddedItemNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Online Markets & Grocery Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Compare & Shop Across Online Markets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Compare live prices and delivery times across <strong>Blinkit, Zepto, Swiggy Instamart, BigBasket, Amazon Fresh & JioMart</strong>. Add items to your shopping list or open store pages with 1 click!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            {onGoToShoppingList && (
              <button
                onClick={onGoToShoppingList}
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black px-5 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border border-emerald-300"
              >
                <ShoppingCart className="w-4 h-4 text-slate-950" />
                <span>Shopping List ({pendingItemsCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>


      {addedItemNotice && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Added <strong>"{addedItemNotice}"</strong> to your FreshCart Shopping List!</span>
          </div>
          {onGoToShoppingList && (
            <button
              onClick={onGoToShoppingList}
              className="bg-white text-emerald-950 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              View List →
            </button>
          )}
        </div>
      )}

      {/* Main View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveSection('products')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeSection === 'products'
              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-400" />
          <span>Market Product Search & Compare</span>
          <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {REAL_MARKET_PRODUCTS.length} Items
          </span>
        </button>

        <button
          onClick={() => setActiveSection('stores')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            activeSection === 'stores'
              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Online Store Directory & Promos</span>
          <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {ONLINE_STORES.length} Stores
          </span>
        </button>
      </div>

      {/* SECTION 1: MARKET PRODUCTS & SEARCH */}
      {activeSection === 'products' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Product Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products (e.g. Milk, Atta, Tomatoes, Paneer, Tea, Chips, Soap)..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Store Filter Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" /> Market:
                </span>
                <select
                  value={selectedStoreFilter}
                  onChange={(e) => setSelectedStoreFilter(e.target.value)}
                  className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {marketNames.map((m) => (
                    <option key={m} value={m}>{m === 'All' ? 'All Online Markets' : m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedProductCategory(cat)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedProductCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Image & Badges */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {product.brand}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-slate-950" />
                      <span>Best on {product.bestStore}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                        {product.category}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{product.packSize}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing Comparison Across Markets */}
                  <div className="bg-slate-50 p-3 rounded-2xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Market Prices:</span>
                      <span className="text-emerald-700 font-extrabold text-sm">₹{product.bestPrice} <span className="text-[10px] text-slate-400 font-normal line-through">MRP ₹{product.mrp}</span></span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      {product.storePrices.map((sp) => (
                        <div key={sp.storeName} className="flex items-center justify-between text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{sp.storeName}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px]">({sp.deliveryTime})</span>
                            <span className="font-bold text-slate-800">₹{sp.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions: Add to FreshCart & Direct Buy */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddProductToCart(product)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to List</span>
                    </button>

                    <a
                      href={getMarketSearchUrl(product.bestStore, product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black py-2.5 px-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1 border border-amber-300 text-center"
                    >
                      <span>Buy on {product.bestStore}</span>
                      <ExternalLink className="w-3 h-3 text-slate-950" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center space-y-3">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No products match your search query</h3>
              <p className="text-xs text-slate-500">
                Try searching for general terms like "Milk", "Atta", "Biscuits", "Tomatoes", or "Tea".
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ONLINE STORE DIRECTORY */}
      {activeSection === 'stores' && (
        <div className="space-y-6">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {['All', 'Fast Delivery (10 Mins)', 'Supermarket & Bulk', 'Express Delivery'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedStoreCategory(cat)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedStoreCategory === cat
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search online store..."
                value={storeSearchQuery}
                onChange={(e) => setStoreSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Stores Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-[2.5rem] border border-slate-200/80 p-6 shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Store Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          {store.name}
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          {store.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-xl text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{store.rating}</span>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {store.tagline}
                  </p>

                  {/* Perks & Features */}
                  <div className="space-y-1.5 pt-1">
                    {store.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-500" /> Delivery:
                      </span>
                      <span className="font-black text-emerald-800">{store.avgDeliveryTime}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-medium">
                      {store.minOrderForFreeShipping}
                    </div>
                  </div>

                  {/* Promo Code Box */}
                  {store.promoCode && (
                    <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 uppercase">
                          <Tag className="w-3 h-3 text-amber-700" />
                          <span>Promo Coupon</span>
                        </div>
                        <p className="text-[11px] font-extrabold text-slate-900">
                          {store.promoCode}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyCode(store.promoCode!)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1"
                      >
                        {copiedCode === store.promoCode ? (
                          <>
                            <Check className="w-3 h-3 text-slate-950" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Visit Direct Website Button */}
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={store.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Visit {store.name.split(' ')[0]} Store</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
