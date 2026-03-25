
import React, { useState } from 'react';
import { Promotion } from '../types';

interface MerchantPromotionsProps {
  promotions: Promotion[];
  onAddPromotion: (promotion: Omit<Promotion, 'id' | 'merchantId' | 'merchantName'>) => void;
  onRemovePromotion: (id: string) => void;
}

const MerchantPromotions: React.FC<MerchantPromotionsProps> = ({ promotions, onAddPromotion, onRemovePromotion }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [piggyPrice, setPiggyPrice] = useState('');
  const [otherPrice, setOtherPrice] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [expiry, setExpiry] = useState('24h 00m');
  const [category, setCategory] = useState('Alimentos');
  const [emoji, setEmoji] = useState('🎁');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !piggyPrice || !otherPrice || !totalValue) return;

    onAddPromotion({
      title,
      description,
      piggyPrice: parseFloat(piggyPrice),
      otherPrice: parseFloat(otherPrice),
      totalValue: parseFloat(totalValue),
      imageUrl: emoji,
      expiryDate: expiry,
      category,
    });

    setTitle('');
    setDescription('');
    setPiggyPrice('');
    setOtherPrice('');
    setTotalValue('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      onRemovePromotion(id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-32 px-4 md:px-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mis Campañas ⚡️</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Impulsa tus ventas con pauta digital exclusiva</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-95 border-b-8 ${showForm ? 'bg-white text-slate-400 border-slate-200' : 'bg-[#1A1A40] text-[#CCFF00] border-black hover:bg-slate-800'}`}
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-bullhorn'} text-lg`}></i>
          {showForm ? 'CANCELAR CAMPAÑA' : 'CREAR NUEVA PAUTA'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-8 border-[#CCFF00] space-y-8 animate-slideUp max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-14 h-14 bg-[#CCFF00] rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-[#1A1A40]">⚡</div>
             <h3 className="text-2xl font-black text-[#1A1A40] italic uppercase tracking-tighter">NUEVA OFERTA FLASH</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">TÍTULO DE LA PAUTA</label>
              <input 
                type="text" 
                placeholder="Ej. Combo Super Ahorro de Fin de Semana" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-black focus:border-[#FF007F] outline-none transition-all" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">DESCRIPCIÓN DE LA OFERTA</label>
              <textarea 
                placeholder="¿Por qué deberían usar su ahorro aquí? Cuéntales el beneficio..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-medium focus:border-[#FF007F] outline-none transition-all h-28 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PAGA CON PIGGY ($)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#FF007F]">$</span>
                  <input 
                    type="number" 
                    value={piggyPrice}
                    onChange={(e) => setPiggyPrice(e.target.value)}
                    className="w-full p-5 pl-10 bg-pink-50 rounded-3xl border-2 border-pink-100 focus:border-[#FF007F] outline-none font-black text-[#FF007F] text-xl" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PAGA EN CAJA ($)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#1A1A40]">$</span>
                  <input 
                    type="number" 
                    value={otherPrice}
                    onChange={(e) => setOtherPrice(e.target.value)}
                    className="w-full p-5 pl-10 bg-slate-50 rounded-3xl border-2 border-slate-100 focus:border-[#1A1A40] outline-none font-black text-[#1A1A40] text-xl" 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A40] p-8 rounded-[2.5rem] border-b-8 border-[#CCFF00] shadow-2xl">
               <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 block">VALOR REAL DEL PRODUCTO</label>
               <div className="flex items-center gap-4">
                 <span className="text-3xl font-black text-[#CCFF00]">$</span>
                 <input 
                    type="number" 
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    className="w-full bg-transparent text-[#CCFF00] text-4xl font-black outline-none placeholder:text-white/10" 
                    placeholder="0.00"
                    required
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">DURACIÓN DE LA PAUTA</label>
                <select value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 outline-none font-black text-sm appearance-none">
                  <option>06h 00m</option>
                  <option>12h 00m</option>
                  <option>24h 00m</option>
                  <option>48h 00m</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ICONO / EMOJI</label>
                <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl text-center text-3xl border-2 border-slate-100 outline-none font-black" maxLength={2} />
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-[#FF007F] text-white rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest border-b-8 border-pink-900 hover:bg-pink-600">
              LANZAR PAUTA EN PIGGYBANKO 🚀
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-4">
           <i className="fa-solid fa-clock-rotate-left text-slate-300"></i>
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Historial de Campañas Activas</h3>
        </div>
        
        {promotions.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] border-4 border-dashed border-slate-100 text-center space-y-6">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <i className="fa-solid fa-bullhorn text-4xl text-slate-200"></i>
             </div>
             <div className="space-y-2">
               <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sin pautas activas</h4>
               <p className="text-sm text-slate-400 font-medium">Crea tu primera campaña para atraer a miles de ahorradores</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map(p => (
              <div key={p.id} className="group bg-white p-8 rounded-[3.5rem] shadow-xl border-2 border-slate-50 relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 bg-[#CCFF00] text-[#1A1A40] text-[10px] font-black rounded-bl-[2rem] shadow-md uppercase tracking-widest">ACTIVA</div>
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border-2 border-slate-100 shrink-0 group-hover:scale-110 transition-transform duration-500">
                    {p.imageUrl}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[#1A1A40] text-xl leading-tight uppercase italic tracking-tighter truncate">{p.title}</h4>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed">{p.description}</p>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="flex-1 text-center bg-pink-50 p-3 rounded-2xl border-2 border-pink-100">
                        <p className="text-[8px] font-black text-pink-400 uppercase tracking-widest mb-1">Piggy</p>
                        <p className="text-lg font-black text-[#FF007F] tracking-tighter">${p.piggyPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex-1 text-center bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Caja</p>
                        <p className="text-lg font-black text-[#1A1A40] tracking-tighter">${p.otherPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t-2 border-slate-50 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#FF007F]">
                        <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expira en {p.expiryDate}</span>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all shadow-sm"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                      <button className="px-6 py-3 bg-[#1A1A40] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
                        Métricas
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gamification for Merchant */}
      <div className="bg-[#CCFF00] p-10 rounded-[4rem] border-b-[12px] border-[#99CC00] flex flex-col sm:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
           <i className="fa-solid fa-trophy text-[10rem] text-[#1A1A40]"></i>
         </div>
         <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl border-4 border-[#1A1A40] shrink-0 z-10">🏆</div>
         <div className="z-10 text-center sm:text-left">
            <h4 className="font-black text-[#1A1A40] text-2xl leading-tight uppercase italic tracking-tighter mb-2">PROGRAMA DE SOCIOS ÉLITE</h4>
            <p className="text-sm text-[#1A1A40] font-bold opacity-70 leading-relaxed max-w-xl">Llega a 10 pautas este mes y obtén <span className="underline decoration-2">0% de comisión</span> por 1 semana completa. ¡Impulsa tu negocio hoy!</p>
         </div>
      </div>

      <div className="text-center pt-12">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic">Piggybanko Ads • Potenciando el comercio local</p>
      </div>
    </div>
  );
};

export default MerchantPromotions;
