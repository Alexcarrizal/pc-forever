import React, { useState } from 'react';
import { RateType, RateTier } from '../types';
import { XIcon, DeleteIcon, PlusIcon } from './icons';

interface RatesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: RateType[];
  setRates: React.Dispatch<React.SetStateAction<RateType[]>>;
}

const RatesConfigModal: React.FC<RatesConfigModalProps> = ({ isOpen, onClose, rates, setRates }) => {
  const [localRates, setLocalRates] = useState<RateType[]>(JSON.parse(JSON.stringify(rates)));

  if (!isOpen) return null;

  const handleSave = () => {
    setRates(localRates);
    onClose();
  };
  
  const addRateType = () => {
    const newName = prompt("Nombre del nuevo tipo de tarifa (ej. VIP):");
    if(newName){
      setLocalRates(prev => [...prev, { id: `rate-${Date.now()}`, name: newName, tiers: [] }]);
    }
  };

  const updateRateTypeName = (rateId: string, newName: string) => {
    setLocalRates(prev => prev.map(r => r.id === rateId ? { ...r, name: newName } : r));
  };
  
  const deleteRateType = (rateId: string) => {
    if(window.confirm("¿Seguro que quieres eliminar este tipo de tarifa?")){
      setLocalRates(prev => prev.filter(r => r.id !== rateId));
    }
  };

  const addTier = (rateId: string) => {
    setLocalRates(prev => prev.map(r => 
      r.id === rateId 
        ? { ...r, tiers: [...r.tiers, { id: `tier-${Date.now()}-${Math.random()}`, from: 0, to: 0, price: 0 }] } 
        : r
    ));
  };

  const updateTier = (rateId: string, tierId: string, field: keyof Omit<RateTier, 'id'>, value: number) => {
    setLocalRates(prev => prev.map(r => 
      r.id === rateId 
        ? { ...r, tiers: r.tiers.map(t => t.id === tierId ? { ...t, [field]: value } : t) } 
        : r
    ));
  };
  
  const deleteTier = (rateId: string, tierId: string) => {
    setLocalRates(prev => prev.map(r => 
      r.id === rateId 
        ? { ...r, tiers: r.tiers.filter(t => t.id !== tierId) } 
        : r
    ));
  };

  const handleAutocompleteHours = (rateId: string) => {
    const rate = localRates.find(r => r.id === rateId);
    if (!rate) return;
    
    const oneHourTier = rate.tiers.find(t => t.to === 60);
    if (!oneHourTier) {
        alert("Primero debe definir una tarifa para 60 minutos.");
        return;
    }

    const pricePerHour = oneHourTier.price;
    let newTiers = [...rate.tiers];

    for (let i = 2; i <= 8; i++) {
        const minutes = i * 60;
        const fromMinutes = (i-1) * 60 + 1;
        const existingTier = newTiers.find(t => t.to === minutes);
        if (!existingTier) {
            newTiers.push({
                id: `tier-${Date.now()}-${Math.random()}`,
                from: fromMinutes,
                to: minutes,
                price: pricePerHour * i
            });
        }
    }
    
    newTiers.sort((a,b) => a.to - b.to);

    setLocalRates(prev => prev.map(r => r.id === rateId ? { ...r, tiers: newTiers } : r));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Configuración de Tarifas</h2>
          <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {localRates.map(rate => (
            <div key={rate.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <input 
                  type="text" 
                  value={rate.name}
                  onChange={(e) => updateRateTypeName(rate.id, e.target.value)}
                  className="font-bold text-lg bg-transparent focus:outline-none focus:bg-white dark:focus:bg-slate-600 rounded px-2"
                />
                <button onClick={() => deleteRateType(rate.id)} className="text-slate-400 hover:text-red-500"><DeleteIcon /></button>
              </div>
              <div className="space-y-2">
                {rate.tiers.map(tier => (
                  <div key={tier.id} className="grid grid-cols-8 gap-2 items-center">
                    <input type="number" value={tier.from} onChange={e => updateTier(rate.id, tier.id, 'from', parseInt(e.target.value))} className="col-span-2 p-1 bg-white dark:bg-slate-600 rounded-md text-center" placeholder="De (min)" />
                    <input type="number" value={tier.to} onChange={e => updateTier(rate.id, tier.id, 'to', parseInt(e.target.value))} className="col-span-2 p-1 bg-white dark:bg-slate-600 rounded-md text-center" placeholder="A (min)"/>
                    <div className="col-span-3 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input type="number" value={tier.price} onChange={e => updateTier(rate.id, tier.id, 'price', parseFloat(e.target.value))} className="w-full p-1 pl-5 bg-white dark:bg-slate-600 rounded-md text-center" placeholder="Precio"/>
                    </div>
                    <button onClick={() => deleteTier(rate.id, tier.id)} className="text-red-400 hover:text-red-600"><DeleteIcon className="w-5 h-5 mx-auto"/></button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                 <button onClick={() => addTier(rate.id)} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600">+ Agregar Rango</button>
                 <button onClick={() => handleAutocompleteHours(rate.id)} className="w-full py-2 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg text-sm text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50">Autocompletar Horas</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-between items-center">
          <button onClick={addRateType} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <PlusIcon /> Agregar Tipo de Tarifa
          </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatesConfigModal;
