import React, { useState, useMemo, useEffect } from 'react';
import { Module, ModuleStatus, Client, RateType, CashFlowTransaction, SaleRecord, ModuleType, Product, CartItem, View, SessionType, RateTier } from '../types';
import ModuleCard from './ModuleCard';
import CashMovementModal from './CashMovementModal';
import StartSessionModal from './StartSessionModal';
import AddClientModal from './AddClientModal';
import ManageSessionModal from './ManageSessionModal';
import AddProductToAccountModal from './AddProductToAccountModal';
import ConfirmSaleModal from './ConfirmSaleModal';
import ModulesConfigModal from './ModulesConfigModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ComputerIcon, DeleteIcon, EditIcon, EyeIcon, EyeSlashIcon, WarningIcon } from './icons';

interface DashboardProps {
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  rates: RateType[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addTransaction: (transaction: CashFlowTransaction) => void;
  onShowReceipt: (data: SaleRecord) => void;
  onAddSaleToHistory: (sale: SaleRecord) => void;
  salesHistory: SaleRecord[];
  cashFlow: CashFlowTransaction[];
  showBackupReminder: boolean;
  setActiveView: (view: View) => void;
  isIncomeVisible: boolean;
  setIsIncomeVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const calculateFixedTimeCost = (minutes: number, rate?: RateType): number => {
    if (!rate || minutes <= 0) return 0;

    const sortedTiers = [...rate.tiers].sort((a, b) => a.from - b.from);

    if (minutes > 60) {
        const oneHourTier = sortedTiers.find(t => t.to === 60);
        if (oneHourTier) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return hours * oneHourTier.price;
            }

            let remainingCost = 0;
            for (const tier of sortedTiers) {
                if (remainingMinutes >= tier.from) {
                    remainingCost = tier.price;
                } else {
                    break;
                }
            }
            return (hours * oneHourTier.price) + remainingCost;
        }
    }

    let applicableTier: RateTier | undefined;
    for (const tier of sortedTiers) {
        if (minutes >= tier.from) {
            applicableTier = tier;
        } else {
            break;
        }
    }

    return applicableTier ? applicableTier.price : 0;
};


