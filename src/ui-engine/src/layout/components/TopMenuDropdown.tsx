import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label?: string;
  icon?: any;
  shortcut?: string;
  onClick?: () => void;
  type?: 'separator';
}

interface TopMenuDropdownProps {
  label: string;
  items: (MenuItem | null)[];
}

const TopMenuDropdown: FC<TopMenuDropdownProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredItems = items.filter(Boolean) as MenuItem[];

  return (
    <div 
      className="relative h-full flex items-center" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className={`h-full px-3 text-[10px] font-bold uppercase tracking-wider transition-all no-drag ${
          isOpen 
            ? 'text-primary-500 bg-white dark:bg-slate-800 shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
        }`}
      >
        {label}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -5 }} 
            className="absolute top-[100%] left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl rounded-b-xl overflow-hidden py-2 z-[3000]"
          >
            {filteredItems.map((item, i) => {
              if (item.type === 'separator') return <div key={i} className="my-2 h-px bg-slate-100 dark:bg-white/5 mx-2" />;
              return (
                <button 
                  key={i} 
                  onClick={() => { item.onClick?.(); setIsOpen(false); }} 
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-primary-500 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon size={14} className="text-slate-400 group-hover:text-white" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{item.label}</span>
                  </div>
                  {item.shortcut && <span className="text-[8px] font-black opacity-40 group-hover:opacity-100">{item.shortcut}</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopMenuDropdown;

