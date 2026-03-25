
import React from 'react';

export const COLORS = {
  primary: '#FF007F', // Neon Pink
  secondary: '#1A1A40', // Deep Blue
  accent: '#CCFF00', // Lime Green
  background: '#ffffff'
};

export const LEVELS = [
  { name: 'Semilla', minXp: 0, visual: '🌱' },
  { name: 'Lechón', minXp: 100, visual: '🐷' },
  { name: 'Jabalí', minXp: 500, visual: '🐗' },
  { name: 'Rey de la Granja', minXp: 1500, visual: '👑' }
];

export const Logo = () => (
  <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
    <div className="w-10 h-10 bg-[#FF007F] rounded-lg flex items-center justify-center text-white text-xl shadow-lg shadow-pink-200">
      <i className="fa-solid fa-piggy-bank"></i>
    </div>
    <span className="text-[#1A1A40]">piggy<span className="text-[#FF007F]">banko</span></span>
  </div>
);