const Dashboard: React.FC<DashboardProps> = ({ 
    modules, setModules, clients, setClients, rates, products, setProducts, addTransaction, 
    onShowReceipt, onAddSaleToHistory, salesHistory, cashFlow, showBackupReminder, setActiveView,
    isIncomeVisible, setIsIncomeVisible
}) => {
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [isManageSessionModalOpen, setIsManageSessionModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isConfirmSaleModalOpen, setIsConfirmSaleModalOpen] = useState(false);
  
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [saleToFinalize, setSaleToFinalize] = useState<{module: Module, total: number} | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [returnToManageSession, setReturnToManageSession] = useState(false);
  const [clientModalReturnTo, setClientModalReturnTo] = useState<null | 'start' | 'confirm'>(null);

  useEffect(() => {
    if (selectedModule) {
      const updatedModule = modules.find(m => m.id === selectedModule.id);
      // A stringify check is a simple way to deep-compare and prevent re-render loops.
      if (updatedModule && JSON.stringify(updatedModule) !== JSON.stringify(selectedModule)) {
        setSelectedModule(updatedModule);
      }
    }
  }, [modules, selectedModule]);

  const dailyIncome = useMemo(() => {
    const today = new Date();
    const todaysFlow = cashFlow.filter(t => isSameDay(new Date(t.date), today));
    
    const lastOpeningIndex = todaysFlow.map(t => t.type).lastIndexOf('Apertura');
    
    const currentSessionTransactions = lastOpeningIndex !== -1 ? todaysFlow.slice(lastOpeningIndex) : todaysFlow;

    const income = currentSessionTransactions
        .filter(t => t.type === 'Ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
        
    return income;
  }, [cashFlow]);

  const handleOpenStartSession = (module: Module) => {
    setSelectedModule(module);
    setIsStartSessionModalOpen(true);
  };
  
  const handleOpenManageSession = (module: Module) => {
    setSelectedModule(module);
    setIsManageSessionModalOpen(true);
  };

  const handleOpenEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setIsModulesModalOpen(true);
  };
  
  const handleStartSession = (clientId: string | null, sessionType: SessionType, details?: any) => {
    if (!selectedModule) return;

    const now = Date.now();
    let endTime: number | undefined = undefined;
    let fixedTimeCost: number | undefined = undefined;

    if (sessionType === SessionType.Fixed && typeof details === 'number') {
        const prepaidMinutes = details;
        endTime = now + prepaidMinutes * 60 * 1000;
        
        const rate = rates.find(r => r.id === selectedModule.rateId);
        if(rate) {
          fixedTimeCost = calculateFixedTimeCost(prepaidMinutes, rate);
        }

    } else if (sessionType === SessionType.Redeem && typeof details === 'number') {
        const redeemHours = details;
        endTime = now + redeemHours * 60 * 60 * 1000;
        fixedTimeCost = 0; // It's free

        if (clientId) {
            const pointsToDeduct = redeemHours * 10;
            setClients(prev => prev.map(c => c.id === clientId ? { ...c, points: c.points - pointsToDeduct } : c));
        }
    }

    setModules(prevModules => prevModules.map(m => 
      m.id === selectedModule.id 
      ? { 
          ...m, 
          status: ModuleStatus.Occupied, 
          startTime: now, 
          accountProducts: [],
          sessionType: sessionType,
          endTime: endTime,
          clientId: clientId || undefined,
          fixedTimeCost: fixedTimeCost,
        } 
      : m
    ));
    setIsStartSessionModalOpen(false);
    setSelectedModule(null);
  };

  const handleAddProductToAccount = (product: CartItem, quantity: number) => {
    if(!selectedModule) return;

    setModules(prevModules => prevModules.map(m => {
        if(m.id === selectedModule.id) {
            const existingProduct = m.accountProducts.find(p => p.id === product.id);
            let newAccountProducts;
            if (existingProduct) {
                newAccountProducts = m.accountProducts.map(p => p.id === product.id ? {...p, quantity: p.quantity + quantity } : p);
            } else {
                newAccountProducts = [...m.accountProducts, {...product, quantity }];
            }
            return {...m, accountProducts: newAccountProducts};
        }
        return m;
    }));
  };
  
  const handleOpenAddProductDirectly = (module: Module) => {
      setSelectedModule(module);
      setReturnToManageSession(false);
      setIsAddProductModalOpen(true);
  };

  const handleFinalizeSession = (module: Module, totalCost: number) => {
     setIsManageSessionModalOpen(false);
     setSaleToFinalize({ module, total: totalCost });
     setIsConfirmSaleModalOpen(true);
  };

  const handleFinalizeSale = (paymentMethod: any, saleData: any) => {
    if(!saleToFinalize) return;
    
    const { module, total } = saleToFinalize;

    // Decrement stock for products sold in the session
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        for (const soldItem of module.accountProducts) {
            // Find the product in the main list
            const productIndex = newProducts.findIndex(p => p.id === soldItem.id);
            if (productIndex !== -1) {
                const product = newProducts[productIndex];
                // Check if it's a real product (not a service) and manages inventory
                if (!soldItem.isService && product.managesInventory) {
                    newProducts[productIndex] = {
                        ...product,
                        stock: (product.stock || 0) - soldItem.quantity,
                    };
                }
            }
        }
        return newProducts;
    });

    addTransaction({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'Ingreso',
      description: `Cobro de ${module.name}`,
      client: clients.find(c => c.id === (module as any).clientId)?.name || 'N/A', // Assuming clientId is on module
      paymentMethod: paymentMethod,
      amount: saleData.netReceived,
    });
    
    const saleItems = [...module.accountProducts];
    const timeInSeconds = module.startTime ? (Date.now() - module.startTime) / 1000 : 0;
    const hours = Math.floor(timeInSeconds / 3600);
    if(hours > 0 && module.rateId){
      const client = clients.find(c => c.id === (module as any).clientId);
      if(client && module.type === ModuleType.Console){
        setClients(prev => prev.map(c => c.id === client.id ? {...c, points: c.points + hours} : c));
      }
    }


    const rentalItem: CartItem = {
      id: `time-${module.id}`,
      name: `Renta ${module.name}`,
      price: total - module.accountProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),
      quantity: 1,
      purchasePrice: 0,
    };
    saleItems.push(rentalItem);


    const saleRecord: SaleRecord = {
      folio: `F-${Date.now()}`,
      date: new Date().toISOString(),
      client: clients.find(c => c.id === (module as any).clientId)?.name || 'Venta al Público',
      paymentMethod: paymentMethod,
      items: saleItems,
      subtotal: saleData.subtotal,
      commission: saleData.commission,
      total: saleData.total,
    };

    onShowReceipt(saleRecord);
    onAddSaleToHistory(saleRecord);
    
    // Reset module
    setModules(prev => prev.map(m => m.id === module.id ? {...m, status: ModuleStatus.Available, startTime: undefined, accountProducts: [], finalCost: undefined, sessionType: undefined, endTime: undefined, clientId: undefined, fixedTimeCost: undefined} : m));

    setIsConfirmSaleModalOpen(false);
    setSaleToFinalize(null);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
        setModules(prev => prev.filter(m => m.id !== moduleToDelete.id));
        setModuleToDelete(null);
    }
  };

  const handleCloseModulesModal = () => {
    setIsModulesModalOpen(false);
    setEditingModuleId(null);
  };

  return (
    <div className="text-slate-800 dark:text-slate-200">
      {showBackupReminder && (
        <div className="bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6 flex justify-between items-center shadow-lg" role="alert">
            <div className="flex items-center">
                <WarningIcon className="h-6 w-6 mr-3 text-yellow-500"/>
                <div>
                    <p className="font-bold">Recordatorio de Respaldo</p>
                    <p className="text-sm">Han pasado más de 15 días desde tu último respaldo. ¡Mantén tus datos seguros!</p>
                </div>
            </div>
            <button 
                onClick={() => setActiveView('settings')} 
                className="ml-4 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold whitespace-nowrap transition-colors"
            >
                Hacer Respaldo
            </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-stretch gap-4">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl flex flex-col justify-center">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Ingresos del Día</p>
                    <button onClick={() => setIsIncomeVisible(!isIncomeVisible)} className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors">
                        {isIncomeVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200 text-center mt-1">
                    {isIncomeVisible ? `$${dailyIncome.toFixed(2)}` : '$ ****'}
                </p>
            </div>
            <button onClick={() => { setEditingModuleId(null); setIsModulesModalOpen(true); }} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors">
                <ComputerIcon className="w-5 h-5"/>
                <span>Gestionar Módulos</span>
            </button>
            <button onClick={() => setIsCashModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors">
              Movimiento de Caja
            </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Módulos ({modules.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              <ModuleCard 
                module={module} 
                onStartSession={handleOpenStartSession}
                onManageSession={handleOpenManageSession}
                onAddProduct={handleOpenAddProductDirectly}
                rate={rates.find(r => r.id === module.rateId)}
                onEdit={() => handleOpenEditModule(module)}
                onDelete={() => setModuleToDelete(module)}
              />
            </div>
          ))}
        </div>
      </div>

      <CashMovementModal 
          isOpen={isCashModalOpen} 
          onClose={() => setIsCashModalOpen(false)}
          addTransaction={addTransaction}
      />

      {isModulesModalOpen && (
        <ModulesConfigModal
          isOpen={isModulesModalOpen}
          onClose={handleCloseModulesModal}
          modules={modules}
          setModules={setModules}
          rates={rates}
          initialEditingId={editingModuleId}
        />
      )}
      
      {isStartSessionModalOpen && selectedModule && (
        <StartSessionModal 
          isOpen={isStartSessionModalOpen} 
          onClose={() => setIsStartSessionModalOpen(false)}
          module={selectedModule}
          clients={clients}
          rates={rates}
          onStart={handleStartSession}
          onAddNewClient={() => {
            setIsStartSessionModalOpen(false);
            setClientModalReturnTo('start');
            setIsAddClientModalOpen(true);
          }}
        />
      )}

      {isAddClientModalOpen && (
        <AddClientModal
          isOpen={isAddClientModalOpen}
          onClose={() => {
            setIsAddClientModalOpen(false);
            if (clientModalReturnTo === 'start') setIsStartSessionModalOpen(true);
            else if (clientModalReturnTo === 'confirm') setIsConfirmSaleModalOpen(true);
            setClientModalReturnTo(null);
          }}
          onSave={(newClient) => {
            setClients(prev => [...prev, { ...newClient, id: `c-${Date.now()}-${Math.random()}`, points: 0 }]);
            setIsAddClientModalOpen(false);
            if (clientModalReturnTo === 'start') setIsStartSessionModalOpen(true);
            else if (clientModalReturnTo === 'confirm') setIsConfirmSaleModalOpen(true);
            setClientModalReturnTo(null);
          }}
        />
      )}

      {isManageSessionModalOpen && selectedModule && (
        <ManageSessionModal
          isOpen={isManageSessionModalOpen}
          onClose={() => setIsManageSessionModalOpen(false)}
          module={selectedModule}
          rate={rates.find(r => r.id === selectedModule.rateId)}
          onAddProduct={() => {
            setIsManageSessionModalOpen(false);
            setReturnToManageSession(true);
            setIsAddProductModalOpen(true);
          }}
          onFinalizeSession={handleFinalizeSession}
        />
      )}

      {isAddProductModalOpen && selectedModule && (
        <AddProductToAccountModal
          isOpen={isAddProductModalOpen}
          onClose={() => {
            setIsAddProductModalOpen(false);
            if (returnToManageSession) {
                setIsManageSessionModalOpen(true);
            }
          }}
          onAddProduct={handleAddProductToAccount}
          products={products}
        />
      )}

      {isConfirmSaleModalOpen && saleToFinalize && (
          <ConfirmSaleModal
            isOpen={isConfirmSaleModalOpen}
            onClose={() => setIsConfirmSaleModalOpen(false)}
            totalAmount={saleToFinalize.total}
            clients={clients}
            onConfirm={handleFinalizeSale}
            onAddNewClient={() => {
                setIsConfirmSaleModalOpen(false);
                setClientModalReturnTo('confirm');
                setIsAddClientModalOpen(true);
            }}
          />
      )}

      {moduleToDelete && (
        <ConfirmDeleteModal
            isOpen={true}
            onClose={() => setModuleToDelete(null)}
            onConfirm={handleConfirmDelete}
            itemName={moduleToDelete.name}
        />
      )}
    </div>
  );
};

export default Dashboard;