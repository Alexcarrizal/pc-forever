
import React from 'react';
import { DebitCard } from '../types';
import { EditIcon, DeleteIcon, MinusCircleIcon, PlusCircleIcon } from './icons';

interface DebitCardDisplayProps {
    card: DebitCard;
    onEdit: () => void;
    onDelete: () => void;
    onTransaction: (type: 'debit-purchase' | 'debit-deposit') => void;
}

const DebitCardDisplay: React.FC<DebitCardDisplayProps> = ({ card, onEdit, onDelete, onTransaction }) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600/50 flex flex-col justify-between">
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
                    <div className="flex justify-between"><span>Tipo:</span> <span className="font-semibold text-slate-800 dark:text-white">{card.accountType}</span></div>
                    <div className="flex justify-between items-baseline">
                        <span>Saldo:</span> 
                        <span className="font-bold text-xl text-green-600 dark:text-green-400">${card.balance.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                    onClick={() => onTransaction('debit-purchase')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                >
                    <MinusCircleIcon className="w-5 h-5"/>
                    <span>Compra</span>
                </button>
                <button 
                    onClick={() => onTransaction('debit-deposit')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors"
                >
                     <PlusCircleIcon className="w-5 h-5"/>
                    <span>Depósito</span>
                </button>
            </div>
        </div>
    );
};

export default DebitCardDisplay;