
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AdminView: React.FC = () => {
  const chartData = [
    { name: 'Lun', users: 120, volume: 450000 },
    { name: 'Mar', users: 150, volume: 520000 },
    { name: 'Mie', users: 180, volume: 610000 },
    { name: 'Jue', users: 210, volume: 800000 },
    { name: 'Vie', users: 250, volume: 950000 },
    { name: 'Sab', users: 300, volume: 1200000 },
    { name: 'Dom', users: 320, volume: 1100000 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-32 px-4 md:px-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Treasury Control 🏛️</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monitoreo de liquidez y riesgo global</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             SISTEMA OK
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-100">
             <i className="fa-solid fa-vault"></i>
             FONDOS ACTIVOS
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-chart-line text-[10rem]"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Total Float Global</p>
          <h3 className="text-4xl font-black text-[#1A1A40] tracking-tighter italic">$450.500.000</h3>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs font-black text-emerald-500">↑ 12%</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">vs ayer</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-hand-holding-dollar text-[10rem]"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Deuda Comercios</p>
          <h3 className="text-4xl font-black text-rose-500 tracking-tighter italic">$12.400.000</h3>
          <div className="flex items-center gap-2 mt-4">
            <i className="fa-solid fa-clock text-rose-300 text-xs"></i>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Vencimiento: 10:00 AM</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-percent text-[10rem]"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">ROI Fondos (24h)</p>
          <h3 className="text-4xl font-black text-emerald-500 tracking-tighter italic">11.5% E.A.</h3>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Spread Piggy: 3.5%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[4rem] shadow-2xl border-2 border-slate-50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-[#1A1A40] uppercase italic tracking-tighter">Crecimiento de Ahorro</h3>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">7 DÍAS</button>
              <button className="px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-300 uppercase tracking-widest">30 DÍAS</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF007F" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF007F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#FF007F" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 h-full">
            <h3 className="text-xl font-black text-[#1A1A40] uppercase italic tracking-tighter mb-8">Alertas de Riesgo ⚠️</h3>
            <div className="space-y-6">
              <div className="p-6 bg-rose-50 rounded-[2.5rem] flex flex-col gap-4 border-2 border-rose-100 group hover:bg-rose-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                    <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                  </div>
                  <button className="text-[9px] font-black bg-rose-500 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-all">NOTIFICAR</button>
                </div>
                <div>
                  <p className="text-sm font-black text-rose-900 uppercase italic">Cupo Crítico: Don Roberto</p>
                  <p className="text-[10px] text-rose-700 font-bold mt-1">Recaudo: $195.000 / $200.000</p>
                </div>
                <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[97%]"></div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2.5rem] flex flex-col gap-4 border-2 border-slate-100 group hover:bg-white transition-all">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                    <i className="fa-solid fa-check-circle text-xl"></i>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HACE 2H</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase italic">Conciliación Exitosa</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Snapshot Treasury v2.4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-12">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic">Piggybanko Treasury • Seguridad y Transparencia</p>
      </div>
    </div>
  );
};

export default AdminView;
