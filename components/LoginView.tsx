
import React, { useState } from 'react';
import { AppRole } from '../types';
import { Logo } from '../constants';

interface LoginViewProps {
  onLogin: (role: AppRole, phone: string, pin?: string, code?: string, name?: string) => void;
  loginError: boolean;
}

type ViewMode = 'LOGIN' | 'REGISTER';

const LoginView: React.FC<LoginViewProps> = ({ onLogin, loginError }) => {
  const [view, setView] = useState<ViewMode>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<AppRole>(AppRole.USER);
  const [phone, setPhone] = useState('3001234567');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'LOGIN') {
      onLogin(selectedRole, phone, pin, code);
    } else {
      // Flujo de registro para Usuarios
      onLogin(AppRole.USER, phone, undefined, undefined, name);
    }
  };

  const isRegisterMode = view === 'REGISTER';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs - Subtle in Light Mode */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF007F]/5 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-sm space-y-12 relative z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-6 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 animate-fadeIn">
            <Logo />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-[#1A1A40] italic tracking-tighter uppercase animate-slideUp">
              {isRegisterMode ? 'Únete a Piggy' : '¡Hola de nuevo!'}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] animate-fadeIn">
              {isRegisterMode ? 'Empieza a ahorrar hoy' : 'El ahorro es el camino al éxito'}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[4rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8 animate-slideUp">
          {!isRegisterMode && (
            <div className="space-y-4">
              {/* Role Selector - Only visible in Login */}
              <div className="flex p-2 bg-slate-50 rounded-[2.5rem] gap-1 border border-slate-100">
                {[
                  { id: AppRole.USER, label: 'Usuario', icon: 'fa-user' },
                  { id: AppRole.MERCHANT, label: 'Comercio', icon: 'fa-shop' },
                  { id: AppRole.CASHIER, label: 'Terminal', icon: 'fa-cash-register' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex-1 py-4 rounded-[2rem] flex flex-col items-center gap-1 transition-all ${
                      selectedRole === r.id 
                      ? 'bg-[#1A1A40] text-[#CCFF00] shadow-xl scale-105' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <i className={`fa-solid ${r.icon} text-sm`}></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleEnter} className="space-y-6">
            <div className="space-y-4">
              {isRegisterMode && (
                <div className="space-y-2 animate-slideLeft">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 focus-within:border-[#FF007F] focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-50 transition-all">
                    <i className="fa-solid fa-user text-slate-300"></i>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent outline-none text-[#1A1A40] font-black w-full" 
                      placeholder="Tu nombre aquí"
                      required={isRegisterMode}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Celular de acceso</label>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 focus-within:border-[#FF007F] focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-50 transition-all">
                  <span className="text-slate-300 font-black">+57</span>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent outline-none text-[#1A1A40] font-black w-full" 
                    placeholder="300 000 0000"
                    required
                  />
                </div>
              </div>
            </div>

            {selectedRole === AppRole.CASHIER && !isRegisterMode && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Código de Tienda</label>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none text-[#1A1A40] font-black focus:border-[#CCFF00] focus:bg-white transition-all uppercase" 
                    placeholder="PIGGY-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">PIN Secreto</label>
                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none text-[#1A1A40] font-black focus:border-[#CCFF00] focus:bg-white transition-all" 
                    placeholder="••••"
                    maxLength={4}
                  />
                </div>
              </div>
            )}

            {loginError && (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3 animate-shake">
                <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
                <p className="text-rose-500 text-[9px] font-black uppercase tracking-tight">
                  Credenciales inválidas. Revisa los datos.
                </p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-6 bg-[#FF007F] text-white rounded-[2.5rem] font-black shadow-2xl shadow-pink-200 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs border-b-8 border-pink-700 mt-4"
            >
              {isRegisterMode ? 'CREAR MI PIGGY 🐷' : 'ACCEDER A MI PIGGY 🚀'}
            </button>
          </form>

          {isRegisterMode && (
            <div className="text-center pt-2">
              <button 
                onClick={() => setView('LOGIN')}
                className="text-[#1A1A40] text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Ya tengo cuenta, iniciar sesión
              </button>
            </div>
          )}
        </div>

        {!isRegisterMode && (
          <div className="text-center space-y-6">
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              ¿No tienes cuenta?{' '}
              <span 
                onClick={() => setView('REGISTER')}
                className="text-[#FF007F] cursor-pointer hover:underline font-black"
              >
                Regístrate
              </span>
            </p>
            <div className="flex justify-center gap-4">
               <div className="w-10 h-1 border-t border-slate-100"></div>
               <i className="fa-solid fa-piggy-bank text-slate-100"></i>
               <div className="w-10 h-1 border-t border-slate-100"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;
