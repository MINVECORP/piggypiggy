
import React, { useState, useEffect } from 'react';
import { UserAccount, Transaction } from '../types';
import Mascot from './Mascot';
import { getFinancialMotivation } from '../services/geminiService';
import { openWompiCheckout, generateReference } from '../services/wompiService';
import { PiggyRepository } from '../repositories/piggyRepository';

interface UserViewProps {
  user: UserAccount;
  onGoHome: () => void;
  onTopUp: (amount: number, txResult: any) => void | Promise<void>;
}

type OnboardingStep = 'WELCOME' | 'EXPLAIN' | 'GOAL_SETTING';

const UserView: React.FC<UserViewProps> = ({ user, onGoHome, onTopUp }) => {
  const [motivation, setMotivation] = useState("Cargando motivación...");
  const [activeTab, setActiveTab] = useState<'ALL' | 'PURCHASES'>('ALL');
  // FIX: Initialize with empty array because PiggyRepository.getTransactions() returns a Promise
  const [history, setHistory] = useState<Transaction[]>([]);
  
  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(!user.goalName || user.goalName === 'Tenis Nike Air');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('WELCOME');
  const [tempGoal, setTempGoal] = useState({ name: user.goalName, target: user.goalTarget });

  // Top Up State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchMotivation() {
      if (!showOnboarding) {
        const msg = await getFinancialMotivation(user.balance, user.goalName, user.goalTarget);
        setMotivation(msg);
      }
    }
    // FIX: Properly await the async getTransactions call inside the effect
    async function fetchHistory() {
      const txs = await PiggyRepository.getTransactions();
      setHistory(txs);
    }
    fetchMotivation();
    fetchHistory();
  }, [user.balance, user.goalName, user.goalTarget, showOnboarding]);

  const progress = (user.balance / user.goalTarget) * 100;

  const handleFinishOnboarding = () => {
    const updatedUser = { ...user, goalName: tempGoal.name, goalTarget: tempGoal.target };
    PiggyRepository.updateUser(updatedUser);
    setShowOnboarding(false);
  };

  const handleStartWompi = () => {
    if (topUpAmount <= 0) return;
    
    setIsProcessing(true);
    openWompiCheckout({
      amount: topUpAmount,
      email: `${user.phone}@piggybanko.com`,
      reference: generateReference('TOP'),
      onSuccess: async (tx) => {
        // FIX: Ensure top-up process completes and then refresh transaction history correctly
        await onTopUp(topUpAmount, tx);
        setIsTopUpOpen(false);
        setTopUpAmount(0);
        setIsProcessing(false);
        const txs = await PiggyRepository.getTransactions();
        setHistory(txs);
      },
      onClose: () => setIsProcessing(false)
    });
  };

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center p-8 animate-fadeIn text-center space-y-8">
        <div className="text-8xl animate-bounce">🎯</div>
        <h2 className="text-3xl font-black text-[#1A1A40] italic uppercase tracking-tighter">¿Cuál es tu meta?</h2>
        <div className="w-full space-y-4">
           <input 
            type="text" 
            placeholder="Ej. Viaje a la playa" 
            value={tempGoal.name}
            onChange={(e) => setTempGoal({...tempGoal, name: e.target.value})}
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#FF007F] font-bold"
           />
           <input 
            type="number" 
            placeholder="¿Cuánto necesitas? ($)" 
            value={tempGoal.target || ''}
            onChange={(e) => setTempGoal({...tempGoal, target: parseInt(e.target.value) || 0})}
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#FF007F] font-bold"
           />
        </div>
        <button 
          onClick={handleFinishOnboarding}
          className="w-full py-5 bg-[#1A1A40] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
        >
          ¡VAMOS POR ELLO! 🐷
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-32 animate-fadeIn">
      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 bg-[#1A1A40]/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 space-y-8 animate-slideUp shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-[#1A1A40] italic uppercase tracking-tighter">Recargar</h3>
              <button onClick={() => setIsTopUpOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full text-slate-400">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[10000, 20000, 50000].map(amt => (
                  <button key={amt} onClick={() => setTopUpAmount(amt)} className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all ${topUpAmount === amt ? 'bg-[#FF007F] border-[#FF007F] text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-[#1A1A40]'}`}>
                    ${amt / 1000}k
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex items-center gap-4">
                <span className="text-2xl font-black text-slate-300">$</span>
                <input type="number" value={topUpAmount || ''} onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)} className="bg-transparent w-full text-3xl font-black text-[#1A1A40] outline-none" placeholder="Monto" />
              </div>
            </div>

            <button onClick={handleStartWompi} disabled={topUpAmount <= 0 || isProcessing} className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all border-b-8 ${topUpAmount > 0 && !isProcessing ? 'bg-[#1A1A40] text-white border-black shadow-xl' : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'}`}>
              {isProcessing ? 'PROCESANDO...' : 'RECARGAR CON WOMPI ⚡'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Balance and Mascot */}
        <div className="lg:col-span-5 space-y-8">
          {/* Balance Card */}
          <div className="bg-[#1A1A40] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10 group">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FF007F] rounded-full blur-[90px] opacity-30"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Disponible</p>
              <h2 className="text-5xl font-black italic">${user.balance.toLocaleString()}</h2>
              <div className="flex gap-4 pt-6 border-t border-white/10 mt-6">
                <div className="flex-1"><p className="text-[8px] font-bold text-white/40 uppercase">Rendimientos</p><p className="text-lg font-black text-[#FF007F]">+${user.lastYield}</p></div>
                <div className="flex-1 border-l border-white/10 pl-4"><p className="text-[8px] font-bold text-white/40 uppercase">XP</p><p className="text-lg font-black text-pink-400">{user.xp} pts</p></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <Mascot level={user.level} isHappy={true} />
          </div>

          {/* Motivation Bubble */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex gap-4 items-center">
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF007F] text-xl shadow-inner shrink-0"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
            <p className="text-xs text-slate-600 font-bold italic leading-relaxed">"{motivation}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col gap-3 p-6 bg-[#FF007F] text-white rounded-[2.5rem] font-black shadow-xl active:scale-95 transition-all border-b-8 border-pink-900">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-qrcode"></i></div>
              <span className="text-xs uppercase tracking-tight">Escanear</span>
            </button>
            <button onClick={() => setIsTopUpOpen(true)} className="flex flex-col gap-3 p-6 bg-white text-[#1A1A40] border border-slate-100 rounded-[2.5rem] font-black shadow-sm active:scale-95 transition-all group hover:border-[#FF007F]">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl group-hover:bg-pink-50 group-hover:text-[#FF007F]"><i className="fa-solid fa-plus"></i></div>
              <span className="text-xs uppercase tracking-tight">Recargar</span>
            </button>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-[#1A1A40] text-2xl tracking-tighter uppercase italic">Movimientos</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('ALL')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${activeTab === 'ALL' ? 'bg-[#1A1A40] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>TODOS</button>
              <button onClick={() => setActiveTab('PURCHASES')} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${activeTab === 'PURCHASES' ? 'bg-[#1A1A40] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>COMPRAS</button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
            {history.length > 0 ? history.map(tx => (
              <div key={tx.id} className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                    {tx.amount > 0 ? <i className="fa-solid fa-piggy-bank text-emerald-500"></i> : <i className="fa-solid fa-bag-shopping text-[#FF007F]"></i>}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1A1A40]">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{tx.timestamp.split('T')[0]}</p>
                  </div>
                </div>
                <p className={`font-black text-lg ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                </p>
              </div>
            )) : (
              <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 py-16 text-center">
                <p className="text-slate-300 text-xs font-bold italic uppercase">Aún no hay movimientos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
