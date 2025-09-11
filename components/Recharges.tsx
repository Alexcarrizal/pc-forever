import React, { useState, useMemo } from 'react';
import { ElectronicRecharge, CashFlowTransaction } from '../types';
import { DevicePhoneMobileIcon } from './icons';

interface RechargesProps {
    recharges: ElectronicRecharge[];
    setRecharges: React.Dispatch<React.SetStateAction<ElectronicRecharge[]>>;
    addTransaction: (transaction: CashFlowTransaction) => void;
}

const commonCompanies = ['Telcel', 'AT&T', 'Movistar', 'Unefon', 'Virgin Mobile', 'Otro...'];

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
}

const Recharges: React.FC<RechargesProps> = ({ recharges, setRecharges, addTransaction }) => {
    const [company, setCompany] = useState(commonCompanies[0]);
    const [otherCompany, setOtherCompany] = useState('');
    const [amount, setAmount] = useState('');

    const todaysRecharges = useMemo(() => {
        return recharges
            .filter(r => isToday(new Date(r.date)))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [recharges]);
    
    const todaysTotal = useMemo(() => {
        return todaysRecharges.reduce((sum, r) => sum + r.amount, 0);
    }, [todaysRecharges]);

    const handleRegisterRecharge = () => {
        const rechargeAmount = parseFloat(amount);
        const finalCompany = company === 'Otro...' ? otherCompany : company;

        if (!finalCompany || !rechargeAmount || rechargeAmount <= 0) {
            alert('Por favor, ingrese una compañía y un monto válido.');
            return;
        }

        const newRecharge: ElectronicRecharge = {
            id: `recharge-${Date.now()}`,
            date: new Date().toISOString(),
            company: finalCompany,
            amount: rechargeAmount,
        };

        const newTransaction: CashFlowTransaction = {
            id: `cf-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'Ingreso',
            description: `Recarga Electrónica: ${finalCompany}`,
            client: 'N/A',
            paymentMethod: 'Efectivo', // Assuming cash, could be made more complex
            amount: rechargeAmount,
        };

        setRecharges(prev => [...prev, newRecharge]);
        addTransaction(newTransaction);
        
        // Reset form
        setCompany(commonCompanies[0]);
        setOtherCompany('');
        setAmount('');
    };

    return (
        <div className="text-slate-800 dark:text-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Recargas Electrónicas</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Form */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Registrar Venta</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Compañía</label>
                            <select
                                value={company}
                                onChange={e => setCompany(e.target.value)}
                                className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {commonCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {company === 'Otro...' && (
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Nombre de la otra compañía</label>
                                <input
                                    type="text"
                                    value={otherCompany}
                                    onChange={e => setOtherCompany(e.target.value)}
                                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}
                        
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Monto</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-7 pr-3 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleRegisterRecharge}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            <DevicePhoneMobileIcon className="w-5 h-5" />
                            <span>Registrar Recarga</span>
                        </button>
                    </div>
                </div>

                {/* Today's Recharges List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recargas de Hoy</h2>
                        <div className="text-right">
                             <p className="text-sm text-slate-500 dark:text-slate-400">Total de Hoy</p>
                             <p className="text-xl font-bold text-green-600 dark:text-green-400">${todaysTotal.toFixed(2)}</p>
                        </div>
                     </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Hora</th>
                                    <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Compañía</th>
                                    <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {todaysRecharges.length > 0 ? (
                                    todaysRecharges.map(recharge => (
                                        <tr key={recharge.id}>
                                            <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{new Date(recharge.date).toLocaleTimeString()}</td>
                                            <td className="p-3 font-medium">{recharge.company}</td>
                                            <td className="p-3 text-right font-semibold">${recharge.amount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center p-8 text-slate-500 dark:text-slate-400">No hay recargas registradas hoy.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Recharges;