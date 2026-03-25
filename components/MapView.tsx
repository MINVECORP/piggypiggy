
import React, { useState, useEffect } from 'react';
import { MerchantAccount } from '../types';
import { searchPlacesOnMap } from '../services/geminiService';

interface MapViewProps {
  merchants: MerchantAccount[];
  userBalance: number;
  onViewStore: (merchantName: string) => void;
}

interface MapResult {
  name: string;
  address: string;
  uri: string;
  lat?: number;
  lng?: number;
  type?: string;
}

const MapView: React.FC<MapViewProps> = ({ merchants, userBalance, onViewStore }) => {
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MapResult[]>([]);
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocalización desactivada por el usuario.");
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchPlacesOnMap(searchQuery, userPos?.lat, userPos?.lng);
    setSearchResults(results);
    setIsSearching(false);
    if (results.length > 0) setSelectedMerchant(results[0]);
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'SUPERMARKET': return 'fa-cart-shopping';
      case 'BAKERY': return 'fa-bread-slice';
      case 'TECH': return 'fa-laptop';
      case 'RESTAURANT': return 'fa-utensils';
      default: return 'fa-store';
    }
  };

  const handleGetDirections = () => {
    if (!selectedMerchant) return;
    
    setIsNavigating(true);
    
    // Prioridad 1: URI directa de Google Maps (si viene de Gemini)
    if (selectedMerchant.uri) {
      window.open(selectedMerchant.uri, '_blank');
      setTimeout(() => setIsNavigating(false), 1000);
      return;
    }

    // Prioridad 2: Construir URL con coordenadas o dirección
    const destination = selectedMerchant.lat && selectedMerchant.lng 
      ? `${selectedMerchant.lat},${selectedMerchant.lng}` 
      : encodeURIComponent(selectedMerchant.address || selectedMerchant.name);
    
    const origin = userPos ? `${userPos.lat},${userPos.lng}` : '';
    
    // Detectar si es iOS para Apple Maps o usar Google Maps por defecto
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    let url = '';
    
    if (isIOS) {
      url = `maps://maps.apple.com/?daddr=${destination}${origin ? `&saddr=${origin}` : ''}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin ? `&origin=${origin}` : ''}&travelmode=walking`;
    }

    window.open(url, '_blank');
    setTimeout(() => setIsNavigating(false), 1000);
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col animate-fadeIn relative overflow-hidden">
      {/* Search Bar Header */}
      <div className="z-50 space-y-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Puntos Piggy 📍</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Encuentra tu ahorro a la vuelta de la esquina</p>
        </div>
        <form onSubmit={handleSearch} className="relative group max-w-2xl">
          <input 
            type="text" 
            placeholder="Busca panaderías, tiendas o barrios..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-xl border-2 border-slate-100 text-sm focus:border-[#FF007F] outline-none transition-all placeholder:text-slate-300 font-bold"
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF007F]">
            {isSearching ? <i className="fa-solid fa-spinner fa-spin text-lg"></i> : <i className="fa-solid fa-magnifying-glass text-lg"></i>}
          </button>
        </form>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-slate-900 rounded-[3rem] relative overflow-hidden shadow-2xl border-8 border-white mb-6 group/map">
        {/* Radar Scanner Animation */}
        {isSearching && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="w-[600px] h-[600px] bg-[#CCFF00]/10 rounded-full border border-[#CCFF00]/20 animate-ping"></div>
          </div>
        )}

        {/* Abstract Map Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* User Location Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg z-20 relative"></div>
            <div className="absolute inset-0 w-20 h-20 bg-blue-400 rounded-full -left-6 -top-6 animate-ping opacity-20"></div>
          </div>
          <div className="mt-3 bg-[#1A1A40] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl border border-white/10">MI UBICACIÓN</div>
        </div>

        {/* Dynamic Result Pins */}
        {searchResults.map((result, idx) => {
          const positions = [
            { t: '20%', l: '35%' }, { t: '40%', l: '75%' }, { t: '70%', l: '20%' }, { t: '80%', l: '65%' }, { t: '15%', l: '85%' },
            { t: '25%', l: '15%' }, { t: '55%', l: '45%' }, { t: '85%', l: '35%' }
          ];
          const pos = positions[idx % positions.length];
          const isActive = selectedMerchant?.name === result.name;

          return (
            <button
              key={idx}
              onClick={() => setSelectedMerchant(result)}
              className="absolute z-20 transform transition-all duration-500 hover:scale-125"
              style={{ top: pos.t, left: pos.l }}
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white transition-all ${isActive ? 'bg-[#FF007F] scale-110 rotate-12' : 'bg-[#CCFF00] text-[#1A1A40]'}`}>
                  <i className={`fa-solid ${isActive ? 'fa-store text-xl' : 'fa-location-dot text-lg'}`}></i>
                </div>
              </div>
            </button>
          );
        })}

        {/* Default Merchant Pins (if no search) */}
        {searchResults.length === 0 && merchants.map((m, idx) => {
          const positions = [
            { t: '30%', l: '20%' }, { t: '60%', l: '80%' }, { t: '15%', l: '50%' }, { t: '75%', l: '40%' }, { t: '20%', l: '70%' }
          ];
          const pos = positions[idx % positions.length];
          const isActive = selectedMerchant?.id === m.id;

          return (
            <button
              key={m.id}
              onClick={() => setSelectedMerchant(m)}
              className="absolute z-10 transform transition-all duration-500"
              style={{ top: pos.t, left: pos.l }}
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl border-2 border-white transition-all ${isActive ? 'bg-[#FF007F] scale-125 rotate-12' : 'bg-[#1A1A40]'}`}>
                  <i className={`fa-solid ${getIcon(m.type)} text-xs`}></i>
                </div>
              </div>
            </button>
          );
        })}

        {/* Selected Result Overlay Card */}
        {selectedMerchant && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white rounded-[3rem] p-8 shadow-2xl animate-slideUp z-40 border border-slate-100">
            <button 
              onClick={() => setSelectedMerchant(null)}
              className="absolute top-6 right-8 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <i className="fa-solid fa-circle-xmark text-2xl"></i>
            </button>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-[#FF007F] text-3xl shadow-inner border border-slate-100 shrink-0">
                <i className={`fa-solid ${getIcon(selectedMerchant.type)}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   <h4 className="font-black text-[#1A1A40] text-xl leading-tight truncate">{selectedMerchant.name}</h4>
                   <span className="bg-[#CCFF00] text-[#1A1A40] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0">ALIADO</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <i className="fa-solid fa-location-dot text-xs"></i>
                  <p className="text-[11px] font-bold uppercase tracking-tight truncate">{selectedMerchant.address || 'Ubicación aliada'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button 
                onClick={handleGetDirections}
                disabled={isNavigating}
                className="py-4 bg-[#1A1A40] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-slate-800"
              >
                {isNavigating ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-diamond-turn-right text-[#CCFF00] text-lg"></i>
                )}
                <span className="uppercase tracking-widest">{isNavigating ? 'ABRIENDO...' : 'CÓMO LLEGAR'}</span>
              </button>
              <button 
                onClick={() => onViewStore(selectedMerchant.name)}
                className="py-4 bg-[#FF007F] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-pink-600"
              >
                <i className="fa-solid fa-store text-lg"></i>
                <span className="uppercase tracking-widest">VER TIENDA</span>
              </button>
            </div>
          </div>
        )}

        {/* Map Context Controls */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
           <button 
            onClick={() => {if ("geolocation" in navigator) navigator.geolocation.getCurrentPosition(p => setUserPos({lat: p.coords.latitude, lng: p.coords.longitude}))}}
            className="w-14 h-14 bg-[#CCFF00] rounded-2xl shadow-2xl flex items-center justify-center text-[#1A1A40] active:scale-90 transition-transform border-4 border-white hover:bg-white"
           >
             <i className="fa-solid fa-crosshairs text-xl"></i>
           </button>
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic">Piggybanko • Tu ahorro siempre cerca</p>
      </div>
    </div>
  );
};

export default MapView;
