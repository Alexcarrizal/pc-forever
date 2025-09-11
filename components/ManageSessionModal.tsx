import React, { useState, useEffect, useMemo } from 'react';
import { Module, RateType, CartItem, SessionType, RateTier } from '../types';
import { XIcon, ClockIcon, ShoppingCartIcon } from './icons';

interface ManageSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  rate?: RateType;
  onAddProduct: () => void;
  onFinalizeSession: (module: Module, totalCost: number) => void;
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


const ManageSessionModal: React.FC<ManageSessionModalProps> = ({ isOpen, onClose, module, rate, onAddProduct, onFinalizeSession }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    let interval: number | null = null;
    if (isOpen && module.startTime) {
       const update = () => {
         const now = Date.now();
         const start = module.startTime!;
         const elapsed = Math.floor((now - start) / 1000);
         setElapsedTime(elapsed);

         if ((module.sessionType === SessionType.Fixed || module.sessionType === SessionType.Redeem) && module.endTime) {
            const remaining = Math.max(0, Math.floor((module.endTime - now) / 1000));
            setDisplayTime(remaining);
         } else {
            setDisplayTime(elapsed);
         }
       };
       update();
       interval = setInterval(update, 1000);
    }
    return () => {
      if(interval) clearInterval(interval);
    }
  }, [isOpen, module.startTime, module.endTime, module.sessionType]);
  
  const timeCost = useMemo(() => {
    if (module.sessionType === SessionType.Fixed || module.sessionType === SessionType.Redeem) {
        return module.fixedTimeCost ?? 0;
    }
    return calculateCost(elapsedTime, rate);
  }, [module.sessionType, module.fixedTimeCost, elapsedTime, rate]);

  const productsCost = useMemo(() => module.accountProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0), [module.accountProducts]);
  const totalCost = timeCost + productsCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestionar: {module.name}</h2>
          <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
        </div>

        <div className="p-6 space-y-4">
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Resumen</h3>
                <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-slate-500" />
                    <span>{(module.sessionType === SessionType.Fixed || module.sessionType === SessionType.Redeem) ? 'Tiempo restante:' : 'Tiempo:'}</span>
                    <span className="font-mono ml-auto">{formatTime(displayTime)}</span>
                </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg min-h-[80px]">
                <h3 className="font-semibold text-sm mb-2">Productos en la Cuenta</h3>
                 {module.accountProducts.length > 0 ? (
                    <ul className="text-sm space-y-1">
                    {module.accountProducts.map(p => (
                        <li key={p.id} className="flex justify-between">
                            <span>{p.quantity}x {p.name}</span>
                            <span>${(p.price * p.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">No hay productos agregados.</p>
                )}
            </div>
             <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">COSTO TOTAL</p>
                <p className="text-4xl font-bold text-blue-800 dark:text-blue-200">${totalCost.toFixed(2)}</p>
            </div>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-3">
            <button onClick={onAddProduct} className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                <ShoppingCartIcon className="w-8 h-8 mb-1"/>
                Agregar Producto
            </button>
             <button onClick={() => onFinalizeSession(module, totalCost)} className="flex flex-col items-center justify-center p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">
                Finalizar Sesión
            </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSessionModal;