import { HelpCircle } from "lucide-react";

export const SummaryCard = (
  {
    label,
    value,
    unit,
    icon: Icon,
    colorClass = "text-primary-600",
    bgClass = "bg-primary-500/5",
    helpText,
  }: any,
) => (
  <div
    className={`p-6 ${bgClass} rounded-[32px] border border-white/10 shadow-sm flex flex-col justify-between h-40 group hover:shadow-xl transition-all duration-500 relative`}
  >
    <div className="flex justify-between items-start">
      <div
        className={`p-3 rounded-2xl ${
          bgClass.replace("/5", "/10")
        } group-hover:scale-110 transition-transform`}
      >
        <Icon size={20} className={colorClass} />
      </div>
      {helpText && (
        <div className="group/help relative">
          <HelpCircle
            size={16}
            className="text-slate-300 hover:text-primary-500 cursor-help transition-colors"
          />
          <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-slate-800 text-white text-[9px] font-bold rounded-xl opacity-0 group-hover/help:opacity-100 transition-opacity z-[200] pointer-events-none shadow-2xl uppercase tracking-wider leading-relaxed">
            {helpText}
          </div>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <div
          className={`text-2xl font-black ${colorClass} tracking-tighter italic`}
        >
          {value}
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase">{unit}</div>
      </div>
    </div>
  </div>
);

