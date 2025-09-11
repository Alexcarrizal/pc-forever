

import React from 'react';
import { CreditCard } from '../types';
import { EditIcon, DeleteIcon, PlusCircleIcon, MinusCircleIcon } from './icons';

interface CreditCardDisplayProps {
    card: CreditCard;
    onEdit: () => void;
    onDelete: () => void;
    onTransaction: (type: 'credit-purchase' | 'credit-payment') => void;
}

const CreditCardDisplay: React.FC<CreditCardDisplayProps> = ({ card, onEdit, onDelete, onTransaction }) => {
    const available = card.limit - card.balance;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getNextPaymentDueDate = (card: CreditCard): Date => {
        const year = today.getFullYear();
        const month = today.getMonth();
        let candidateDate = new Date(year, month, card.paymentDueDay);
        if (candidateDate < today) {
            candidateDate.setMonth(candidateDate.getMonth() + 1);
        }
        if (card.balance === 0) {
            const paymentDateThisMonth = new Date(year, month, card.paymentDueDay);
            if (candidateDate.getTime() === paymentDateThisMonth.getTime()) {
                candidateDate.setMonth(candidateDate.getMonth() + 1);
            }
        }
        return candidateDate;
    };

    const nextPaymentDueDate = getNextPaymentDueDate(card);

    const lastCutoffDate = new Date(nextPaymentDueDate);
    lastCutoffDate.setMonth(lastCutoffDate.getMonth() - 1);
    lastCutoffDate.setDate(card.cutOffDay);

    const daysRemainingToPay = Math.ceil((nextPaymentDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const totalPaymentPeriodDays = Math.round((nextPaymentDueDate.getTime() - lastCutoffDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedPaymentPeriodDays = Math.max(0, Math.floor((today.getTime() - lastCutoffDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const progressPercentage = totalPaymentPeriodDays > 0 ? (elapsedPaymentPeriodDays / totalPaymentPeriodDays) * 100 : 0;
    
    const needsAttention = daysRemainingToPay <= 5 && daysRemainingToPay >= 0 && card.balance > 0;

    const containerClasses = `bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600/50 flex flex-col justify-between h-full ${needsAttention ? 'animate-pulse-red' : ''}`;

    const daysRemainingText = () => {
        if (card.balance === 0) return 'Pagado';
        if (daysRemainingToPay > 1) return `${daysRemainingToPay} días`;
        if (daysRemainingToPay === 1) return 'Mañana';
        if (daysRemainingToPay === 0) return 'Hoy';
        return `Venció hace ${Math.abs(daysRemainingToPay)} días`;
    };

    return (
        <div className={containerClasses}>
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-slate-800 dark:text-white">{card.nickname || card.bank}</p>
                        <p className="font-mono text-slate-500 dark:text-slate-400">{`**** **** **** ${card.number}`}</p>
                    </div>
                    <div className="flex gap-3 text-slate-400">
                        <button onClick={onEdit} className="hover:text-blue-500"><EditIcon /></button>
                        <button onClick={onDelete} className="hover:text-red-500"><DeleteIcon /></button>
                    </div>
                </div>

                <div className="text-sm space-y-1 text-slate-600 dark:text-slate-300 my-4">
                    <div className="flex justify-between"><span>Límite:</span> <span className="font-semibold text-slate-800 dark:text-white">${card.limit.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Saldo actual:</span> <span className="font-semibold text-slate-800 dark:text-white">${card.balance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Disponible:</span> <span className="font-semibold text-green-600 dark:text-green-400">${available.toLocaleString()}</span></div>
                </div>

                <div className="mt-2">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Límite de pago:</span>
                        <span className={`font-bold ${needsAttention ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                           {daysRemainingText()}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                        <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                       Vence el {nextPaymentDueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                    onClick={() => onTransaction('credit-purchase')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5"/>
                    <span>Compra</span>
                </button>
                <button 
                    onClick={() => onTransaction('credit-payment')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors"
                >
                     <MinusCircleIcon className="w-5 h-5"/>
                    <span>Pagar</span>
                </button>
            </div>
        </div>
    );
};

export default CreditCardDisplay;