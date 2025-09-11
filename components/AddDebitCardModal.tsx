
import React, { useState, useEffect } from 'react';
import { DebitCard } from '../types';
import { XIcon } from './icons';

interface AddDebitCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: Omit<DebitCard, 'id'>) => void;
    existingCard: DebitCard | null;
}

const AddDebitCardModal: React.FC<AddDebitCardModalProps> = ({ isOpen, onClose, onSave, existingCard }) => {
    const [bank, setBank] = useState('');
    const [nickname, setNickname] = useState('');
    const [number, setNumber] = useState('');
    const [accountType, setAccountType] = useState<'Ahorros' | 'Corriente' | 'Nómina'>('Ahorros');
    const [balance, setBalance] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if(existingCard) {
            setBank(existingCard.bank);
            setNickname(existingCard.nickname || '');
            setNumber(existingCard.number);
            setAccountType(existingCard.accountType);
            setBalance(String(existingCard.balance));
            setIsActive(existingCard.isActive);
        } else {
            // reset form
            setBank('');
            setNickname('');
            setNumber('');
            setAccountType('Ahorros');
            setBalance('');
            setIsActive(true);
        }
    }, [existingCard]);

    if (!isOpen) return null;

    const handleSave = () => {
        if(!bank || !number || !balance) {
            alert("Por favor complete todos los campos.");
            return;
        }
        onSave({
            bank,
            nickname: nickname || undefined,
            number,
            accountType,
            balance: parseFloat(balance),
            isActive
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 bg-blue-500 text-white rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-bold">{existingCard ? 'Editar' : 'Agregar'} Tarjeta de Débito</h2>
                     <button onClick={onClose} className="text-white"><XIcon className="h-6 w-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Banco" value={bank} onChange={e => setBank(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                        <input type="text" placeholder="Apodo (Ej: Ahorros)" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                    </div>
                    <input type="text" placeholder="Últimos 4 dígitos" maxLength={4} value={number} onChange={e => setNumber(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                    <select value={accountType} onChange={e => setAccountType(e.target.value as any)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md">
                        <option>Ahorros</option>
                        <option>Corriente</option>
                        <option>Nómina</option>
                    </select>
                    <input type="number" placeholder="Saldo Actual" value={balance} onChange={e => setBalance(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md"/>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                        <span>Tarjeta Activa</span>
                    </label>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold">Guardar Tarjeta</button>
                </div>
            </div>
        </div>
    );
};

export default AddDebitCardModal;