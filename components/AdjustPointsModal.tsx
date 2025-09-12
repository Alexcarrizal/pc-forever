import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { XIcon, StarIcon } from './icons';

interface AdjustPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjustment: number) => void;
  client: Client;
}

const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({ isOpen, onClose, onSave, client }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const adjustment = parseInt(amount) || 0;
  const newTotal = client.points + adjustment;

  const handleSave = () => {
    if (newTotal < 0) {
      alert("El total de puntos no puede ser negativo.");
      return;
    }
    onSave(adjustment);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Ajustar Puntos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{client.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Puntos Actuales</p>
              <p className="text-3xl font-bold flex items-center justify-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-400"/>
                {client.points}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nuevo Total</p>
              <p className={`text-3xl font-bold flex items-center justify-center gap-2 ${newTotal < 0 ? 'text-red-500' : ''}`}>
                 <StarIcon className={`w-6 h-6 ${newTotal < 0 ? 'text-red-400' : 'text-yellow-400'}`}/>
                {newTotal}
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="points-adjustment" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block text-center">Puntos a Agregar o Quitar</label>
            <input 
              id="points-adjustment" 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ej: 10 para agregar, -5 para quitar"
              className="w-full text-center p-3 text-2xl font-bold bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">Guardar Ajuste</button>
        </div>
      </div>
    </div>
  );
};

export default AdjustPointsModal;