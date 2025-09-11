import React, { useState, useMemo } from 'react';
import { Client, PaymentMethod } from '../types';
import { XIcon, PlusIcon, CreditCardIcon, CashIcon, PhoneWaveIcon, ArrowPathIcon } from './icons';

interface ConfirmSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  clients: Client[];
  onConfirm: (paymentMethod: PaymentMethod, saleData: {
    clientId: string | null;
    subtotal: number;
    commission: number;
    total: number;
    netReceived: number;
  }) => void;
  onAddNewClient?: () => void;
}

const ConfirmSaleModal: React.FC<ConfirmSaleModalProps> = ({ isOpen, onClose, totalAmount, clients, onConfirm, onAddNewClient }) => {
  const [selectedClient, setSelectedClient] = useState<string>('c0'); // Default to "Venta al Público"
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [cashReceived, setCashReceived] = useState('');
  const [commissionHandling, setCommissionHandling] = useState<'absorb' | 'charge'>('charge');

  const commissionRate = 0.0418; // 4.18%

  const saleDetails = useMemo(() => {
    const subtotal = totalAmount;
    let commission = 0;
    let total = subtotal;
    let netReceived = subtotal;

    if (paymentMethod === 'Tarjeta' || paymentMethod === 'Mercado Pago') {
      commission = subtotal * commissionRate;
      if (commissionHandling === 'charge') {
        total = subtotal + commission;
        netReceived = subtotal;
      } else { // absorb
        total = subtotal;
        netReceived = subtotal - commission;
      }
    }
    return { subtotal, commission, total, netReceived };
  }, [totalAmount, paymentMethod, commissionHandling]);

  if (!isOpen) return null;
  
  const change = parseFloat(cashReceived) - saleDetails.total;
  
  const handleConfirm = () => {
    onConfirm(paymentMethod, {
      clientId: selectedClient,
      subtotal: saleDetails.subtotal,
      commission: (paymentMethod === 'Tarjeta' || paymentMethod === 'Mercado Pago') ? saleDetails.commission : 0,
      total: saleDetails.total,
      netReceived: saleDetails.netReceived
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Confirmar Venta</h2>
          <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          {/* Client Selection */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Cliente</label>
            <div className="flex gap-2">
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600">
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {onAddNewClient && (
                <button onClick={onAddNewClient} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><PlusIcon /></button>
              )}
            </div>
          </div>
          
          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Método de Pago</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Efectivo', 'Tarjeta', 'Mercado Pago', 'Transferencia'] as PaymentMethod[]).map(method => {
                const isActive = paymentMethod === method;
                const Icon = { 'Efectivo': CashIcon, 'Tarjeta': CreditCardIcon, 'Mercado Pago': PhoneWaveIcon, 'Transferencia': ArrowPathIcon }[method];
                return (
                  <button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 rounded-lg border-2 text-left transition-colors ${isActive ? 'bg-green-500/20 border-green-500' : 'bg-slate-100 dark:bg-slate-700 border-transparent hover:border-slate-400'}`}>
                    <div className="flex items-center gap-3">
                       <Icon className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-slate-500'}`} />
                      <div>
                        <p className="font-bold">{method}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {method === 'Tarjeta' || method === 'Mercado Pago' ? `Desde ${commissionRate*100}%` : 'Sin comisión'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Conditional Sections */}
          {paymentMethod === 'Efectivo' && (
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Cálculo de Cambio</h3>
              <label className="text-sm">Efectivo Recibido</label>
              <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00" className="w-full text-center text-3xl font-bold p-2 my-2 bg-white dark:bg-slate-800 rounded-md"/>
              {change >= 0 && <p className="text-center text-green-500 font-semibold">Cambio: ${change.toFixed(2)}</p>}
            </div>
          )}
          
          {(paymentMethod === 'Tarjeta' || paymentMethod === 'Mercado Pago') && (
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Manejo de Comisión</h3>
              <div className="space-y-3">
                <label className={`block p-3 rounded-lg border-2 ${commissionHandling === 'absorb' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                  <input type="radio" name="commission" value="absorb" checked={commissionHandling === 'absorb'} onChange={() => setCommissionHandling('absorb')} className="mr-2"/>
                  Asumir comisión <span className="text-xs text-slate-500">(El negocio absorbe la comisión de ${saleDetails.commission.toFixed(2)})</span>
                </label>
                 <label className={`block p-3 rounded-lg border-2 ${commissionHandling === 'charge' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                  <input type="radio" name="commission" value="charge" checked={commissionHandling === 'charge'} onChange={() => setCommissionHandling('charge')} className="mr-2"/>
                  Cobrar comisión al cliente <span className="text-xs text-slate-500">(Se agregan ${saleDetails.commission.toFixed(2)} al total)</span>
                </label>
              </div>
            </div>
          )}

           {/* Totals Section */}
          <div className="bg-slate-100 dark:bg-slate-900/70 p-4 rounded-lg space-y-2">
            {totalAmount > 0.001 ? (
              <>
                <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${saleDetails.subtotal.toFixed(2)}</span>
                </div>
                {(paymentMethod === 'Tarjeta' || paymentMethod === 'Mercado Pago') && commissionHandling === 'charge' && (
                    <div className="flex justify-between text-sm text-yellow-600 dark:text-yellow-400">
                        <span>Comisión ({ (commissionRate * 100).toFixed(2) }%):</span>
                        <span>+${saleDetails.commission.toFixed(2)}</span>
                    </div>
                )}
                <hr className="border-slate-300 dark:border-slate-600"/>
                <div className="flex justify-between font-bold text-xl">
                    <span>Total a cobrar:</span>
                    <span className="text-green-500">
                      ${saleDetails.total.toFixed(2)}
                    </span>
                </div>
                 {(paymentMethod === 'Tarjeta' || paymentMethod === 'Mercado Pago') && (
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span>Monto neto recibido:</span>
                        <span>${saleDetails.netReceived.toFixed(2)}</span>
                    </div>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center font-bold text-2xl text-center py-4">
                  <span className="text-green-500">(GRATIS)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
          <button onClick={handleConfirm} className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">Confirmar y Cobrar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSaleModal;
