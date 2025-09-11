import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { XIcon } from './icons';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'points'> & { points?: number }) => void;
  existingClient?: Client | null;
  zIndex?: number;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave, existingClient, zIndex=50 }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    if (existingClient) {
      setName(existingClient.name);
      setPhone(existingClient.phone || '');
    } else {
      setName('');
      setPhone('');
    }
  }, [existingClient]);

  if (!isOpen) return null;
  
  const handleSave = () => {
    if (!name) {
      alert('El nombre es obligatorio.');
      return;
    }
    onSave({ name, phone, points: existingClient?.points || 0 });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4" style={{ zIndex }} onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{existingClient ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="client-name" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Nombre</label>
            <input 
              id="client-name" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="client-phone" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Teléfono (Opcional)</label>
            <input 
              id="client-phone" 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
