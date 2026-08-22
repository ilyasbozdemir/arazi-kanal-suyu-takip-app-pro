import React, { FC } from 'react';
import { RefreshCw } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface ProcessingOverlayProps {
  isProcessing: boolean;
  message?: string;
}

export const ProcessingOverlay: FC<ProcessingOverlayProps> = ({ 
  isProcessing, 
  message = "İŞLEM SÜRÜYOR..." 
}) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[50px] shadow-2xl flex flex-col items-center gap-6 border border-white/10">
        <RefreshCw size={64} className="text-primary-500 animate-spin" />
        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] italic animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
