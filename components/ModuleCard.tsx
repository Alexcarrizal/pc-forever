import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Module, ModuleStatus, ModuleType, RateType, RateTier, SessionType } from '../types';
import { ComputerIcon, ShoppingCartIcon, ClockIcon, DeleteIcon, EditIcon, ConsoleIcon, PlusIcon } from './icons';

interface ModuleCardProps {
  module: Module;
  rate?: RateType;
  onStartSession: (module: Module) => void;
  onManageSession: (module: Module) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddProduct: (module: Module) => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const calculateCost = (seconds: number, rate?: RateType): number => {
    if (!rate || seconds <= 0) return 0;

    const minutes = seconds / 60;

    let applicableTier: RateTier | undefined;
    
    const sortedTiers = [...rate.tiers].sort((a, b) => a.from - b.from);

    for (const tier of sortedTiers) {
        if (minutes >= tier.from) {
            applicableTier = tier;
        } else {
            break; 
        }
    }

    if (applicableTier) {
        if (minutes > 60) {
            const oneHourTier = sortedTiers.find(t => t.to === 60);
            if (oneHourTier) {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                
                let remainingCost = 0;
                for (const tier of sortedTiers) {
                    if (remainingMinutes >= tier.from) {
                        remainingCost = tier.price;
                    } else {
                        break; 
                    }
                }
                return (hours * oneHourTier.price) + remainingCost;
            }
        }
        return applicableTier.price;
    }

    return 0;
};


const ModuleCard: React.FC<ModuleCardProps> = ({ module, rate, onStartSession, onManageSession, onEdit, onDelete, onAddProduct }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!alarmSoundRef.current) {
        alarmSoundRef.current = new Audio('https://www.soundjay.com/buttons/beep-07a.mp3');
        alarmSoundRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (module.status === ModuleStatus.Occupied && module.startTime) {
      
      if (elapsedTime === 0) { // Reset on new session start
        setIsTimeUp(false);
      }

      const updateTimes = () => {
        const now = Date.now();
        const start = module.startTime!;
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);

        if ((module.sessionType === SessionType.Fixed || module.sessionType === SessionType.Redeem) && module.endTime) {
            const remaining = Math.max(0, Math.floor((module.endTime - now) / 1000));
            setDisplayTime(remaining);
            
            if (remaining <= 0 && !isTimeUp) {
                setIsTimeUp(true);
                alarmSoundRef.current?.play().catch(e => console.error("Error playing sound:", e));
            }
        } else {
            setDisplayTime(elapsed);
        }
      };

      updateTimes();
      interval = setInterval(updateTimes, 1000);

    } else {
      setElapsedTime(0);
      setDisplayTime(0);
      setIsTimeUp(false);
      alarmSoundRef.current?.pause();
      if (alarmSoundRef.current) {
        alarmSoundRef.current.currentTime = 0;
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [module.status, module.startTime, module.endTime, module.sessionType, isTimeUp, elapsedTime]);

  const timeCost = useMemo(() => {
    if (module.sessionType === SessionType.Fixed || module.sessionType === SessionType.Redeem) {
        return module.fixedTimeCost ?? 0;
    }
    return calculateCost(elapsedTime, rate);
  }, [module.sessionType, module.fixedTimeCost, elapsedTime, rate]);
  
  const productsCost = useMemo(() => module.accountProducts.reduce((sum, p) => sum + p.price * p.quantity, 0), [module.accountProducts]);
  const totalCost = timeCost + productsCost;
    
  const isOccupied = module.status === ModuleStatus.Occupied;

  const typeStyles = {
    [ModuleType.PC]: {
      occupied: 'bg-cyan-500/10 dark:bg-cyan-900/40 border-cyan-500 animate-pulse-glow-cyan',
      pill: 'bg-cyan-500 text-white',
      icon: 'text-cyan-500',
    },
    [ModuleType.Console]: {
      occupied: 'bg-purple-500/10 dark:bg-purple-900/40 border-purple-500 animate-pulse-glow-purple',
      pill: 'bg-purple-500 text-white',
      icon: 'text-purple-500',
    },
  };

  const currentStyles = typeStyles[module.type] || typeStyles[ModuleType.PC];

  const cardClasses = `rounded-xl flex flex-col transition-all duration-300 border-2 overflow-hidden shadow-lg h-64 ${
    isOccupied
      ? isTimeUp 
        ? 'bg-red-500/10 dark:bg-red-900/40 border-red-500 animate-pulse-red' 
        : currentStyles.occupied
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  }`;

  const statusPillClasses = `px-3 py-1 text-xs font-bold rounded-full ${
    isTimeUp
    ? 'bg-red-500 text-white'
    : isOccupied
      ? currentStyles.pill
      : 'bg-green-500/20 text-green-700 dark:text-green-300'
  }`;
  
  const IconComponent = module.type === ModuleType.Console ? ConsoleIcon : ComputerIcon;

  const mainAction = () => isOccupied ? onManageSession(module) : onStartSession(module);

  return (
    <div className={cardClasses}>
      <button 
        onClick={mainAction} 
        className="flex-grow p-4 w-full text-left flex flex-col hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        aria-label={`Gestionar ${module.name}`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-6 h-6 ${isOccupied ? currentStyles.icon : 'text-slate-400'}`} />
            <span className="font-bold text-lg text-slate-800 dark:text-white">{module.name}</span>
          </div>
          <span className={statusPillClasses}>{isTimeUp ? 'TIEMPO AGOTADO' : module.status}</span>
        </div>
  
        <div className="flex-grow my-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{(module.sessionType === SessionType.Fixed || module.sessionType === SessionType.Redeem) ? 'Tiempo restante:' : 'Tiempo:'}</span>
            <span className="font-mono ml-auto text-slate-800 dark:text-white">{formatTime(displayTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-lg text-slate-800 dark:text-white">$</span>
            <span className="ml-1">Costo Total:</span>
            <span className="font-mono ml-auto font-bold text-slate-800 dark:text-white">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center">
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            <span>Productos:</span>
            <span className="font-mono ml-auto text-slate-800 dark:text-white">{module.accountProducts.length} producto(s)</span>
          </div>
        </div>
      </button>

      <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {isOccupied ? (
            <button
                onClick={() => onAddProduct(module)}
                className="w-full flex items-center justify-center gap-2 p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors font-semibold"
                aria-label={`Agregar producto a ${module.name}`}
            >
                <PlusIcon className="w-4 h-4" />
                <span>Agregar Producto</span>
            </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 p-2 bg-slate-200 dark:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors font-semibold"
              aria-label={`Editar ${module.name}`}
            >
              <EditIcon className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-2 p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors font-semibold"
              aria-label={`Eliminar ${module.name}`}
            >
              <DeleteIcon className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
