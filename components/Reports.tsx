

import React from 'react';
import { CreditCard, DebitCard, Apartado } from '../types';
import FinancialStatCard from './FinancialStatCard';
import CreditCardDisplay from './CreditCardDisplay';
import DebitCardDisplay from './DebitCardDisplay';
import AddCreditCardModal from './AddCreditCardModal';
import AddDebitCardModal from './AddDebitCardModal';
import NewApartadoModal from './NewApartadoModal';
import CardTransactionModal from './CardTransactionModal';
import { TransactionType } from './CardTransactionModal';
import { DeleteIcon, EditIcon } from './icons';

interface ReportsProps {
  salesHistory: any[]; // Simplified for this component
  cashFlow: any[]; // Simplified
  creditCards: CreditCard[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  debitCards: DebitCard[];
  setDebitCards: React.Dispatch<React.SetStateAction<DebitCard[]>>;
  apartados: Apartado[];
  onSaveApartado: (apartado: Omit<Apartado, 'id'>) => void;
  onUpdateApartado: (apartado: Apartado) => void;
  onDeleteApartado: (id: string) => void;
  addTransaction: (transaction: any) => void;
  electronicRecharges: any[]; // Simplified
}

const Reports: React.FC<ReportsProps> = ({ 
    salesHistory, 
    cashFlow,
    creditCards,
    setCreditCards,
    debitCards,
    setDebitCards,
    apartados,
    onSaveApartado,
    onUpdateApartado,
    onDeleteApartado,
    addTransaction,
    electronicRecharges
}) => {
    
    const [isCreditModalOpen, setIsCreditModalOpen] = React.useState(false);
    const [isDebitModalOpen, setIsDebitModalOpen] = React.useState(false);
    const [isApartadoModalOpen, setIsApartadoModalOpen] = React.useState(false);
    const [editingCreditCard, setEditingCreditCard] = React.useState<CreditCard | null>(null);
    const [editingDebitCard, setEditingDebitCard] = React.useState<DebitCard | null>(null);
    const [editingApartado, setEditingApartado] = React.useState<Apartado | null>(null);
    
    const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
    const [transactionDetails, setTransactionDetails] = React.useState<{card: CreditCard | DebitCard, type: TransactionType} | null>(null);

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
        
        const totalApartadoPercentage = apartados.reduce((sum, ap) => sum + ap.percentage, 0);
        const totalApartado = (grossProfit * totalApartadoPercentage) / 100;
        const availableProfit = grossProfit - totalApartado;

        return { 
            totalIncome,
            totalCosts: productCosts,
            grossProfit,
            rechargeIncome,
            totalApartado,
            availableProfit,
            totalApartadoPercentage,
        };
    }, [salesHistory, cashFlow, apartados, electronicRecharges]);
    
     const handleSaveCreditCard = (card: Omit<CreditCard, 'id'>) => {
        if(editingCreditCard) {
            setCreditCards(prev => prev.map(c => c.id === editingCreditCard.id ? { ...c, ...card } : c));
        } else {
            setCreditCards(prev => [...prev, { id: `cc-${Date.now()}`, ...card }]);
        }
        setIsCreditModalOpen(false);
        setEditingCreditCard(null);
    }
    
    const handleSaveDebitCard = (card: Omit<DebitCard, 'id'>) => {
        if(editingDebitCard) {
            setDebitCards(prev => prev.map(c => c.id === editingDebitCard.id ? { ...c, ...card } : c));
        } else {
            setDebitCards(prev => [...prev, { id: `dc-${Date.now()}`, ...card }]);
        }
        setIsDebitModalOpen(false);
        setEditingDebitCard(null);
    }

    const handleDeleteCreditCard = (id: string) => {
        if(window.confirm("¿Seguro que quieres eliminar esta tarjeta de crédito?")) {
            setCreditCards(prev => prev.filter(c => c.id !== id));
        }
    }
    
    const handleDeleteDebitCard = (id: string) => {
        if(window.confirm("¿Seguro que quieres eliminar esta tarjeta de débito?")) {
            setDebitCards(prev => prev.filter(c => c.id !== id));
        }
    }

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

    const handleCardTransaction = (card: CreditCard | DebitCard, type: TransactionType) => {
        setTransactionDetails({ card, type });
        setIsTransactionModalOpen(true);
    };

    const handleConfirmTransaction = (amount: number, description: string, paymentSource?: string) => {
        if (!transactionDetails) return;
        const { card, type } = transactionDetails;

        switch (type) {
            case 'credit-purchase':
                setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance + amount } : c));
                break;
            case 'credit-payment':
                setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance - amount } : c));
                if (paymentSource === 'cash') {
                    addTransaction({
                        id: `cf-${Date.now()}`,
                        date: new Date().toISOString(),
                        type: 'Salida',
                        description: `Pago a T.C. ${getCardName('credit', card.id)} - ${description}`,
                        client: null,
                        paymentMethod: 'Manual',
                        amount,
                    });
                } else { 
                    setDebitCards(prev => prev.map(dc => dc.id === paymentSource ? { ...dc, balance: dc.balance - amount } : dc));
                }
                break;
            case 'debit-purchase':
                setDebitCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance - amount } : c));
                break;
            case 'debit-deposit':
                setDebitCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance + amount } : c));
                addTransaction({
                    id: `cf-${Date.now()}`,
                    date: new Date().toISOString(),
                    type: 'Ingreso',
                    description: `Depósito a T.D. ${getCardName('debit', card.id)} - ${description}`,
                    client: null,
                    paymentMethod: 'Manual',
                    amount,
                });
                break;
        }
        setIsTransactionModalOpen(false);
        setTransactionDetails(null);
    };

    const handleSaveOrUpdateApartado = (apartadoData: Omit<Apartado, 'id'> | Apartado) => {
        if ('id' in apartadoData) {
            onUpdateApartado(apartadoData as Apartado);
        } else {
            onSaveApartado(apartadoData);
        }
        setIsApartadoModalOpen(false);
        setEditingApartado(null);
    };
    
    const sortedCreditCards = React.useMemo(() => {
        const getNextPaymentDueDate = (card: CreditCard): Date => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const year = today.getFullYear();
            const month = today.getMonth();

            let candidateDate = new Date(year, month, card.paymentDueDay);

            if (candidateDate < today) {
                candidateDate.setMonth(candidateDate.getMonth() + 1);
            }
            
            if (card.balance === 0) {
                const paymentDateThisMonth = new Date(year, month, card.paymentDueDay);
                if (candidateDate.getTime() === paymentDateThisMonth.getTime()) {
                     candidateDate.setMonth(candidateDate.getMonth() + 1);
                }
            }

            return candidateDate;
        };
        
        return [...creditCards].sort((a, b) => {
            const aHasBalance = a.balance > 0;
            const bHasBalance = b.balance > 0;

            if (aHasBalance && !bHasBalance) return -1;
            if (!aHasBalance && bHasBalance) return 1;

            const dateA = getNextPaymentDueDate(a);
            const dateB = getNextPaymentDueDate(b);

            return dateA.getTime() - dateB.getTime();
        });
    }, [creditCards]);
    
    return (
        <div className="text-slate-800 dark:text-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Reporte Financiero Semanal</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <FinancialStatCard title="Ingreso Total Semanal" value={weeklyStats.totalIncome} color="green" />
                <FinancialStatCard title="Ganancia Bruta Semanal" value={weeklyStats.grossProfit} color="blue" subValue="No incluye recargas" />
                <FinancialStatCard title="Ventas por Recargas" value={weeklyStats.rechargeIncome} color="indigo" />
                <FinancialStatCard title="Costos de Productos (Semana)" value={weeklyStats.totalCosts} color="yellow" />
                <FinancialStatCard title="Total Apartado" value={weeklyStats.totalApartado} color="red" subValue={`${weeklyStats.totalApartadoPercentage.toFixed(1)}% de la ganancia`} />
                <FinancialStatCard title="Ganancia Disponible" value={weeklyStats.availableProfit} color="purple" />
            </div>
            
            {/* Apartados Section */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apartados de Dinero</h2>
                    <button onClick={() => { setEditingApartado(null); setIsApartadoModalOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">+ Nuevo Apartado</button>
                </div>
                 {apartados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {apartados.map(ap => {
                           const amount = (weeklyStats.grossProfit * ap.percentage) / 100;
                           return (
                             <div key={ap.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg relative group">
                                 <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingApartado(ap); setIsApartadoModalOpen(true); }} className="p-1.5 bg-slate-200 dark:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDeleteApartado(ap.id)} className="p-1.5 bg-slate-200 dark:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400">
                                        <DeleteIcon className="w-4 h-4" />
                                    </button>
                                 </div>
                                 <p className="font-bold">{ap.name}</p>
                                 <p className="text-2xl font-bold text-blue-500">${amount.toFixed(2)}</p>
                                 <p className="text-sm text-slate-500 dark:text-slate-400">{ap.percentage}% de la ganancia bruta</p>
                                 <p className="text-xs text-slate-400 mt-2">Destino: {getCardName(ap.destinationType, ap.destinationId)}</p>
                             </div>
                           );
                       })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p>No has creado ningún apartado.</p>
                        <p className="text-sm">Usa los apartados para organizar tus ganancias.</p>
                    </div>
                )}
            </div>

            {/* Cards Section */}
            <div className="mt-8 space-y-8">
                 {/* Credit Cards Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tarjetas de Crédito</h2>
                        <button onClick={() => { setEditingCreditCard(null); setIsCreditModalOpen(true); }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">+ Agregar Tarjeta</button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {sortedCreditCards.map(card => (
                            <CreditCardDisplay 
                                key={card.id} 
                                card={card}
                                onEdit={() => { setEditingCreditCard(card); setIsCreditModalOpen(true); }}
                                onDelete={() => handleDeleteCreditCard(card.id)}
                                onTransaction={(type) => handleCardTransaction(card, type)}
                            />
                        ))}
                    </div>
                </div>

                {/* Debit Cards Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tarjetas de Débito</h2>
                        <button onClick={() => { setEditingDebitCard(null); setIsDebitModalOpen(true); }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">+ Agregar Tarjeta</button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {debitCards.map(card => (
                            <DebitCardDisplay 
                                key={card.id} 
                                card={card} 
                                onEdit={() => { setEditingDebitCard(card); setIsDebitModalOpen(true); }}
                                onDelete={() => handleDeleteDebitCard(card.id)}
                                onTransaction={(type) => handleCardTransaction(card, type)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {isApartadoModalOpen && (
                <NewApartadoModal
                    isOpen={isApartadoModalOpen}
                    onClose={() => {
                        setIsApartadoModalOpen(false);
                        setEditingApartado(null);
                    }}
                    onSave={handleSaveOrUpdateApartado}
                    existingApartado={editingApartado}
                    grossProfit={weeklyStats.grossProfit}
                    availableProfit={weeklyStats.availableProfit}
                    creditCards={creditCards}
                    debitCards={debitCards}
                />
            )}

            {(isCreditModalOpen || editingCreditCard) && (
                <AddCreditCardModal 
                    isOpen={isCreditModalOpen}
                    onClose={() => setIsCreditModalOpen(false)}
                    onSave={handleSaveCreditCard}
                    existingCard={editingCreditCard}
                />
            )}
            
            {(isDebitModalOpen || editingDebitCard) && (
                <AddDebitCardModal 
                    isOpen={isDebitModalOpen}
                    onClose={() => setIsDebitModalOpen(false)}
                    onSave={handleSaveDebitCard}
                    existingCard={editingDebitCard}
                />
            )}

            {isTransactionModalOpen && transactionDetails && (
                <CardTransactionModal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    onConfirm={handleConfirmTransaction}
                    transactionType={transactionDetails.type}
                    cardName={getCardName(transactionDetails.type.startsWith('credit') ? 'credit' : 'debit', transactionDetails.card.id)}
                    debitCards={debitCards}
                />
            )}
        </div>
    );
};

export default Reports;