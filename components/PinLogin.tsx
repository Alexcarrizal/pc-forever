import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface PinLoginProps {
  admin: { name: string; pin: string };
  onLogin: () => void;
}

const PinLogin: React.FC<PinLoginProps> = ({ admin, onLogin }) => {
  const [pin, setPin] = useState<string[]>([]);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'error' | 'success'>('idle');

  const handlePinInput = useCallback((value: string) => {
    if (feedbackState === 'success') return;

    setFeedbackState('idle');

    if (value === 'del') {
      setPin(p => p.slice(0, -1));
    } else if (value === 'ok') {
      if (pin.join('') === admin.pin) {
        setFeedbackState('success');
        setTimeout(onLogin, 600);
      } else {
        setFeedbackState('error');
        setTimeout(() => {
          setFeedbackState('idle');
          setPin([]);
        }, 500);
      }
    } else if (pin.length < 4) {
      setPin(p => [...p, value]);
    }
  }, [pin, admin.pin, onLogin, feedbackState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinInput(e.key);
      } else if (e.key === 'Backspace') {
        handlePinInput('del');
      } else if (e.key === 'Enter') {
        handlePinInput('ok');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePinInput]);
  
  const pinContainerClasses = useMemo(() => {
    switch (feedbackState) {
        case 'error':
            return 'animate-shake';
        case 'success':
            return 'animate-success-pop';
        default:
            return 'animate-scale-in';
    }
  }, [feedbackState]);
  
  const getPinDotClasses = (index: number) => {
    const baseClasses = 'w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold transition-colors duration-200';
    
    if (feedbackState === 'error') {
        return `${baseClasses} bg-red-500 text-white`;
    }
    
    if (feedbackState === 'success') {
        return `${baseClasses} bg-green-500 text-white`;
    }

    if (pin.length > index) {
        return `${baseClasses} bg-blue-600 text-white`;
    }

    return `${baseClasses} bg-slate-200 dark:bg-slate-700`;
  };

  const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900 p-4 overflow-hidden">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white animate-fade-in-down" style={{ animationDelay: '100ms', opacity: 0 }}>
            Hola, {admin.name}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 animate-fade-in-down" style={{ animationDelay: '200ms', opacity: 0 }}>
            Ingrese su PIN de 4 dígitos para continuar
        </p>

        <div className={`flex justify-center gap-4 my-8 ${pinContainerClasses}`} style={{ animationDelay: '300ms', opacity: 0 }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={getPinDotClasses(i)}
            >
              {pin.length > i ? '•' : ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {keypadButtons.map((key, index) => (
            <button
              key={key}
              onClick={() => handlePinInput(key.toLowerCase())}
              className="h-16 rounded-full text-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 animate-scale-in"
              style={{ animationDelay: `${400 + index * 30}ms`, opacity: 0 }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinLogin;