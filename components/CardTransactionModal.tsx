
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { CreditCard, DebitCard } from '../types';

export type TransactionType = 'credit-purchase' | 'credit-payment' | 'debit-purchase' | 'debit-deposit';

interface CardTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, description: string, paymentSource?: string) => void;
    transactionType: TransactionType;
    cardName: string;
    debitCards?: DebitCard[];
    cashBalance?: number; 
}

const modalConfig = {
    'credit-purchase': { title: 'Registrar Compra (Crédito)', buttonText: 'Registrar Compra', amountLabel: 'Monto de la Compra' },
    'credit-payment': { title: 'Realizar Pago a Tarjeta', buttonText: 'Confirmar Pago', amountLabel: 'Monto del Pago' },
    'debit-purchase': { title: 'Registrar Compra (Débito)', buttonText: 'Registrar Compra', amountLabel: 'Monto de la Compra' },
    'debit-deposit': { title: 'Realizar Depósito', buttonText: 'Confirmar Depósito', amountLabel: 'Monto del Depósito' },
};

const CardTransactionModal: React.FC<CardTransactionModalProps> = ({ 
    isOpen, onClose, onConfirm, transactionType, cardName, debitCards = [] 
}) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentSource, setPaymentSource] = useState('cash');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDescription('');
            setPaymentSource('cash');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const config = modalConfig[transactionType];

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || !description) {
            alert('Por favor, ingrese un monto y descripción válidos.');
            return;
        }
        onConfirm(numAmount, description, paymentSource);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">{config.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{cardName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">{config.amountLabel}</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: Compra en Amazon, Pago de nómina"
                            className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    {transactionType === 'credit-payment' && (
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Pagar con</label>
                            <select value={paymentSource} onChange={e => setPaymentSource(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600">
                                <option value="cash">Efectivo de Caja</option>
                                {debitCards.map(card => (
                                    <option key={card.id} value={card.id}>{card.nickname || `${card.bank} **** ${card.number}`} (Saldo: ${card.balance.toLocaleString()})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
                    <button onClick={handleConfirm} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        {config.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardTransactionModal;