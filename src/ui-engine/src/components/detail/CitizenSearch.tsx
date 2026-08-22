import { useState } from "react";
import { Search, Activity, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CitizenSearch = ({ onSelect, label, initialValue }: any) => {
  const [searchText, setSearchText] = useState(initialValue || "");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  const handleSearch = async (val: string) => {
    setSearchText(val);
    if (val.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await (window as any).api.globalSearch(val);
      if (res.success) {
        setResults(
          res.data.filter((r: any) => r.table_name === "DATA_Vatandas"),
        );
        setIsOpen(true);
      }
    } catch (e) {}
    setIsSearching(false);
  };

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
        {label}
      </label>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchText.length >= 3 && setIsOpen(true)}
          placeholder="TCKN veya Ad Soyad ile ara..."
          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-black outline-none focus:border-primary-500 transition-all"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary-500">
            <Activity size={16} />
          </div>
        )}
      </div>

      {selectedName && (
        <div className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-black text-emerald-600 uppercase">
          Seçilen Kişi: {selectedName}
        </div>
      )}

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl rounded-2xl mt-2 p-2 z-[300] max-h-60 overflow-y-auto"
          >
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-primary-100 text-left"
                onClick={() => {
                  onSelect(r.subtitle); // Assuming subtitle is TCKN in search results
                  setSearchText(r.subtitle);
                  setSelectedName(r.title);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div className="text-xs font-black text-slate-700 dark:text-white uppercase">
                    {r.title}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {r.subtitle}
                  </div>
                </div>
                <User size={16} className="text-slate-300" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

