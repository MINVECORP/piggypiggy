
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface MerchantInventoryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'merchantId' | 'merchantName'>) => void;
  onRemoveProduct: (id: string) => void;
}

const MerchantInventory: React.FC<MerchantInventoryProps> = ({ products, onAddProduct, onRemoveProduct }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Alimentos');
  const [emoji, setEmoji] = useState('📦');
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'default' | 'nameAsc' | 'priceAsc' | 'priceDesc'>('default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    onAddProduct({
      name,
      price: parseFloat(price),
      category,
      imageUrl: emoji,
    });

    // Reset form
    setName('');
    setPrice('');
    setCategory('Alimentos');
    setEmoji('📦');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar este producto del marketplace?')) {
      onRemoveProduct(id);
    }
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'nameAsc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'priceAsc') {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      return list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, sortBy]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-32 px-4 md:px-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Inventario Aliado 📦</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestiona tus productos en el marketplace</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-95 border-b-8 ${showForm ? 'bg-white text-slate-400 border-slate-200' : 'bg-[#FF007F] text-white border-pink-900 hover:bg-pink-600'}`}
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
          {showForm ? 'Cerrar Formulario' : 'Publicar Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-8 border-white space-y-8 animate-slideUp max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#CCFF00] rounded-2xl flex items-center justify-center text-[#1A1A40] text-xl shadow-lg border-2 border-[#1A1A40]">
              <i className="fa-solid fa-tag"></i>
            </div>
            <h3 className="text-2xl font-black text-[#1A1A40] italic uppercase tracking-tighter">Detalles del Producto</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">NOMBRE DEL PRODUCTO</label>
              <input 
                type="text" 
                placeholder="Ej. Pan Tajado Artesanal" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-black focus:border-[#FF007F] outline-none transition-all" 
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PRECIO ($)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#FF007F]">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-5 pl-10 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-black focus:border-[#FF007F] outline-none transition-all" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CATEGORÍA</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-black focus:border-[#FF007F] outline-none transition-all appearance-none"
                >
                  <option>Alimentos</option>
                  <option>Aseo</option>
                  <option>Snacks</option>
                  <option>Tecno</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ICONO / EMOJI REPRESENTATIVO</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Ej. 🍞" 
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 text-sm font-black focus:border-[#FF007F] outline-none transition-all text-center text-2xl" 
                  maxLength={2}
                />
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner border-2 border-slate-100 shrink-0">
                  {emoji || '📦'}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-[#1A1A40] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-b-8 border-black hover:bg-slate-800">
              PUBLICAR EN MARKETPLACE 🚀
            </button>
          </div>
        </form>
      )}

      {/* Sorting Tools */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-50">
          <div className="flex items-center gap-3">
             <i className="fa-solid fa-sliders text-slate-300"></i>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordenar listado</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setSortBy(sortBy === 'nameAsc' ? 'default' : 'nameAsc')}
              className={`flex-1 sm:flex-none text-[10px] font-black px-6 py-3 rounded-2xl transition-all border-2 uppercase tracking-widest ${sortBy === 'nameAsc' ? 'bg-[#1A1A40] text-white border-[#1A1A40] shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-[#FF007F]'}`}
            >
              <i className="fa-solid fa-arrow-down-a-z mr-2"></i> Nombre
            </button>
            <button 
              onClick={() => setSortBy(sortBy === 'priceAsc' ? 'priceDesc' : sortBy === 'priceDesc' ? 'default' : 'priceAsc')}
              className={`flex-1 sm:flex-none text-[10px] font-black px-6 py-3 rounded-2xl transition-all border-2 uppercase tracking-widest ${sortBy.startsWith('price') ? 'bg-[#1A1A40] text-white border-[#1A1A40] shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-[#FF007F]'}`}
            >
              <i className={`fa-solid ${sortBy === 'priceDesc' ? 'fa-arrow-down-wide-short' : 'fa-arrow-up-wide-short'} mr-2`}></i> Precio
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <i className="fa-solid fa-box-open text-4xl text-slate-200"></i>
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sin productos publicados</h3>
            <p className="text-slate-400 text-sm mt-2">Empieza a vender publicando tu primer producto</p>
          </div>
        ) : (
          sortedProducts.map(p => (
            <div key={p.id} className="group bg-white p-8 rounded-[3rem] shadow-xl border-2 border-slate-50 flex flex-col gap-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border-2 border-slate-100 group-hover:scale-110 transition-transform duration-500">
                  {p.imageUrl}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-[#1A1A40] text-xl leading-tight truncate uppercase italic tracking-tighter">{p.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] bg-[#CCFF00] text-[#1A1A40] px-3 py-1 rounded-full font-black uppercase tracking-widest">{p.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PRECIO VENTA</p>
                  <p className="text-2xl font-black text-[#FF007F] tracking-tighter">${p.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#1A1A40] hover:text-white transition-all shadow-sm">
                    <i className="fa-solid fa-pen text-sm"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center pt-12">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic">Piggybanko • Tu inventario siempre al día</p>
      </div>
    </div>
  );
};

export default MerchantInventory;
