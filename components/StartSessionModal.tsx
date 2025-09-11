import React, { useState, useEffect, useMemo } from 'react';
import { Module, Client, SessionType, RateType, RateTier } from '../types';
import { XIcon, ClockIcon, PlayIcon, PlusIcon, StarIcon, GiftIcon, DollarIcon } from './icons';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  clients: Client[];
  rates: RateType[];
  onStart: (clientId: string | null, sessionType: SessionType, prepaidTime?: any) => void;
  onAddNewClient: () => void;
}

const calculateFixedTimeCost = (minutes: number, rate?: RateType): number => {
    if (!rate || minutes <= 0) return 0;

    const sortedTiers = [...rate.tiers].sort((a, b) => a.from - b.from);

    if (minutes > 60) {
        const oneHourTier = sortedTiers.find(t => t.to === 60);
        if (oneHourTier) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return hours * oneHourTier.price;
            }

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

    let applicableTier: RateTier | undefined;
    for (const tier of sortedTiers) {
        if (minutes >= tier.from) {
            applicableTier = tier;
        } else {
            break;
        }
    }

    return applicableTier ? applicableTier.price : 0;
};


const StartSessionModal: React.FC<StartSessionModalProps> = ({ isOpen, onClose, module, clients, rates, onStart, onAddNewClient }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useState<string>('c0');
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.Free);
  const [redeemHours, setRedeemHours] = useState(1);
  const [prepaidTime, setPrepaidTime] = useState(60);

  const prepaidCost = useMemo(() => {
    if (sessionType !== SessionType.Fixed) return 0;
    const rate = rates.find(r => r.id === module.rateId);
    return calculateFixedTimeCost(prepaidTime, rate);
  }, [prepaidTime, sessionType, module.rateId, rates]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const availableFreeHours = selectedClient ? Math.floor(selectedClient.points / 10) : 0;
  
  const handleStart = () => {
    let details: any = undefined;
    if (sessionType === SessionType.Fixed) {
        details = prepaidTime;
    } else if (sessionType === SessionType.Redeem) {
        details = redeemHours;
    }
    onStart(selectedClientId, sessionType, details);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
                <PlayIcon className="w-8 h-8"/>
                <div>
                    <h2 className="text-xl font-bold">Iniciar Sesión</h2>
                    <p className="text-sm opacity-80">{module.name} - {module.type}</p>
                </div>
            </div>
            <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-800 dark:text-blue-300">Hora de Entrada</p>
                <p className="text-3xl font-bold my-1 text-blue-800 dark:text-blue-200">{currentTime.toLocaleTimeString('es-ES')}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div>
                <label className="text-sm font-medium">Cliente (Opcional)</label>
                <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-600">
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `- ${c.phone}` : ''} ({c.points} puntos)</option>)}
                </select>
                <button onClick={onAddNewClient} className="mt-2 w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <PlusIcon className="w-4 h-4" /> Registrar Nuevo Cliente
                </button>
            </div>
            
            {selectedClient && selectedClient.points > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2"><StarIcon className="w-5 h-5"/> Puntos de Lealtad</h3>
                <div className="flex justify-between mt-2">
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">Puntos actuales:</span>
                    <span className="font-bold text-yellow-800 dark:text-yellow-200">{selectedClient.points}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">Horas gratis disponibles:</span>
                    <span className="font-bold text-yellow-800 dark:text-yellow-200">{availableFreeHours}</span>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 border-t border-yellow-200 dark:border-yellow-800 pt-2">1 punto por cada hora consumida • 10 puntos = 1 hora gratis</p>
              </div>
            )}

            <div>
                 <label className="text-sm font-medium">Tipo de Sesión</label>
                 <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                     <button onClick={() => setSessionType(SessionType.Free)} className={`p-3 rounded-lg border-2 text-left ${sessionType === SessionType.Free ? 'border-blue-500 bg-blue-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                        <ClockIcon className="w-6 h-6 mb-1"/>
                        <p className="font-bold">Tiempo Libre</p>
                        <p className="text-xs text-slate-500">Cronómetro ascendente</p>
                     </button>
                    <button onClick={() => setSessionType(SessionType.Fixed)} className={`p-3 rounded-lg border-2 text-left ${sessionType === SessionType.Fixed ? 'border-purple-500 bg-purple-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                        <DollarIcon className="w-6 h-6 mb-1"/>
                        <p className="font-bold">Tiempo Fijo</p>
                        <p className="text-xs text-slate-500">Cuenta regresiva</p>
                    </button>
                    { availableFreeHours > 0 ? (
                       <button onClick={() => setSessionType(SessionType.Redeem)} className={`p-3 rounded-lg border-2 text-left ${sessionType === SessionType.Redeem ? 'border-green-500 bg-green-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                            <GiftIcon className="w-6 h-6 mb-1"/>
                            <p className="font-bold">Horas Gratis</p>
                            <p className="text-xs text-slate-500">Canjear puntos de lealtad</p>
                        </button>
                    ) : (
                       <button disabled className="p-3 rounded-lg border-2 text-left border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-50 cursor-not-allowed">
                            <GiftIcon className="w-6 h-6 mb-1"/>
                            <p className="font-bold">Horas Gratis</p>
                            <p className="text-xs text-slate-500">No hay puntos suficientes</p>
                        </button>
                    )}
                 </div>
            </div>
            
            {sessionType === SessionType.Fixed && (
                <div className="bg-purple-50 dark:bg-purple-900/50 p-4 rounded-lg space-y-3">
                    <div>
                        <label htmlFor="prepaid-time" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiempo Prepagado</label>
                        <select id="prepaid-time" value={prepaidTime} onChange={e => setPrepaidTime(parseInt(e.target.value))} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-600">
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1 hora y 30 minutos</option>
                            <option value={120}>2 horas</option>
                            <option value={180}>3 horas</option>
                            <option value={240}>4 horas</option>
                        </select>
                    </div>
                    <div className="pt-2 border-t border-purple-200 dark:border-purple-800 font-bold flex justify-between">
                        <span>Total a cobrar:</span>
                        <span className="text-purple-600 dark:text-purple-300">${prepaidCost.toFixed(2)}</span>
                    </div>
                </div>
            )}


            {sessionType === SessionType.Redeem && availableFreeHours > 0 && (
                <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
                    <label className="text-sm font-medium">Horas Gratis a Canjear</label>
                    <select value={redeemHours} onChange={e => setRedeemHours(parseInt(e.target.value))} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md">
                        {Array.from({length: availableFreeHours}, (_, i) => i + 1).map(h => (
                            <option key={h} value={h}>{h} hora{h>1?'s':''} ({h*10} puntos)</option>
                        ))}
                    </select>
                    <div className="mt-2 text-sm space-y-1">
                        <div className="flex justify-between"><span>Puntos a usar:</span><span>{redeemHours*10}</span></div>
                        <div className="flex justify-between"><span>Puntos restantes:</span><span>{selectedClient.points - redeemHours*10}</span></div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 font-bold flex justify-between">
                        <span>Total a cobrar:</span>
                        <span>$0.00 (GRATIS)</span>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancelar</button>
          <button onClick={handleStart} className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center gap-2"><PlayIcon className="w-5 h-5"/> Iniciar Sesión</button>
        </div>
      </div>
    </div>
  );
};

export default StartSessionModal;