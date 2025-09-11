import React, { useState } from 'react';
import { XIcon } from './icons';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  if (!isOpen) return null;

  const handleChangePin = () => {
    // Logic to verify current PIN and save new PIN would go here
    alert('Función de cambio de PIN no implementada en este demo.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Cambiar PIN de Administrador</h2>
          <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm">PIN Actual</label>
            <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} maxLength={4} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
          </div>
          <div>
            <label className="text-sm">Nuevo PIN</label>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={4} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
          </div>
          <div>
            <label className="text-sm">Confirmar Nuevo PIN</label>
            <input type="password" value={confirmNewPin} onChange={e => setConfirmNewPin(e.target.value)} maxLength={4} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancelar</button>
          <button onClick={handleChangePin} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Cambiar PIN</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePinModal;
