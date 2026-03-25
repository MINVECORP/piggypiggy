
import React, { useState } from 'react';
import { Promotion } from '../types';

interface PromotionsViewProps {
  promotions: Promotion[];
  userBalance: number;
}

const PromotionsView: React.FC<PromotionsViewProps> = ({ promotions, userBalance }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPromo = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const prevPromo = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-32 px-4 md:px-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">SÚPER PROMOS ⚡</h2>
          <p className="text-sm text-slate-500 font-medium">Desliza para descubrir ofertas flash exclusivas.</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={prevPromo}
            className="w-12 h-12 bg-white rounded-2xl shadow-xl border-2 border-slate-100 flex items-center justify-center text-[#1A1A40] active:scale-90 hover:border-[#CCFF00] transition-all"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            onClick={nextPromo}
            className="w-12 h-12 bg-white rounded-2xl shadow-xl border-2 border-slate-100 flex items-center justify-center text-[#1A1A40] active:scale-90 hover:border-[#CCFF00] transition-all"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        <div className="overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white bg-white">
          <div 
            className="flex transition-transform duration-700 ease-out" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {promotions.map((promo) => {
              const canAffordPiggyPart = userBalance >= promo.piggyPrice;
              const discountPercent = Math.round((1 - (promo.piggyPrice + promo.otherPrice) / promo.totalValue) * 100);

              return (
                <div key={promo.id} className="min-w-full flex flex-col md:flex-row relative">
                  {/* Promo Image & Badge */}
                  <div className="relative h-64 md:h-auto md:w-1/2 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black to-transparent z-10"></div>
                    <span className="text-9xl transform group-hover:scale-110 transition-transform duration-700 z-0 select-none">
                      {promo.imageUrl}
                    </span>
                    
                    <div className="absolute top-8 right-8 bg-[#CCFF00] text-[#1A1A40] px-6 py-3 rounded-full text-sm font-black z-20 shadow-2xl animate-pulse">
                      -{discountPercent}% OFF
                    </div>

                    <div className="absolute bottom-8 left-8 z-20">
                      <span className="bg-[#FF007F] text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl">
                        EXCLUSIVO PIGGYBANKO
                      </span>
                    </div>
                  </div>

                  {/* Promo Content */}
                  <div className="p-8 md:p-12 flex-1 flex flex-col justify-center space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#10b981] flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <i className="fa-solid fa-store"></i> {promo.merchantName}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-[#1A1A40] leading-tight tracking-tighter uppercase italic">{promo.title}</h3>
                      <p className="text-base text-slate-500 mt-4 font-medium leading-relaxed">{promo.description}</p>
                    </div>

                    {/* Hybrid Price Breakdown */}
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-slate-100 flex items-center justify-between shadow-inner">
                      <div className="text-center flex-1 border-r-2 border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagas con Piggy</p>
                        <p className={`text-3xl font-black ${canAffordPiggyPart ? 'text-[#FF007F]' : 'text-slate-300'}`}>
                          ${promo.piggyPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="px-6 text-slate-300 font-black text-2xl">+</div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagas en Caja</p>
                        <p className="text-3xl font-black text-[#1A1A40]">
                          ${promo.otherPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
                       <span className="uppercase tracking-widest">Valor Real: <span className="line-through decoration-[#FF007F] decoration-4 ml-2">${promo.totalValue.toLocaleString()}</span></span>
                       <div className="flex items-center gap-2">
                          <i className="fa-solid fa-clock-rotate-left text-[#FF007F]"></i>
                          <span className="uppercase tracking-widest">Vence: {promo.expiryDate}</span>
                       </div>
                    </div>

                    {/* Drive-to-Store Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button 
                        disabled={!canAffordPiggyPart}
                        className={`py-5 rounded-3xl font-black text-xs shadow-2xl transition-all active:scale-95 uppercase tracking-widest ${
                          canAffordPiggyPart 
                          ? 'bg-[#1A1A40] text-white hover:bg-slate-800' 
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200'
                        }`}
                      >
                        RESERVAR CON PIGGY
                      </button>
                      <button className="py-5 rounded-3xl bg-white border-4 border-[#1A1A40] text-[#1A1A40] font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest">
                        <i className="fa-solid fa-location-dot text-lg"></i>
                        CÓMO LLEGAR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="flex md:hidden justify-center gap-4 mt-8">
          <button 
            onClick={prevPromo}
            className="w-14 h-14 bg-white rounded-2xl shadow-xl border-2 border-slate-100 flex items-center justify-center text-[#1A1A40] active:scale-90"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            onClick={nextPromo}
            className="w-14 h-14 bg-white rounded-2xl shadow-xl border-2 border-slate-100 flex items-center justify-center text-[#1A1A40] active:scale-90"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Indicators (Dots) */}
        <div className="flex justify-center gap-3 mt-10">
          {promotions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 rounded-full transition-all duration-500 ${
                currentIndex === idx ? 'w-12 bg-[#FF007F]' : 'w-3 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Gamified Referral Banner */}
      <div className="bg-gradient-to-br from-[#1A1A40] to-[#2D2D70] p-10 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden mt-12 border-8 border-white">
         <div className="absolute top-0 right-0 p-8 opacity-10">
           <i className="fa-solid fa-gift text-[15rem]"></i>
         </div>
         <div className="relative z-10 space-y-6 max-w-2xl">
           <div className="inline-block bg-[#CCFF00] text-[#1A1A40] px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
             NUEVO RETO 🏆
           </div>
           <h4 className="font-black text-4xl md:text-5xl leading-tight italic uppercase tracking-tighter">¡Invita y Gana!</h4>
           <p className="text-lg md:text-xl font-medium text-slate-300 leading-relaxed">Si un amigo ahorra su primer cambio, ¡tu Piggy recibe <span className="text-[#CCFF00] font-black">$2.000 gratis!</span></p>
           <button className="flex items-center justify-center gap-4 bg-[#FF007F] text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all w-full sm:w-auto hover:bg-pink-600">
             <i className="fa-solid fa-share-nodes text-xl"></i>
             COMPARTIR MI CÓDIGO
           </button>
         </div>
      </div>

      <div className="text-center pb-12">
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic">Piggybanko • Alianzas que suman</p>
      </div>
    </div>
  );
};

export default PromotionsView;
