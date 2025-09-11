

import React, { useState, useMemo, useEffect } from 'react';
import { XIcon } from './icons';
import { Apartado, CreditCard, DebitCard } from '../types';

interface NewApartadoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (apartado: Omit<Apartado, 'id'> | Apartado) => void;
    existingApartado?: Apartado | null;
    grossProfit: number;
    availableProfit: number;
    creditCards: CreditCard[];
    debitCards: DebitCard[];
}

const NewApartadoModal: React.FC<NewApartadoModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    existingApartado, 
    grossProfit, 
    availableProfit, 
    creditCards, 
    debitCards 
}) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState('');
    const [destination, setDestination] = useState('cash');

    const isEditing = !!existingApartado;

    useEffect(() => {
        if (isOpen) {
            if (existingApartado) {
                setName(existingApartado.name);
                setPercentage(String(existingApartado.percentage));
                const dest = existingApartado.destinationId 
                    ? `${existingApartado.destinationType}-${existingApartado.destinationId}` 
                    : 'cash';
                setDestination(dest);
            } else {
                // reset form for new
                setName('');
                setPercentage('');
                setDestination('cash');
            }
        }
    }, [existingApartado, isOpen]);


    if (!isOpen) return null;
    
    const handleSave = () => {
        const percentageValue = parseFloat(percentage);
        if (!name || isNaN(percentageValue) || percentageValue <= 0) {
            alert('Por favor, complete el nombre y un porcentaje válido.');
            return;
        }

        const destinationParts = destination.split('-');
        const destinationType = destinationParts[0];
        const destinationId = destinationParts.length > 1 ? destinationParts.slice(1).join('-') : undefined;


        const data: Omit<Apartado, 'id'> | Apartado = {
            ...(existingApartado ? { id: existingApartado.id } : {}),
            name,
            percentage: percentageValue,
            destinationType: destinationType as 'cash' | 'debit' | 'credit',
            destinationId
        };
        onSave(data);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEditing ? 'Editar' : 'Nuevo'} Apartado</h2>
                    <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                        <p className="text-sm text-green-700 dark:text-green-300">Disponible para apartar: <span className="font-bold">${availableProfit.toFixed(2)}</span> ({100 * availableProfit/grossProfit || 100} % de la ganancia bruta)</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Nombre del Apartado *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Ahorro Emergencias, Impuestos, etc." className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Porcentaje de Asignación *</label>
                         <div className="relative mt-1">
                           <input 
                                type="number" 
                                value={percentage} 
                                onChange={e => setPercentage(e.target.value)} 
                                placeholder="0" 
                                className="w-full p-2 pr-8 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Destino del Apartado</label>
                        <select value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md">
                            <option value="cash">Efectivo (Apartado en efectivo)</option>
                            <optgroup label="Tarjetas de Débito">
                                {debitCards.map(d => <option key={d.id} value={`debit-${d.id}`}>{d.nickname || d.bank} - **** {d.number}</option>)}
                            </optgroup>
                            <optgroup label="Tarjetas de Crédito (Pago)">
                                 {creditCards.map(c => <option key={c.id} value={`credit-${c.id}`}>{c.nickname || c.bank} - **** {c.number}</option>)}
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSave} className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold">
                       {isEditing ? 'Guardar Cambios' : 'Crear Apartado'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewApartadoModal;