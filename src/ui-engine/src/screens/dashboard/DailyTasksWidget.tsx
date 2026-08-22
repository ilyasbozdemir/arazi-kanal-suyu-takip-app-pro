import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Lock,
  Sunrise,
  Sunset,
  Zap
} from 'lucide-react';
import { ElectronService } from '../../services/ElectronService';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'PRE' | 'POST' | 'EOD';
  completed: boolean;
}

export const DailyTasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      type: 'PRE', 
      title: 'Defter ve Merav Kontrolü', 
      description: 'Dağıtım öncesi tüm defterlerin ve personel atamalarının aktifliğini resmi prosedür çerçevesinde kontrol edin.',
      completed: false 
    },
    { 
      id: '2', 
      type: 'PRE', 
      title: 'Kasa Açılış Doğrulaması', 
      description: 'Güne başlamadan mevcut kasa bakiyesini fiziksel nakit ile eşitleyin. Mali disiplin bu aşamadan başlar.',
      completed: false 
    },
    { 
      id: '3', 
      type: 'POST', 
      title: 'Fiş ve Tahakkuk Senkronu', 
      description: 'Gün içinde kesilen fiziksel fişlerin sisteme ivedilikle girildiğinden emin olun. Geciken kayıt, mali risk doğurur!',
      completed: false 
    },
    { 
      id: '4', 
      type: 'POST', 
      title: 'Tahsilatların Kasaya İşlenmesi', 
      description: 'Tahsil edilen tutarları ilgili kasaya ivedilikle kaydedin.',
      completed: false 
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleCloseDay = () => {
    const incomplete = tasks.filter(t => !t.completed);
    if (incomplete.length > 0) {
      ElectronService.showAlert({ 
        message: 'Dikkat! Tamamlanmamış görevleriniz var. Günü kapatmadan önce tüm resmi adımları tamamlayın.', 
        type: 'warning' 
      });
      return;
    }
    
    ElectronService.showAlert({ 
      message: 'GÜN SONU İŞLEMLERİ TAMAMLANDI: Tüm kayıtlar yedeklendi ve tescil edildi. Güvenle çıkış yapabilirsiniz.', 
      type: 'success' 
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-col gap-6 bg-slate-50/50 dark:bg-white/5">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                  <Zap className="text-blue-500" size={24} /> GÜNLÜK OPERASYON REHBERİ
               </h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">GÜNEYURT KURUMSİ KURUMSAL DİSİPLİN KILAVUZU</p>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{progressPercent}% TAMAMLANDI</span>
               <div className="w-32 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-primary-500"
                  />
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
         {/* 🌅 DAĞITIM ÖNCESİ */}
         <div className="space-y-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">--- DAĞITIM ÖNCESİ (HAZIRLIK) ---</span>
            {tasks.filter(t => t.type === 'PRE').map(task => (
               <motion.div 
                 key={task.id}
                 onClick={() => toggleTask(task.id)}
                 className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${task.completed ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-primary-500'}`}
               >
                  {task.completed ? <CheckCircle2 className="text-emerald-500 mt-1" size={20} /> : <Circle className="text-slate-300 mt-1" size={20} />}
                  <div>
                     <h4 className={`text-sm font-black uppercase tracking-tighter ${task.completed ? 'text-emerald-700 line-through' : 'text-slate-700 dark:text-white'}`}>{task.title}</h4>
                     <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium italic">{task.description}</p>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* 🌇 DAĞITIM SONRASI */}
         <div className="space-y-3 pt-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">--- DAĞITIM SONRASI (KAYIT) ---</span>
            {tasks.filter(t => t.type === 'POST').map(task => (
               <motion.div 
                 key={task.id}
                 onClick={() => toggleTask(task.id)}
                 className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${task.completed ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-primary-500'}`}
               >
                  {task.completed ? <CheckCircle2 className="text-emerald-500 mt-1" size={20} /> : <Circle className="text-slate-300 mt-1" size={20} />}
                  <div>
                     <h4 className={`text-sm font-black uppercase tracking-tighter ${task.completed ? 'text-emerald-700 line-through' : 'text-slate-700 dark:text-white'}`}>{task.title}</h4>
                     <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium italic">{task.description}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/* 🌑 GÜNÜ KAPAT BUTONU */}
      <div className="p-8 bg-slate-900 space-y-4">
         <div className="flex items-start gap-3 text-blue-500 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <p className="text-[9px] font-bold uppercase leading-relaxed">
               UYARI: Günü resmi prosedür çerçevesinde kapatmadan uygulamayı kapatmanızı önermiyoruz. Eksik kayıtlar yarın için mali risk taşır!
            </p>
         </div>
         <button 
           onClick={handleCloseDay}
           className="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3 group"
         >
            <Sunset size={20} className="group-hover:rotate-12 transition-transform" /> GÜNÜ RESMİ OLARAK KAPAT
         </button>
      </div>
    </div>
  );
};
