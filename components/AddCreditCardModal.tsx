

import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { XIcon } from './icons';

interface AddCreditCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: Omit<CreditCard, 'id'>) => void;
    existingCard: CreditCard | null;
}

const AddCreditCardModal: React.FC<AddCreditCardModalProps> = ({ isOpen, onClose, onSave, existingCard }) => {
    const [bank, setBank] = useState('');
    const [nickname, setNickname] = useState('');
    const [number, setNumber] = useState('');
    const [type, setType] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
    const [limit, setLimit] = useState('');
    const [balance, setBalance] = useState('');
    const [cutOffDay, setCutOffDay] = useState('');
    const [paymentDueDay, setPaymentDueDay] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if(existingCard) {
            setBank(existingCard.bank);
            setNickname(existingCard.nickname || '');
            setNumber(existingCard.number);
            setType(existingCard.type);
            setLimit(String(existingCard.limit));
            setBalance(String(existingCard.balance));
            setCutOffDay(String(existingCard.cutOffDay));
            setPaymentDueDay(String(existingCard.paymentDueDay));
            setIsActive(existingCard.isActive);
        } else {
            // reset form
            setBank('');
            setNickname('');
            setNumber('');
            setType('Visa');
            setLimit('');
            setBalance('');
            setCutOffDay('');
            setPaymentDueDay('');
            setIsActive(true);
        }
    }, [existingCard]);

    if (!isOpen) return null;

    const handleSave = () => {
        const cutOffDayValue = parseInt(cutOffDay);
        const paymentDueDayValue = parseInt(paymentDueDay);
        if(!bank || !number || !limit || !balance || !cutOffDay || !paymentDueDay || 
           isNaN(cutOffDayValue) || cutOffDayValue < 1 || cutOffDayValue > 31 ||
           isNaN(paymentDueDayValue) || paymentDueDayValue < 1 || paymentDueDayValue > 31) {
            alert("Por favor complete todos los campos correctamente. Los días de corte y pago deben ser números entre 1 y 31.");
            return;
        }
        onSave({
            bank,
            nickname: nickname || undefined,
            number,
            type,
            limit: parseFloat(limit),
            balance: parseFloat(balance),
            cutOffDay: cutOffDayValue,
            paymentDueDay: paymentDueDayValue,
            isActive
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 bg-red-500 text-white rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-bold">{existingCard ? 'Editar' : 'Agregar'} Tarjeta de Crédito</h2>
                    <button onClick={onClose} className="text-white"><XIcon className="h-6 w-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Banco" value={bank} onChange={e => setBank(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                        <input type="text" placeholder="Apodo (Ej: Principal)" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Últimos 4 dígitos" maxLength={4} value={number} onChange={e => setNumber(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md">
                            <option>Visa</option>
                            <option>Mastercard</option>
                            <option>Amex</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Límite de Crédito" value={limit} onChange={e => setLimit(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                        <input type="number" placeholder="Saldo Actual" value={balance} onChange={e => setBalance(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Día de Corte</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="31" 
                                placeholder="1-31" 
                                value={cutOffDay} 
                                onChange={e => setCutOffDay(e.target.value)} 
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"
                            />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Día Límite de Pago</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="31" 
                                placeholder="1-31" 
                                value={paymentDueDay} 
                                onChange={e => setPaymentDueDay(e.target.value)} 
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 pt-2">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                        <span>Tarjeta Activa</span>
                    </label>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold">Guardar Tarjeta</button>
                </div>
            </div>
        </div>
    );
};

export default AddCreditCardModal;