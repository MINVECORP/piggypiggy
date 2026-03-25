
import React from 'react';
import { LEVELS } from '../constants';

interface MascotProps {
  level: number;
  isHappy: boolean;
}

const Mascot: React.FC<MascotProps> = ({ level, isHappy }) => {
  const currentLevel = LEVELS[Math.min(level, LEVELS.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-pink-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-xs font-bold text-pink-400 opacity-20 rotate-12">
        8-BIT STYLE
      </div>
      
      <div className={`text-8xl transition-transform duration-500 ${isHappy ? 'scale-110 animate-bounce' : 'scale-100'}`}>
        {currentLevel.visual}
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold text-slate-800">{currentLevel.name}</h3>
        <p className="text-sm text-slate-500">Nivel {level + 1}</p>
      </div>

      {level >= 1 && (
        <div className="absolute top-1/4 left-1/4 animate-pulse">
            <span className="text-2xl">✨</span>
        </div>
      )}
    </div>
  );
};

export default Mascot;
