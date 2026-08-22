import React, { useState, useEffect } from 'react';
import { Quote, Sparkles, Lightbulb, MousePointerClick } from 'lucide-react';
import { APP_EDUCATION_TIPS } from '../../core/constants/AppEducationTips';

export const WisdomWidget: React.FC = () => {
  const [quote, setQuote] = useState(APP_EDUCATION_TIPS[0]);

  const nextQuote = () => {
    const randomIndex = Math.floor(Math.random() * APP_EDUCATION_TIPS.length);
    setQuote(APP_EDUCATION_TIPS[randomIndex]);
  };

  useEffect(() => {
    nextQuote();
  }, []);

  return (
    <div 
      onClick={nextQuote}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 shadow-sm relative overflow-hidden group cursor-pointer hover:border-primary-500/50 transition-all active:scale-[0.98]"
    >
      {/* 🛡️ Kurumsal Dekorasyon */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-3xl opacity-50 group-hover:bg-primary-500/5 transition-all" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                <Lightbulb size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-primary-500 transition-colors">OPERASYONEL EĞİTİM NOTU</span>
          </div>
          <Sparkles className="text-slate-200 dark:text-slate-700 animate-pulse" size={16} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight italic min-h-[60px]">
            "{quote.text}"
          </h3>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
               <div className="h-[1.5px] w-6 bg-primary-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                  {quote.author}
               </span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
               <MousePointerClick size={12} />
               <span className="text-[8px] font-black uppercase tracking-tighter">TIKLA VE ÖĞREN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
