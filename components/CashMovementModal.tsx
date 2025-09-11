
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { CashFlowTransaction } from '../types';

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  addTransaction: (transaction: CashFlowTransaction) => void;
}

const CashMovementModal: React.FC<CashMovementModalProps> = ({ isOpen, onClose, addTransaction }) => {
  const [movementType, setMovementType] = useState<'Ingreso' | 'Salida'>('Ingreso');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMovementType('Ingreso');
      setAmount('');
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegister = () => {
    const numericAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, ingrese un monto válido y una descripción.');
      return;
    }
    
    addTransaction({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: movementType,
      description: description,
      client: null,
      paymentMethod: 'Manual',
      amount: numericAmount,
    });

    onClose();
  };

  const getButtonClass = (type: 'Ingreso' | 'Salida') => {
    const baseClass = 'w-full p-4 rounded-lg text-left transition-colors duration-200 border-2';
    if (type === movementType) {
      return type === 'Ingreso' 
        ? `${baseClass} bg-green-500/20 border-green-500`
        : `${baseClass} bg-red-500/20 border-red-500`;
    }
    return `${baseClass} bg-slate-100 dark:bg-slate-700 border-transparent hover:border-slate-400 dark:hover:border-slate-500`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Registrar Movimiento Manual</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-4">
              <button className={getButtonClass('Ingreso')} onClick={() => setMovementType('Ingreso')}>
                <p className="font-bold">Ingreso</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Entrada de dinero</p>
              </button>
              <button className={getButtonClass('Salida')} onClick={() => setMovementType('Salida')}>
                <p className="font-bold">Salida</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gasto de dinero</p>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Monto</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
              <input 
                id="amount" 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full pl-7 pr-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Descripción</label>
            <textarea 
              id="description" 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el motivo del movimiento..." 
              className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            ></textarea>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
          <button
            onClick={handleRegister}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
              movementType === 'Ingreso' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Registrar {movementType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashMovementModal;
