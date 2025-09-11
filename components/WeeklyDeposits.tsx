import React from 'react';
import { Apartado, CreditCard, DebitCard, SaleRecord, CashFlowTransaction, ElectronicRecharge } from '../types';
import FinancialStatCard from './FinancialStatCard';

interface WeeklyDepositsProps {
    salesHistory: SaleRecord[];
    cashFlow: CashFlowTransaction[];
    apartados: Apartado[];
    creditCards: CreditCard[];
    debitCards: DebitCard[];
    electronicRecharges: ElectronicRecharge[];
}

const WeeklyDeposits: React.FC<WeeklyDepositsProps> = ({
    salesHistory,
    cashFlow,
    apartados,
    creditCards,
    debitCards,
    electronicRecharges
}) => {
    const weeklyStats = React.useMemo(() => {
        const rechargeIncome = electronicRecharges.reduce((sum, r) => sum + r.amount, 0);

        let moduleIncome = 0;
        let productSales = 0;
        let productCosts = 0;
        let serviceSales = 0;

        salesHistory.forEach(sale => {
            sale.items.forEach((item: any) => {
                if (item.id.startsWith('time-')) {
                    moduleIncome += item.price * item.quantity;
                } else if (item.isService) {
                    serviceSales += item.price * item.quantity;
                } else {
                    productSales += item.price * item.quantity;
                    productCosts += item.purchasePrice * item.quantity;
                }
            });
        });

        const manualIncome = cashFlow
            .filter(t => t.type === 'Ingreso' && t.paymentMethod === 'Manual')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const manualOutcome = cashFlow
            .filter(t => t.type === 'Salida' && t.paymentMethod === 'Manual')
            .reduce((sum, t) => sum + t.amount, 0);

        const mainBusinessIncome = moduleIncome + productSales + serviceSales + manualIncome - manualOutcome;
        const totalIncome = mainBusinessIncome + rechargeIncome;
        const grossProfit = mainBusinessIncome - productCosts;

        return { 
            totalIncome,
            totalCosts: productCosts,
            grossProfit,
            rechargeIncome,
        };
    }, [salesHistory, cashFlow, electronicRecharges]);

    const getCardName = (type: 'cash' | 'debit' | 'credit', id?: string) => {
        if (type === 'cash') {
            return 'Efectivo';
        }
        if (!id) {
            return 'Tarjeta no encontrada';
        }
        const cardList = type === 'credit' ? creditCards : debitCards;
        const card = cardList.find(c => c.id === id);
        return card ? card.nickname || `${card.bank} **** ${card.number}` : 'Tarjeta no encontrada';
    }

    return (
        <div className="text-slate-800 dark:text-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Depósitos y Cierre Semanal</h1>
            <p className="mb-8 text-slate-500 dark:text-slate-400">
                Esta sección te ayuda a realizar tu cierre semanal, mostrando la ganancia bruta, los costos y la distribución de tus apartados para depósito.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <FinancialStatCard 
                    title="Ingreso Total Semanal" 
                    value={weeklyStats.totalIncome} 
                    color="green" 
                    subValue="Incluye ventas, servicios y recargas."
                />
                <FinancialStatCard 
                    title="Ganancia Bruta Semanal" 
                    value={weeklyStats.grossProfit} 
                    color="blue" 
                    subValue="Ingresos menos costos de productos."
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Resumen de Apartados y Costos para Depósito</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FinancialStatCard title="Costos de Productos (Semana)" value={weeklyStats.totalCosts} color="yellow" />
                    <FinancialStatCard title="Recargas Electrónicas (Semana)" value={weeklyStats.rechargeIncome} color="indigo" />
                    
                    {apartados.map(ap => {
                       const amount = (weeklyStats.grossProfit * ap.percentage) / 100;
                       return (
                         <div key={ap.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col justify-between">
                            <div>
                                 <p className="font-bold text-lg text-slate-800 dark:text-white">{ap.name}</p>
                                 <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${amount.toFixed(2)}</p>
                                 <p className="text-sm text-slate-500 dark:text-slate-400">{ap.percentage}% de la ganancia bruta</p>
                            </div>
                             <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <span className="font-semibold">Destino:</span> {getCardName(ap.destinationType, ap.destinationId)}
                             </p>
                         </div>
                       );
                   })}
                </div>

                {apartados.length === 0 && weeklyStats.totalCosts === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p>No hay apartados configurados ni costos registrados esta semana.</p>
                        <p className="text-sm">Ve a <span className="font-semibold">Reportes</span> para configurar tus apartados de dinero.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyDeposits;