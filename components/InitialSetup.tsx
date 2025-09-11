import React, { useState } from 'react';
import { ComputerIcon } from './icons';

interface InitialSetupProps {
  onSetupComplete: (name: string, pin: string) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onSetupComplete }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleCreateAccount = () => {
    if (!name || !pin || !confirmPin) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (pin.length !== 4) {
      setError('El PIN debe tener exactamente 4 dígitos.');
      return;
    }
    if (pin !== confirmPin) {
      setError('Los PINs no coinciden.');
      return;
    }
    setError('');
    onSetupComplete(name, pin);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateAccount();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm text-center">
        <ComputerIcon className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
        <h1 className="text-3xl font-bold mt-4 text-slate-900 dark:text-white">Configuración Inicial</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Cree la cuenta de Administrador principal. Esta cuenta no se podrá eliminar.
        </p>

        <div className="space-y-4 mt-8 text-left">
          <input
            type="text"
            placeholder="Nombre del Administrador"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Crear PIN de 4 dígitos"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar PIN"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        <button
          onClick={handleCreateAccount}
          className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Crear Cuenta de Administrador
        </button>
      </div>
    </div>
  );
};

export default InitialSetup;
