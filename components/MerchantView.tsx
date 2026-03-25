
import React, { useState, useEffect } from 'react';
import { MerchantAccount, Product } from '../types';
import { getMerchantInsight } from '../services/geminiService';
import { openWompiCheckout, generateReference } from '../services/wompiService';
import CashierView from './CashierView';

interface MerchantViewProps {
  merchant: MerchantAccount;
  allMerchants?: MerchantAccount[];
  products?: Product[];
  onGoHome: () => void;
  onMerchantPayUser: (phone: string, amount: number) => boolean;
  onSettlement: (amount: number, txResult: any) => void;
  onB2BTransfer?: (targetId: string, amount: number, txResult: any) => void;
}

const MerchantView: React.FC<MerchantViewProps> = ({ 
  merchant, 
  allMerchants = [], 
  onGoHome, 
  onSettlement,
  onB2BTransfer 
}) => {
  const [insight, setInsight] = useState("Analizando tu crecimiento...");
  const [isCashierMode, setIsCashierMode] = useState(false);
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [b2bAmount, setB2BAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchInsight() {
      const msg = await getMerchantInsight(merchant.earnings, merchant.cashCollected);
      setInsight(msg);
    }
    fetchInsight();
  }, [merchant.earnings, merchant.cashCollected]);

  const grossDigitalSales = merchant.piggyPayments;
  const netDigitalSales = grossDigitalSales * 0.965;
  const netCashToPiggy = merchant.cashCollected * 0.99;
  const finalBalance = netCashToPiggy - netDigitalSales;
  const merchantOwesPiggy = finalBalance > 0;

  const handleSettlement = () => {
    if (!merchantOwesPiggy) return;
    setIsProcessing(true);
    openWompiCheckout({
      amount: Math.round(finalBalance),
      email: `${merchant.id}@negocio.com`,
      reference: generateReference('STL'),
      onSuccess: (tx) => onSettlement(Math.round(finalBalance), tx),
      onClose: () => setIsProcessing(false)
    });
  };

  const handleB2BPayment = () => {
    if (!selectedTarget || b2bAmount <= 0) return;
    setIsProcessing(true);
    openWompiCheckout({
      amount: b2bAmount,
      email: `${merchant.id}@provider.com`,
      reference: generateReference('B2B'),
      onSuccess: (tx) => {
        if (onB2BTransfer) onB2BTransfer(selectedTarget, b2bAmount, tx);
        setIsB2BModalOpen(false);
        setB2BAmount(0);
        setSelectedTarget('');
      },
      onClose: () => setIsProcessing(false)
    });
  };

  if (isCashierMode) {
    return (
      <div className="animate-fadeIn">
        <button onClick={() => setIsCashierMode(false)} className="absolute top-8 right-8 z-[110] bg-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border border-slate-100 hover:text-rose-500"><i className="fa-solid fa-xmark"></i></button>
        <CashierView merchantName={merchant.name} onProcessTransaction={() => true} mockUserBalance={0} onGoHome={() => setIsCashierMode(false)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-32 px-4 md:px-8 animate-fadeIn relative">
      {/* B2B Modal */}
      {isB2BModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A40]/90 backdrop-blur-lg z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 space-y-8 animate-slideUp shadow-2xl border-8 border-white">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-[#1A1A40] italic uppercase tracking-tighter">Pago B2B 🏦</h3>
              <button onClick={() => setIsB2BModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <i className="fa-solid fa-circle-xmark text-3xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SELECCIONA ALIADO</label>
              <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-black outline-none focus:border-[#FF007F] transition-all">
                <option value="">Selecciona un aliado</option>
                {allMerchants.filter(m => m.id !== merchant.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">MONTO A PAGAR</label>
              <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 flex items-center gap-6 shadow-inner">
                <span className="text-4xl font-black text-[#FF007F]">$</span>
                <input type="number" value={b2bAmount || ''} onChange={(e) => setB2BAmount(parseInt(e.target.value) || 0)} className="bg-transparent w-full text-5xl font-black text-[#1A1A40] outline-none placeholder:text-slate-200" placeholder="0" />
              </div>
            </div>

            <button 
              onClick={handleB2BPayment} 
              disabled={!selectedTarget || b2bAmount <= 0 || isProcessing} 
              className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all border-b-8 shadow-2xl active:scale-95 ${selectedTarget && b2bAmount > 0 && !isProcessing ? 'bg-[#1A1A40] text-white border-black hover:bg-slate-800' : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'}`}
            >
              {isProcessing ? 'PROCESANDO...' : 'PAGAR CON WOMPI 🏦'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Panel Aliado 🚀</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestiona tu negocio y recaudo en tiempo real</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border-2 border-slate-50">
          <div className="w-12 h-12 bg-[#CCFF00] rounded-2xl flex items-center justify-center text-[#1A1A40] text-xl shadow-lg border-2 border-[#1A1A40]">
            <i className="fa-solid fa-store"></i>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NEGOCIO</p>
            <p className="text-sm font-black text-[#1A1A40] uppercase italic">{merchant.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Actions & Insights */}
        <div className="lg:col-span-7 space-y-8">
          {/* Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button onClick={() => setIsCashierMode(true)} className="group p-8 bg-[#FF007F] text-white rounded-[3.5rem] font-black shadow-2xl flex flex-col gap-6 border-b-8 border-pink-900 active:scale-95 transition-all hover:bg-pink-600">
              <div className="w-16 h-16 bg-[#1A1A40] rounded-[2rem] flex items-center justify-center text-2xl shadow-xl group-hover:rotate-12 transition-transform"><i className="fa-solid fa-cash-register"></i></div>
              <div className="text-left">
                <span className="text-xs uppercase block tracking-[0.2em] mb-1 opacity-80">Terminal de Venta</span>
                <span className="text-2xl font-black uppercase italic tracking-tighter">TPV Piggy</span>
              </div>
            </button>
            <button onClick={() => setIsB2BModalOpen(true)} className="group p-8 bg-white text-[#1A1A40] rounded-[3.5rem] font-black shadow-2xl flex flex-col gap-6 border-2 border-slate-50 border-b-8 border-slate-200 active:scale-95 transition-all hover:border-[#CCFF00]">
              <div className="w-16 h-16 bg-[#CCFF00] rounded-[2rem] flex items-center justify-center text-2xl shadow-xl border-2 border-[#1A1A40] group-hover:-rotate-12 transition-transform"><i className="fa-solid fa-building-columns"></i></div>
              <div className="text-left">
                <span className="text-xs uppercase block tracking-[0.2em] mb-1 text-slate-400">Pagos a Proveedores</span>
                <span className="text-2xl font-black uppercase italic tracking-tighter">B2B Directo</span>
              </div>
            </button>
          </div>

          {/* AI Insights Card */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fa-solid fa-wand-magic-sparkles text-[10rem]"></i>
            </div>
            <div className="relative z-10 flex items-start gap-8">
              <div className="w-20 h-20 rounded-3xl bg-[#1A1A40] flex items-center justify-center text-white shrink-0 shadow-2xl border-4 border-[#FF007F] animate-pulse">
                <i className="fa-solid fa-brain text-3xl text-[#FF007F]"></i>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#FF007F] uppercase tracking-[0.3em]">Piggy Insight AI</p>
                <p className="text-xl md:text-2xl text-[#1A1A40] leading-tight font-black italic">"{insight}"</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">CRECIMIENTO</span>
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">RECAUDO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settlement & Stats */}
        <div className="lg:col-span-5 space-y-8">
          {/* Settlement Card */}
          <div className="bg-[#1A1A40] rounded-[4rem] p-10 shadow-2xl relative overflow-hidden border-8 border-white group">
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fa-solid fa-piggy-bank text-[15rem] text-white"></i>
            </div>
            <div className="relative z-10 space-y-10">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Balance de Recaudo</p>
                <h4 className={`text-6xl font-black italic tracking-tighter ${merchantOwesPiggy ? 'text-[#FF007F]' : 'text-[#CCFF00]'}`}>
                  ${Math.abs(finalBalance).toLocaleString()}
                </h4>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${merchantOwesPiggy ? 'bg-[#FF007F] animate-ping' : 'bg-[#CCFF00]'}`}></div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                    {merchantOwesPiggy ? 'Debes transferir a Piggybanko' : 'Saldo a tu favor'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleSettlement} 
                  disabled={!merchantOwesPiggy || isProcessing} 
                  className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-b-8 ${merchantOwesPiggy && !isProcessing ? 'bg-[#FF007F] text-white border-pink-900 hover:bg-pink-600' : 'bg-white/10 text-white/20 cursor-not-allowed border-white/5'}`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-3">
                      <i className="fa-solid fa-spinner fa-spin"></i> PROCESANDO...
                    </span>
                  ) : 'LIQUIDAR CAJA AHORA 💸'}
                </button>
                <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-widest">Liquidación instantánea vía Wompi</p>
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">VENTAS DIGITALES</p>
              <p className="text-xl font-black text-[#1A1A40]">${merchant.piggyPayments.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">EFECTIVO RECAUDADO</p>
              <p className="text-xl font-black text-[#1A1A40]">${merchant.cashCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-12">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic">Piggybanko Business • Impulsando el comercio local</p>
      </div>
    </div>
  );
};

export default MerchantView;
