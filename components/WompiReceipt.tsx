
import React from 'react';

interface WompiReceiptProps {
  transactionId: string;
  amount: number;
  reference: string;
  date: string;
  type: string;
  onClose: () => void;
}

const WompiReceipt: React.FC<WompiReceiptProps> = ({ transactionId, amount, reference, date, type, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#1A1A40]/95 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp border border-white/20">
        {/* Header Decorator */}
        <div className="h-4 bg-[#FF007F] w-full"></div>
        
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-4xl shadow-inner border-4 border-white">
              <i className="fa-solid fa-check"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1A1A40] italic uppercase tracking-tighter">¡Pago Exitoso!</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Procesado por Wompi Bancolombia</p>
            </div>
          </div>

          {/* Receipt Info Section */}
          <div className="space-y-4 relative">
             {/* Serrated Edge Top */}
             <div className="absolute -top-4 left-0 right-0 h-2 flex justify-between px-2">
                {[...Array(10)].map((_, i) => <div key={i} className="w-4 h-4 bg-white rounded-full -mt-2"></div>)}
             </div>

             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Total</span>
                  <span className="text-xl font-black text-[#1A1A40]">${amount.toLocaleString()}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">Concepto</span>
                    <span className="font-black text-[#1A1A40] uppercase">{type}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">ID Transacción</span>
                    <span className="font-black text-slate-800">{transactionId}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">Referencia</span>
                    <span className="font-black text-slate-800">{reference}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">Fecha</span>
                    <span className="font-black text-slate-800">{date}</span>
                  </div>
                </div>
             </div>

             {/* QR Simulado */}
             <div className="flex flex-col items-center pt-2 gap-2">
                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                   <i className="fa-solid fa-qrcode text-4xl text-slate-200"></i>
                </div>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Escanea para verificar validez</p>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-[#1A1A40] text-[#CCFF00] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all border-b-8 border-black"
          >
            VOLVER AL INICIO 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default WompiReceipt;
