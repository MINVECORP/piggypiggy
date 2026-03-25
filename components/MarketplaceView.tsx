
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { getSearchSuggestions } from '../services/geminiService';

interface MarketplaceViewProps {
  products: Product[];
  userBalance: number;
  initialMerchant?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ products, userBalance, initialMerchant = 'Todos' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedMerchant, setSelectedMerchant] = useState(initialMerchant);
  const [sortBy, setSortBy] = useState<'none' | 'priceAsc' | 'priceDesc'>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Sync with initialMerchant from props
  useEffect(() => {
    if (initialMerchant) {
      setSelectedMerchant(initialMerchant);
      if (initialMerchant !== 'Todos') {
        setShowFilters(false);
      }
    }
  }, [initialMerchant]);

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const merchants = useMemo(() => ['Todos', ...Array.from(new Set(products.map(p => p.merchantName)))], [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Todas': return 'fa-border-all';
      case 'Alimentos': return 'fa-apple-whole';
      case 'Snacks': return 'fa-cookie-bite';
      case 'Aseo': return 'fa-soap';
      case 'Tecno': return 'fa-microchip';
      default: return 'fa-tag';
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchesMerchant = selectedMerchant === 'Todos' || p.merchantName === selectedMerchant;
      return matchesSearch && matchesCategory && matchesMerchant;
    });

    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedMerchant, sortBy]);

  useEffect(() => {
    let timeoutId: number;
    if (searchQuery.length > 2 && filteredAndSortedProducts.length === 0) {
      setIsSearchingAI(true);
      timeoutId = window.setTimeout(async () => {
        const aiSuggestions = await getSearchSuggestions(searchQuery, categories.filter(c => c !== 'Todas'));
        setSuggestions(aiSuggestions);
        setIsSearchingAI(false);
      }, 800);
    } else {
      setSuggestions([]);
      setIsSearchingAI(false);
    }
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filteredAndSortedProducts.length, categories]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const canAffordCart = userBalance >= cartTotal;

  const hasActiveFilters = selectedCategory !== 'Todas' || selectedMerchant !== 'Todos' || sortBy !== 'none' || searchQuery !== '';

  return (
    <div className="w-full space-y-6 pb-24 relative animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-3xl font-black text-[#1A1A40] tracking-tight italic">MARKETPLACE</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full shadow-sm border transition-all flex items-center justify-center gap-2 ${
              showFilters || hasActiveFilters
              ? 'bg-[#FF007F] border-[#FF007F] text-white' 
              : 'bg-white border-slate-100 text-slate-600'
            }`}
          >
            <i className="fa-solid fa-sliders text-xs"></i>
            <span className="text-xs font-bold">Filtros</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-[#FF007F] transition-colors"></i>
        <input 
          type="text" 
          placeholder="¿Qué quieres comprar con tu ahorro?" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-sm focus:ring-2 focus:ring-pink-400 outline-none transition-all placeholder:text-slate-300 font-medium"
        />
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {selectedMerchant !== 'Todos' && (
            <button 
              onClick={() => setSelectedMerchant('Todos')}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 shrink-0"
            >
              <span>TIENDA: {selectedMerchant}</span>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          {selectedCategory !== 'Todas' && (
            <button 
              onClick={() => setSelectedCategory('Todas')}
              className="flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-[#FF007F] rounded-full text-[10px] font-black border border-pink-100 shrink-0"
            >
              <span>CAT: {selectedCategory}</span>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          {sortBy !== 'none' && (
            <button 
              onClick={() => setSortBy('none')}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black border border-slate-100 shrink-0"
            >
              <span>ORDEN: {sortBy === 'priceAsc' ? '$$+' : '$$$'}</span>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          {searchQuery !== '' && (
            <button 
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 shrink-0"
            >
              <span>BUSCA: {searchQuery}</span>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar for Filters on Desktop */}
        <div className={`lg:col-span-3 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Merchants Explorer Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiendas Aliadas</label>
            </div>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
              {merchants.map(m => {
                const isActive = selectedMerchant === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMerchant(m)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all shrink-0 lg:w-full ${
                      isActive 
                      ? 'bg-[#1A1A40] border-[#CCFF00] text-white shadow-lg lg:translate-x-2' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${isActive ? 'bg-[#CCFF00] text-[#1A1A40]' : 'bg-slate-100 text-slate-400'}`}>
                      {m === 'Todos' ? <i className="fa-solid fa-globe"></i> : m.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-black whitespace-nowrap">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Categorías</label>
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all shrink-0 lg:w-full ${
                      isActive 
                      ? 'bg-[#1A1A40] border-[#FF007F] text-white shadow-lg lg:translate-x-2' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isActive ? 'bg-[#FF007F] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <i className={`fa-solid ${getCategoryIcon(cat)} text-xs`}></i>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-black uppercase tracking-tighter">{cat}</span>
                      <span className="text-[9px] font-bold opacity-50">
                        {cat === 'Todas' ? products.length : categoryCounts[cat] || 0} productos
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Product Grid */}
        <div className="lg:col-span-9 space-y-8">
          {/* Sorting and View Info */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mostrando {filteredAndSortedProducts.length} productos
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortBy(sortBy === 'priceAsc' ? 'none' : 'priceAsc')}
                className={`p-2 rounded-lg border transition-all ${sortBy === 'priceAsc' ? 'bg-[#1A1A40] text-[#CCFF00] border-[#1A1A40]' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                title="Menor precio"
              >
                <i className="fa-solid fa-arrow-up-short-wide"></i>
              </button>
              <button 
                onClick={() => setSortBy(sortBy === 'priceDesc' ? 'none' : 'priceDesc')}
                className={`p-2 rounded-lg border transition-all ${sortBy === 'priceDesc' ? 'bg-[#1A1A40] text-[#CCFF00] border-[#1A1A40]' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                title="Mayor precio"
              >
                <i className="fa-solid fa-arrow-down-wide-short"></i>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => {
                const canAfford = userBalance >= product.price;
                const inCart = cart.find(item => item.id === product.id);
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] group"
                  >
                    {canAfford ? (
                      <div className="absolute top-4 left-4 bg-[#CCFF00] text-[#1A1A40] text-[9px] font-black px-3 py-1.5 rounded-full shadow-sm z-10 animate-pulse border border-[#1A1A40]/10">
                        ALCANZA 🐷
                      </div>
                    ) : (
                      <div className="absolute top-4 left-4 bg-slate-100 text-slate-400 text-[8px] font-bold px-2 py-0.5 rounded-full z-10 border border-slate-200">
                        FALTA POCO
                      </div>
                    )}

                    <div className="aspect-square bg-slate-50 rounded-[2rem] mb-5 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 grayscale-[0.1]">
                      {product.imageUrl}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-[#FF007F] bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-widest italic">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedMerchant(product.merchantName); }}
                        className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
                      >
                         <i className="fa-solid fa-shop text-[9px]"></i>
                         <p className="text-[10px] font-bold text-slate-500 truncate underline decoration-dotted">
                           {product.merchantName}
                         </p>
                      </button>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 flex flex-col gap-4">
                      <div className="flex items-baseline justify-between">
                         <span className="text-[10px] text-slate-400 font-bold uppercase">Precio</span>
                         <span className="text-xl font-black text-[#1A1A40]">
                           ${product.price.toLocaleString()}
                         </span>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product)}
                        className={`w-full py-4 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${
                          inCart 
                          ? 'bg-emerald-500 text-white shadow-lg' 
                          : 'bg-[#1A1A40] text-white shadow-xl shadow-blue-900/20 active:scale-95 hover:bg-slate-800'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <i className="fa-solid fa-check"></i>
                            AGREGADO ({inCart.quantity})
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-cart-plus"></i>
                            AGREGAR
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center space-y-8 bg-white rounded-[3rem] border border-dashed border-slate-200">
                 <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-6xl animate-bounce">
                   🐷
                 </div>
                 <div className="max-w-md mx-auto px-6 space-y-6">
                   <div className="space-y-2">
                     <p className="text-lg text-slate-800 font-black italic">"¡Oink! No encontré nada para '{searchQuery}'"</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pero tengo algunas ideas para ti:</p>
                   </div>
                   
                   {isSearchingAI ? (
                     <div className="flex flex-col items-center gap-3">
                       <div className="flex gap-2">
                         <div className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce delay-75"></div>
                         <div className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce delay-150"></div>
                         <div className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce delay-300"></div>
                       </div>
                       <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Piggy AI está pensando...</p>
                     </div>
                   ) : (
                     <div className="flex flex-wrap justify-center gap-3 animate-fadeIn">
                       {suggestions.length > 0 ? (
                         suggestions.map((suggestion, i) => (
                           <button 
                             key={i}
                             onClick={() => setSearchQuery(suggestion)}
                             className="px-5 py-2.5 bg-pink-50 text-[#FF007F] rounded-full text-[11px] font-black border border-pink-100 shadow-sm hover:bg-[#FF007F] hover:text-white transition-all"
                           >
                             {suggestion}
                           </button>
                         ))
                       ) : (
                         categories.filter(c => c !== 'Todas').map((cat, i) => (
                            <button 
                              key={i}
                              onClick={() => {setSelectedCategory(cat); setSearchQuery('');}}
                              className="px-5 py-2.5 bg-slate-50 text-[#1A1A40] rounded-full text-[11px] font-black border border-slate-100 shadow-sm hover:bg-[#1A1A40] hover:text-white transition-all"
                            >
                              {cat}
                            </button>
                         ))
                       )}
                     </div>
                   )}

                   <button 
                    onClick={() => {setSelectedCategory('Todas'); setSelectedMerchant('Todos'); setSearchQuery('');}}
                    className="text-[11px] font-black text-[#FF007F] mt-8 uppercase underline tracking-[0.25em] block mx-auto"
                   >
                     Explorar todo el Marketplace
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setShowCart(true)}
          className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-20 h-20 bg-[#FF007F] text-white rounded-full shadow-2xl flex items-center justify-center z-[60] animate-bounce active:scale-90 transition-transform group"
        >
          <div className="relative">
            <i className="fa-solid fa-shopping-basket text-3xl group-hover:scale-110 transition-transform"></i>
            <span className="absolute -top-4 -right-4 bg-[#CCFF00] text-[#1A1A40] text-[12px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#FF007F] shadow-lg">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {showCart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center animate-fadeIn" onClick={() => setShowCart(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp relative" onClick={e => e.stopPropagation()}>
            <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-[#1A1A40] italic uppercase tracking-tighter">Tu Canasta Piggy</h3>
              <button onClick={() => setShowCart(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm shrink-0">
                    {item.imageUrl}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-tight">por {item.merchantName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-inner">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-[#FF007F] hover:scale-125 transition-transform"><i className="fa-solid fa-minus"></i></button>
                        <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-[#FF007F] hover:scale-125 transition-transform"><i className="fa-solid fa-plus"></i></button>
                      </div>
                      <p className="text-lg font-black text-[#1A1A40]">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-rose-500 p-2 hover:scale-110 transition-transform"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              ))}
            </div>

            <div className="bg-[#1A1A40] text-white p-8 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF007F] rounded-full blur-[60px] opacity-20"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase tracking-widest">
                  <span>Saldo en Piggybanko</span>
                  <span>${userBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                  <span className="text-lg font-bold">Total a pagar</span>
                  <span className="text-3xl font-black text-[#CCFF00] italic">${cartTotal.toLocaleString()}</span>
                </div>
                
                {!canAffordCart && (
                  <div className="bg-rose-500/20 text-rose-200 p-4 rounded-2xl text-[10px] font-black text-center border border-rose-500/30 uppercase tracking-widest">
                    ⚠️ Te faltan ${(cartTotal - userBalance).toLocaleString()} para esta compra.
                  </div>
                )}

                <button 
                  disabled={!canAffordCart || cart.length === 0}
                  className={`w-full py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 transition-all border-b-8 ${
                    canAffordCart && cart.length > 0 
                    ? 'bg-[#FF007F] text-white border-pink-900 shadow-xl active:scale-95 hover:bg-pink-600' 
                    : 'bg-white/10 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <i className="fa-solid fa-check-double text-xl"></i>
                  <span className="text-xs uppercase tracking-[0.2em]">COMPRAR CON MI AHORRO</span>
                </button>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-8 font-black uppercase tracking-[0.3em] italic">
              El ahorro de hoy es el capricho de mañana.
            </p>
          </div>
        </div>
      )}
      
      <div className="text-center py-12">
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">
          Tus ahorros en Piggybanko valen más en comercios aliados.
        </p>
      </div>
    </div>
  );
};

export default MarketplaceView;
