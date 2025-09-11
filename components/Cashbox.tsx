

import React, { useState, useMemo, useCallback } from 'react';
import { CashFlowTransaction } from '../types';
import { DeleteIcon } from './icons';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface CashboxProps {
    cashFlow: CashFlowTransaction[];
    removeTransaction: (id: string) => void;
    onOpenCloseModal: () => void;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};


const Cashbox: React.FC<CashboxProps> = ({ cashFlow, removeTransaction, onOpenCloseModal }) => {
    const [transactionToDelete, setTransactionToDelete] = useState<CashFlowTransaction | null>(null);
    
    const dailyTransactions = useMemo(() => {
        const today = new Date();
        const todaysFlow = cashFlow.filter(t => isSameDay(new Date(t.date), today));
        
        const lastOpeningIndex = todaysFlow.map(t => t.type).lastIndexOf('Apertura');
        
        if (lastOpeningIndex !== -1) {
            return todaysFlow.slice(lastOpeningIndex);
        }
        
        return todaysFlow;
    }, [cashFlow]);

    const stats = useMemo(() => {
        const income = dailyTransactions.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
        const outcome = dailyTransactions.filter(t => t.type === 'Salida').reduce((sum, t) => sum + t.amount, 0);
        const opening = dailyTransactions.find(t => t.type === 'Apertura')?.amount || 0;
        const balance = opening + income - outcome;
        return { income, outcome, balance };
    }, [dailyTransactions]);

    const handleDeleteClick = useCallback((transaction: CashFlowTransaction) => {
        if(transaction.type === 'Apertura' || transaction.type === 'Cierre') return;
        setTransactionToDelete(transaction);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if(transactionToDelete) {
            removeTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
    }, [transactionToDelete, removeTransaction]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Flujo de Caja del Día</h1>
                <button
                    onClick={onOpenCloseModal}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                    Corte de Caja
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">Ingresos Operativos</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">${stats.income.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">Salidas Operativas</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">${stats.outcome.toFixed(2)}</p>
                </div>
                 <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">Balance Operativo</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">${stats.balance.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                {['Fecha', 'Tipo', 'Descripción', 'Cliente', 'Método Pago', 'Monto', 'Acciones'].map(h =>
                                    <th key={h} className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {dailyTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.type === 'Ingreso' || t.type === 'Apertura' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">{t.description}</td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{t.client || 'N/A'}</td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{t.paymentMethod}</td>
                                    <td className={`p-4 font-bold ${t.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>${t.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleDeleteClick(t)} disabled={t.type === 'Apertura' || t.type === 'Cierre'} className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {transactionToDelete && (
                 <ConfirmDeleteModal 
                    isOpen={!!transactionToDelete}
                    onClose={() => setTransactionToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    itemName={transactionToDelete.description}
                 />
            )}
        </div>
    );
};

export default Cashbox;