import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCompactNumber, formatNumber } from '../utils/numberUtils';

interface AbbreviatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
  label?: string;
}

export const AbbreviatedNumber: React.FC<AbbreviatedNumberProps> = ({ 
  value, 
  suffix = '', 
  className = '', 
  label = 'TAM DEĞER' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLarge = Math.abs(value) >= 1000;

  if (!isLarge) {
    return <span className={className}>{formatNumber(value)}{suffix ? ` ${suffix}` : ''}</span>;
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`cursor-help border-b border-dotted border-slate-300 dark:border-white/20 pb-0.5 transition-colors hover:border-primary-500 ${className}`}>
        {formatCompactNumber(value)}{suffix ? ` ${suffix}` : ''}
      </span>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl min-w-[140px] pointer-events-none"
          >
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1 whitespace-nowrap">
                {label}
              </p>
              <div className="flex items-baseline gap-1.5 justify-center">
                <span className="text-sm font-black tabular-nums tracking-tighter whitespace-nowrap">
                  {formatNumber(value)}
                </span>
                {suffix && <span className="text-[9px] font-bold opacity-60 uppercase">{suffix}</span>}
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-8 border-transparent border-t-slate-900 dark:border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
