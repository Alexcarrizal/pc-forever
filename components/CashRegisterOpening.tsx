import React, { useState } from 'react';
import { CashRegisterIcon } from './icons';

interface CashRegisterOpeningProps {
  onCashboxOpen: (amount: number) => void;
  lastClosingBalance: number | null;
}

const CashRegisterOpening: React.FC<CashRegisterOpeningProps> = ({ onCashboxOpen, lastClosingBalance }) => {
  const [amount, setAmount] = useState('');
  const [showInput, setShowInput] = useState(lastClosingBalance === null || lastClosingBalance <= 0);

  const handleOpenCashbox = () => {
    onCashboxOpen(parseFloat(amount) || 0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOpenCashbox();
    }
  }
  
  const handleStartWithPrevious = () => {
    if (lastClosingBalance !== null) {
        onCashboxOpen(lastClosingBalance);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm text-center">
        <CashRegisterIcon className="mx-auto h-16 w-16 text-green-600 dark:text-green-500" />
        <h1 className="text-3xl font-bold mt-4 text-slate-900 dark:text-white">Apertura de Caja</h1>
        
        {showInput ? (
            <>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Ingrese el monto inicial en efectivo para comenzar el día.
                </p>

                <div className="relative mt-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full text-center text-4xl font-bold px-12 py-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleOpenCashbox}
                  className="w-full mt-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Abrir Caja
                </button>
            </>
        ) : (
            <>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  El último corte de caja registró un saldo de:
                </p>
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-4xl font-bold text-slate-800 dark:text-white">${lastClosingBalance?.toFixed(2)}</p>
                </div>
                
                <div className="mt-8 space-y-4">
                    <button
                      onClick={handleStartWithPrevious}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Dejar dinero en caja y abrir
                    </button>
                     <button
                      onClick={() => setShowInput(true)}
                      className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Ingresar un monto diferente
                    </button>
                </div>
            </>
        )}
        
      </div>
    </div>
  );
};

export default CashRegisterOpening;