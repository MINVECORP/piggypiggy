
import React, { useState, useEffect } from 'react';
import { AppRole, UserAccount, MerchantAccount, Product, Promotion, Transaction } from './types';
import { Logo } from './constants';
import UserView from './components/UserView';
import MerchantView from './components/MerchantView';
import AdminView from './components/AdminView';
import MarketplaceView from './components/MarketplaceView';
import PromotionsView from './components/PromotionsView';
import MapView from './components/MapView';
import CashierView from './components/CashierView';
import MerchantInventory from './components/MerchantInventory';
import MerchantPromotions from './components/MerchantPromotions';
import LoginView from './components/LoginView';
import WompiReceipt from './components/WompiReceipt';
import { PiggyRepository } from './repositories/piggyRepository';

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole>(AppRole.USER);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'HOME' | 'MARKETPLACE' | 'PROMOTIONS' | 'MAP'>('HOME');
  const [receipt, setReceipt] = useState<any>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Solo mostrar si no se ha mostrado antes en esta sesión o si es la primera vez
      const hasSeenPrompt = sessionStorage.getItem('pwa-prompt-seen');
      if (!hasSeenPrompt) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa-prompt-seen', 'true');
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa-prompt-seen', 'true');
  };

  // Firestore Live State
  const [user, setUser] = useState<UserAccount | null>(null);
  const [merchants, setMerchants] = useState<MerchantAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Efecto para conectar los Listeners de Firebase
  useEffect(() => {
    let unsubscribeUser: () => void;
    let unsubscribeTxs: () => void;

    const startCloudSync = async () => {
      setIsLoading(true);
      try {
        // 1. Cargar comercios (datos más estáticos)
        const merchantList = await PiggyRepository.getMerchants();
        setMerchants(merchantList);

        // 2. Suscribirse al usuario real (cambia con pagos/recargas)
        unsubscribeUser = PiggyRepository.subscribeToUser('valen-001', (userData) => {
          setUser(userData);
          setIsLoading(false);
        });

        // 3. Suscribirse al feed de transacciones
        unsubscribeTxs = PiggyRepository.subscribeToTransactions((txList) => {
          setTransactions(txList);
        });

      } catch (err) {
        console.error("Cloud Sync Error:", err);
        setIsLoading(false);
      }
    };

    startCloudSync();

    // Limpiar conexiones al desmontar
    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeTxs) unsubscribeTxs();
    };
  }, []);

  const handleTopUp = async (amount: number, txResult: any) => {
    // Ya no necesitamos llamar a syncState(), Firebase lo hará solo por el listener
    await PiggyRepository.processTopUp(amount, txResult.id, txResult.reference, user?.id);
    setReceipt({
      transactionId: txResult.id,
      amount,
      reference: txResult.reference,
      date: new Date().toLocaleString(),
      type: 'RECARGA WALLET'
    });
  };

  if (!isLogged) return <LoginView onLogin={(r) => {setRole(r); setIsLogged(true);}} loginError={false} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden">
      {receipt && <WompiReceipt {...receipt} onClose={() => setReceipt(null)} />}
      
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="loader-dots flex gap-2 mb-4">
            <div className="w-4 h-4 bg-[#FF007F] rounded-full"></div>
            <div className="w-4 h-4 bg-[#1A1A40] rounded-full"></div>
            <div className="w-4 h-4 bg-[#CCFF00] rounded-full"></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Conectando a Piggy Real-Time...</p>
        </div>
      ) : (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-[#1A1A40] text-white p-6 sticky top-0 h-screen z-50">
            <div className="mb-12">
              <button onClick={() => setActiveTab('HOME')} className="hover:scale-105 transition-transform">
                <Logo />
              </button>
            </div>
            
            <nav className="flex-1 space-y-4">
              {role === AppRole.USER && [
                { id: 'HOME', icon: 'fa-house', label: 'Inicio' },
                { id: 'MARKETPLACE', icon: 'fa-store', label: 'Tienda' },
                { id: 'PROMOTIONS', icon: 'fa-tags', label: 'Promos' },
                { id: 'MAP', icon: 'fa-map-location-dot', label: 'Mapa' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-[#FF007F] text-white shadow-lg' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-6`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
              {role === AppRole.MERCHANT && [
                { id: 'HOME', icon: 'fa-chart-pie', label: 'Dashboard' },
                { id: 'INVENTORY', icon: 'fa-boxes-stacked', label: 'Inventario' },
                { id: 'PROMOS', icon: 'fa-bullhorn', label: 'Campañas' },
                { id: 'POS', icon: 'fa-cash-register', label: 'Terminal POS' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-[#CCFF00] text-[#1A1A40] shadow-lg' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-6`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
              {role === AppRole.ADMIN && [
                { id: 'HOME', icon: 'fa-vault', label: 'Tesorería' },
                { id: 'USERS', icon: 'fa-users', label: 'Usuarios' },
                { id: 'MERCHANTS', icon: 'fa-shop', label: 'Comercios' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-6`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={() => setIsLogged(false)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-white/50 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
              >
                <i className="fa-solid fa-sign-out w-6"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-h-screen relative">
            {/* Mobile Header */}
            <header className="md:hidden flex justify-between items-center p-6 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
              <button onClick={() => setActiveTab('HOME')}><Logo /></button>
              <button onClick={() => setIsLogged(false)} className="w-10 h-10 bg-slate-50 rounded-full text-slate-400 flex items-center justify-center">
                <i className="fa-solid fa-sign-out"></i>
              </button>
            </header>

            <div className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
              <div className="animate-fadeIn">
                {role === AppRole.USER && user && (
                  activeTab === 'HOME' ? <UserView user={user} onGoHome={() => setActiveTab('HOME')} onTopUp={handleTopUp} /> :
                  activeTab === 'MARKETPLACE' ? <MarketplaceView products={[]} userBalance={user.balance} /> :
                  activeTab === 'MAP' ? <MapView merchants={merchants} userBalance={user.balance} onViewStore={() => setActiveTab('MARKETPLACE')} /> :
                  <PromotionsView promotions={[]} userBalance={user.balance} />
                )}
                {role === AppRole.MERCHANT && merchants.length > 0 && (
                  activeTab === 'HOME' ? (
                    <MerchantView 
                      merchant={merchants[0]} 
                      allMerchants={merchants} 
                      onGoHome={() => setActiveTab('HOME')} 
                      onMerchantPayUser={() => true}
                      onSettlement={() => {}} 
                    />
                  ) : activeTab === 'INVENTORY' ? (
                    <MerchantInventory 
                      products={merchants[0].inventory || []} 
                      onAddProduct={() => {}} 
                      onRemoveProduct={() => {}} 
                    />
                  ) : activeTab === 'PROMOS' ? (
                    <MerchantPromotions 
                      promotions={merchants[0].promotions || []} 
                      onAddPromotion={() => {}} 
                      onRemovePromotion={() => {}} 
                    />
                  ) : (
                    <CashierView 
                      merchantName={merchants[0].name} 
                      onProcessTransaction={() => true} 
                      mockUserBalance={100000} 
                      onGoHome={() => setActiveTab('HOME')} 
                    />
                  )
                )}
                {role === AppRole.ADMIN && (
                  activeTab === 'HOME' ? <AdminView /> :
                  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">🚧</div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Módulo en Construcción</h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Estamos trabajando para habilitar esta sección</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1A1A40] text-white rounded-3xl p-4 flex justify-between items-center shadow-2xl z-50">
              <button onClick={() => setActiveTab('HOME')} className={activeTab === 'HOME' ? 'text-[#FF007F]' : 'opacity-50'}><i className="fa-solid fa-house"></i></button>
              <button onClick={() => setActiveTab('MARKETPLACE')} className={activeTab === 'MARKETPLACE' ? 'text-[#FF007F]' : 'opacity-50'}><i className="fa-solid fa-store"></i></button>
              <div className="relative -top-10">
                <button className="w-14 h-14 bg-[#FF007F] rounded-full border-4 border-white shadow-lg active:scale-90 transition-transform">
                  <i className="fa-solid fa-qrcode"></i>
                </button>
              </div>
              <button onClick={() => setActiveTab('PROMOTIONS')} className={activeTab === 'PROMOTIONS' ? 'text-[#FF007F]' : 'opacity-50'}><i className="fa-solid fa-tags"></i></button>
              <button onClick={() => setActiveTab('MAP')} className={activeTab === 'MAP' ? 'text-[#FF007F]' : 'opacity-50'}><i className="fa-solid fa-map-location-dot"></i></button>
            </nav>

            {/* PWA Install Banner */}
            {showInstallBanner && (
              <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white rounded-[2.5rem] p-6 shadow-2xl z-[60] border border-slate-100 animate-slideUp">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FF007F] rounded-2xl flex items-center justify-center text-white text-xl shrink-0 shadow-lg shadow-pink-100">
                    <i className="fa-solid fa-mobile-screen-button"></i>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-black text-[#1A1A40] uppercase italic tracking-tighter">Instala Piggybanko</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Accede más rápido y ahorra con un solo toque desde tu pantalla de inicio.</p>
                  </div>
                  <button onClick={dismissInstallBanner} className="w-8 h-8 bg-slate-50 rounded-full text-slate-300 hover:text-slate-500 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={handleInstallClick}
                    className="flex-1 py-4 bg-[#1A1A40] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Instalar Ahora 🚀
                  </button>
                  <button 
                    onClick={dismissInstallBanner}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Quizás luego
                  </button>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
