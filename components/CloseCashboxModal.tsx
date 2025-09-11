

import React, { useState, useMemo, useEffect } from 'react';
import { XIcon, WarningIcon } from './icons';

interface CloseCashboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmClose: (countedAmount: number) => void;
    systemBalance: number | null;
}

const denominations = [
    { value: 500, type: 'bill' },
    { value: 200, type: 'bill' },
    { value: 100, type: 'bill' },
    { value: 50, type: 'bill' },
    { value: 20, type: 'bill' },
    { value: 10, type: 'coin' },
    { value: 5, type: 'coin' },
    { value: 2, type: 'coin' },
    { value: 1, type: 'coin' },
    { value: 0.5, type: 'coin' },
];

const CloseCashboxModal: React.FC<CloseCashboxModalProps> = ({ isOpen, onClose, onConfirmClose, systemBalance }) => {
    const [counts, setCounts] = useState<Record<number, number>>({});

    useEffect(() => {
        if (!isOpen) {
            setCounts({});
        }
    }, [isOpen]);

    const countedTotal = useMemo(() => {
        return denominations.reduce((total, den) => {
            return total + (counts[den.value] || 0) * den.value;
        }, 0);
    }, [counts]);

    const difference = useMemo(() => {
        if (systemBalance === null) return 0;
        return countedTotal - systemBalance;
    }, [countedTotal, systemBalance]);

    if (!isOpen || systemBalance === null) return null;

    const handleCountChange = (value: number, count: string) => {
        const newCount = parseInt(count, 10);
        setCounts(prev => ({
            ...prev,
            [value]: isNaN(newCount) ? 0 : newCount,
        }));
    };
    
    const differenceColor = difference === 0 
        ? 'text-green-500' 
        : difference > 0 
        ? 'text-yellow-500' 
        : 'text-red-500';
    
    const differenceText = difference === 0 
        ? 'Cuadra' 
        : difference > 0 
        ? `Sobrante de $${difference.toFixed(2)}` 
        : `Faltante de $${Math.abs(difference).toFixed(2)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="close-cashbox-title">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="close-cashbox-title" className="text-xl font-bold flex items-center gap-2"><WarningIcon className="text-yellow-500 w-6 h-6"/> Confirmar Corte de Caja</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" aria-label="Cerrar modal"><XIcon className="h-6 w-6"/></button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left side: Counter */}
                        <div>
                            <h3 className="font-bold mb-4">Conteo de Efectivo</h3>
                            <div className="space-y-2">
                                {denominations.map(den => (
                                    <div key={den.value} className="grid grid-cols-3 gap-2 items-center">
                                        <label className="text-right pr-2 text-slate-600 dark:text-slate-400">{den.type === 'bill' ? 'Billete' : 'Moneda'} de ${den.value}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[den.value] || ''}
                                                onChange={e => handleCountChange(den.value, e.target.value)}
                                                className="w-full text-center p-1 bg-slate-100 dark:bg-slate-700 rounded-md"
                                            />
                                            <span className="text-slate-500">x</span>
                                        </div>
                                        <span className="font-mono text-right">= ${( (counts[den.value] || 0) * den.value ).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side: Summary */}
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">BALANCE ESPERADO (SISTEMA)</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">${systemBalance.toFixed(2)}</p>
                            </div>
                             <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">TOTAL CONTADO EN CAJA</p>
                                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">${countedTotal.toFixed(2)}</p>
                            </div>
                             <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">DIFERENCIA</p>
                                <p className={`text-3xl font-bold ${differenceColor}`}>{differenceText}</p>
                            </div>
                        </div>
                   </div>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
                    <button onClick={() => onConfirmClose(countedTotal)} className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-lg hover:shadow-xl shadow-red-500/30">Confirmar Cierre</button>
                </div>
            </div>
        </div>
    );
};

export default CloseCashboxModal;