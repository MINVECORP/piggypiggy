
import React, { useState, useEffect } from 'react';

interface CashierViewProps {
  merchantName: string;
  onProcessTransaction: (phone: string, amount: number, type: 'SAVING' | 'PAYMENT') => boolean;
  mockUserBalance: number;
  onGoHome: () => void;
}

type Step = 'TYPE' | 'PHONE' | 'VERIFYING' | 'USER_INFO' | 'OTP' | 'AMOUNT' | 'SUCCESS';

const MOCK_EXISTING_USERS = ['3001234567', '3009876543', '3105556677'];

const CashierView: React.FC<CashierViewProps> = ({ merchantName, onProcessTransaction, mockUserBalance, onGoHome }) => {
  const [step, setStep] = useState<Step>('TYPE');
  const [txType, setTxType] = useState<'SAVING' | 'PAYMENT'>('SAVING');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const onboardingData = [
    {
      title: "Terminal Operativa",
      desc: "Bienvenido a tu estación de trabajo. Aquí facilitarás el ahorro de cientos de clientes.",
      icon: "⚡",
      color: "#FF007F"
    },
    {
      title: "Cargar Vueltas",
      desc: "Cuando un cliente paga en efectivo, ofrécele redondear sus vueltas directamente a su Piggy digital.",
      icon: "🐷",
      color: "#FF007F"
    },
    {
      title: "Cobro Digital",
      desc: "También puedes procesar pagos usando el saldo que los clientes ya tienen ahorrado en su cuenta.",
      icon: "💳",
      color: "#1A1A40"
    }
  ];

  const handleKeypad = (val: string) => {
    setError(null);
    if (step === 'PHONE' && phone.length < 10) setPhone(prev => prev + val);
    if (step === 'OTP' && otp.length < 4) setOtp(prev => prev + val);
    if (step === 'AMOUNT') {
      if (amount === '0') setAmount(val);
      else setAmount(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    if (step === 'PHONE') setPhone(prev => prev.slice(0, -1));
    if (step === 'OTP') setOtp(prev => prev.slice(0, -1));
    if (step === 'AMOUNT') setAmount(prev => prev.slice(0, -1));
  };

  const verifyUser = () => {
    setStep('VERIFYING');
    setTimeout(() => {
      const exists = MOCK_EXISTING_USERS.includes(phone);
      setIsExistingUser(exists);
      setStep('USER_INFO');
    }, 1200);
  };

  const nextStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (step === 'PHONE') { 
        verifyUser();
      } 
      else if (step === 'USER_INFO') {
        if (txType === 'PAYMENT' && !isExistingUser) {
          setError("No se puede cobrar a un usuario sin cuenta.");
          return;
        }
        setStep('OTP');
      }
      else if (step === 'OTP') { 
        setStep('AMOUNT'); 
      } 
      else if (step === 'AMOUNT') {
        const numericAmount = parseInt(amount);
        if (txType === 'PAYMENT' && isExistingUser && mockUserBalance < numericAmount) {
          setError(`Saldo insuficiente. El cliente solo tiene $${mockUserBalance.toLocaleString()}`);
          return;
        }
        const success = onProcessTransaction(phone, numericAmount, txType);
        if (success) { setStep('SUCCESS'); } 
        else { setError('Error procesando la transacción.'); }
      }
    }, 100);
  };

  const reset = () => {
    setStep('TYPE'); setPhone(''); setOtp(''); setAmount(''); setIsExistingUser(false); setError(null);
  };

  const themeColor = '#FF007F'; 
  const themeText = '#FFFFFF';

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 animate-fadeIn">
        <div className="w-full max-w-sm space-y-12 text-center">
          <div className="text-9xl mb-4 animate-pulse drop-shadow-2xl">{onboardingData[onboardingStep].icon}</div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-[#1A1A40] italic uppercase tracking-tighter leading-tight">
              {onboardingData[onboardingStep].title}
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">OPERADOR POS</p>
            <p className="text-slate-500 font-medium leading-relaxed px-4">
              {onboardingData[onboardingStep].desc}
            </p>
          </div>
          
          <div className="flex justify-center gap-2">
            {onboardingData.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${onboardingStep === i ? 'w-12 bg-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.3)]' : 'w-2 bg-slate-100'}`}></div>
            ))}
          </div>

          <button 
            onClick={() => onboardingStep < 2 ? setOnboardingStep(onboardingStep + 1) : setShowOnboarding(false)}
            className="w-full py-6 bg-[#1A1A40] text-white rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all border-b-8 border-black uppercase tracking-[0.2em] text-xs"
          >
            {onboardingStep === 2 ? 'INICIAR TERMINAL' : 'CONTINUAR'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[85vh] flex flex-col md:flex-row gap-8 animate-fadeIn pb-32 px-4 md:px-8">
      {/* Terminal Container */}
      <div className="flex-1 max-w-md mx-auto w-full bg-white flex flex-col border border-slate-100 rounded-[4rem] shadow-2xl relative overflow-hidden h-fit md:sticky md:top-8">
        <div className="p-10 bg-[#1A1A40] text-white flex justify-between items-center rounded-b-[5rem] shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Terminal Activa</p>
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{merchantName}</h2>
          </div>
          <div className="flex gap-4">
            <button onClick={onGoHome} className="w-14 h-14 bg-white/10 hover:bg-[#FF007F] hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all border border-white/10 shadow-inner group">
              <i className="fa-solid fa-house text-lg group-hover:scale-110 transition-transform"></i>
            </button>
            <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl animate-bounce" style={{ backgroundColor: themeColor }}>
              <i className={`fa-solid ${txType === 'SAVING' ? 'fa-cash-register' : 'fa-hand-holding-dollar'} text-white text-xl`}></i>
            </div>
          </div>
        </div>

        <div className="flex-1 p-10 flex flex-col min-h-[500px]">
          {step === 'TYPE' && (
            <div className="flex-1 flex flex-col justify-center space-y-8">
              <div className="text-center space-y-3 mb-6">
                <h3 className="text-4xl font-black text-[#1A1A40] italic uppercase tracking-tighter leading-tight">Operación POS</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Selecciona el tipo de proceso</p>
              </div>
              <button onClick={() => { setTxType('SAVING'); setStep('PHONE'); }} className="group p-10 bg-slate-50 border-2 border-slate-100 rounded-[4rem] hover:bg-white hover:border-[#FF007F] hover:shadow-2xl transition-all flex items-center gap-8 active:scale-95">
                <div className="w-24 h-24 bg-[#FF007F] rounded-[2.5rem] flex items-center justify-center text-4xl text-white shadow-2xl border-b-8 border-pink-900 shrink-0 group-hover:rotate-6 transition-transform">
                  <i className="fa-solid fa-piggy-bank"></i>
                </div>
                <div className="text-left">
                  <h4 className="text-2xl font-black text-[#1A1A40] uppercase italic tracking-tighter">Abonar Vueltas</h4>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Cargar ahorro digital</p>
                </div>
              </button>
              <button onClick={() => { setTxType('PAYMENT'); setStep('PHONE'); }} className="group p-10 bg-slate-50 border-2 border-slate-100 rounded-[4rem] hover:bg-white hover:border-[#FF007F] hover:shadow-2xl transition-all flex items-center gap-8 active:scale-95">
                <div className="w-24 h-24 bg-[#FF007F] rounded-[2.5rem] flex items-center justify-center text-4xl text-white shadow-2xl border-b-8 border-pink-900 shrink-0 group-hover:-rotate-6 transition-transform">
                  <i className="fa-solid fa-cart-shopping"></i>
                </div>
                <div className="text-left">
                  <h4 className="text-2xl font-black text-[#1A1A40] uppercase italic tracking-tighter">Cobro Digital</h4>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Gasto de saldo Piggy</p>
                </div>
              </button>
            </div>
          )}

          {step !== 'TYPE' && step !== 'SUCCESS' && (
             <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-12 px-2">
                  {['PHONE', 'USER_INFO', 'OTP', 'AMOUNT'].map((s, idx) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center text-xs font-black border-4 transition-all duration-500 ${step === s ? 'text-white scale-125 shadow-2xl' : 'bg-white border-slate-100 text-slate-200'}`} style={{ backgroundColor: step === s ? themeColor : '', borderColor: step === s ? themeColor : '' }}>
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {step === 'PHONE' && (
                  <div className="space-y-8 animate-fadeIn flex-1 flex flex-col justify-center">
                     <h3 className="text-3xl font-black text-[#1A1A40] text-center uppercase italic tracking-tighter">Identificar Cliente</h3>
                     <div className="bg-slate-50 p-12 rounded-[3.5rem] border-4 border-slate-100 text-center text-5xl font-black text-[#1A1A40] shadow-inner tracking-tighter">
                        <span className="opacity-20 mr-3">+57</span>
                        {phone || '...'}
                     </div>
                  </div>
                )}

                {step === 'VERIFYING' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-pulse">
                    <div className="w-28 h-28 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-[#FF007F] text-5xl shadow-inner">
                       <i className="fa-solid fa-magnifying-glass animate-bounce"></i>
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A40] uppercase italic tracking-tighter">Verificando Usuario...</h3>
                  </div>
                )}

                {step === 'USER_INFO' && (
                  <div className="space-y-10 animate-slideUp flex-1 flex flex-col justify-center">
                     <div className={`p-10 rounded-[4rem] border-4 shadow-2xl text-center space-y-6 ${isExistingUser ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-3xl text-white shadow-lg ${isExistingUser ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                           <i className={`fa-solid ${isExistingUser ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                        </div>
                        <div className="space-y-2">
                          <h4 className={`text-2xl font-black uppercase italic tracking-tighter ${isExistingUser ? 'text-emerald-900' : 'text-indigo-900'}`}>
                             {isExistingUser ? 'Usuario Registrado' : 'Usuario Nuevo'}
                          </h4>
                          <p className="text-lg font-black text-slate-500 tracking-tighter">+57 {phone}</p>
                        </div>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                          {isExistingUser 
                            ? (txType === 'PAYMENT' ? 'Tiene saldo disponible para esta transacción.' : 'Su ahorro será acreditado inmediatamente.') 
                            : (txType === 'SAVING' ? '¡Bienvenido! Al abonar, crearemos su cerdito digital automáticamente.' : 'Este usuario no tiene cuenta. No puede realizar pagos.')}
                        </p>
                     </div>
                     {error && <p className="text-rose-500 text-xs font-black text-center uppercase tracking-widest animate-shake">{error}</p>}
                  </div>
                )}

                {step === 'OTP' && (
                  <div className="space-y-10 animate-fadeIn text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-[#1A1A40] uppercase italic tracking-tighter">Verificación</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] -mt-6">OTP enviado al {phone}</p>
                    <div className="flex justify-center gap-4">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-20 h-24 bg-slate-50 rounded-[2rem] border-4 flex items-center justify-center text-5xl font-black transition-all shadow-inner ${otp[i] ? 'text-white border-transparent' : 'text-slate-200 border-slate-100'}`} style={{ backgroundColor: otp[i] ? themeColor : '' }}>
                          {otp[i] || '•'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 'AMOUNT' && (
                  <div className="space-y-10 animate-fadeIn flex-1 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-[#1A1A40] text-center uppercase italic tracking-tighter">Monto Final</h3>
                    <div className="p-16 rounded-[4.5rem] text-center shadow-2xl border-b-[12px] border-pink-900" style={{ backgroundColor: themeColor }}>
                      <div className="text-7xl font-black tracking-tighter italic" style={{ color: themeText }}>
                        ${amount ? parseInt(amount).toLocaleString() : '0'}
                      </div>
                    </div>
                    {error && (
                      <div className="bg-rose-50 p-6 rounded-[2.5rem] border-2 border-rose-100 animate-shake shadow-lg">
                         <p className="text-rose-500 text-center font-black uppercase text-xs tracking-widest leading-relaxed">{error}</p>
                      </div>
                    )}
                  </div>
                )}

                {step !== 'VERIFYING' && (
                  <div className="mt-12 grid grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <button 
                        key={n} 
                        onClick={() => handleKeypad(n.toString())} 
                        className="h-24 bg-slate-50 text-[#1A1A40] rounded-[2rem] font-black text-3xl border-2 border-slate-100 shadow-sm hover:bg-white hover:shadow-2xl hover:border-[#FF007F] transition-all active:scale-95"
                      >
                        {n}
                      </button>
                    ))}
                    <button 
                      onClick={handleBackspace} 
                      className="h-24 bg-rose-50 rounded-[2rem] font-black text-rose-500 border-2 border-rose-100 shadow-sm active:scale-95 transition-all hover:bg-rose-100"
                    >
                      <i className="fa-solid fa-delete-left text-3xl"></i>
                    </button>
                    <button 
                      onClick={() => handleKeypad('0')} 
                      className="h-24 bg-slate-50 text-[#1A1A40] rounded-[2rem] font-black text-3xl border-2 border-slate-100 shadow-sm hover:bg-white hover:shadow-2xl hover:border-[#FF007F] transition-all active:scale-95"
                    >
                      0
                    </button>
                    <button 
                      onClick={nextStep} 
                      className="h-24 rounded-[2rem] font-black shadow-2xl active:scale-95 transition-all border-b-8 border-pink-900 hover:brightness-110" 
                      style={{ backgroundColor: themeColor, color: themeText }}
                    >
                      <i className="fa-solid fa-check text-4xl"></i>
                    </button>
                  </div>
                )}
             </div>
          )}

          {step === 'SUCCESS' && (
             <div className="text-center space-y-16 animate-fadeIn flex-1 flex flex-col justify-center">
                <div className="w-64 h-64 bg-[#FF007F] rounded-[5rem] flex items-center justify-center mx-auto text-9xl shadow-2xl rotate-6 border-b-[16px] border-pink-900 animate-bounce">🎉</div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-black text-[#1A1A40] italic uppercase tracking-tighter">¡Listo!</h3>
                  <p className="text-slate-400 font-black uppercase text-sm tracking-[0.4em]">Transacción exitosa</p>
                </div>
                <button onClick={reset} className="w-full py-8 bg-[#1A1A40] text-white rounded-[3rem] font-black uppercase tracking-[0.3em] border-b-[12px] border-black shadow-2xl text-sm active:scale-95 transition-all">OPERAR DE NUEVO</button>
             </div>
          )}
        </div>
      </div>

      {/* Info Sidebar for Desktop */}
      <div className="hidden md:flex flex-col gap-8 w-80 shrink-0">
        <div className="bg-[#CCFF00] p-10 rounded-[4rem] border-b-[12px] border-[#99CC00] shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-4xl shadow-xl border-4 border-[#1A1A40]">💡</div>
          <div className="space-y-4">
            <h4 className="text-2xl font-black text-[#1A1A40] italic uppercase tracking-tighter leading-tight">TIP DE OPERACIÓN</h4>
            <p className="text-sm text-[#1A1A40] font-bold opacity-70 leading-relaxed">
              Recuerda siempre ofrecer el redondeo. ¡El 80% de los clientes acepta si les explicas que es para su ahorro digital!
            </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[4rem] border-2 border-slate-50 shadow-2xl space-y-8">
          <h4 className="text-xl font-black text-[#1A1A40] italic uppercase tracking-tighter">ESTADÍSTICAS HOY</h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abonos</span>
              <span className="text-lg font-black text-[#1A1A40]">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cobros</span>
              <span className="text-lg font-black text-[#1A1A40]">12</span>
            </div>
            <div className="pt-4 border-t-2 border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-[#FF007F] uppercase tracking-widest">Total Redondeo</span>
              <span className="text-xl font-black text-[#FF007F]">$45.200</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] italic">Piggy POS v4.0.2</p>
        </div>
      </div>
    </div>
  );
};

export default CashierView;
