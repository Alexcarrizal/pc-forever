import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PointOfSale from './components/PointOfSale';
import Clients from './components/Clients';
import Products from './components/Products';
import Services from './components/Services';
import Settings from './components/Settings';
import InitialSetup from './components/InitialSetup';
import PinLogin from './components/PinLogin';
import CashRegisterOpening from './components/CashRegisterOpening';
import Reports from './components/Reports';
import SalesAnalysis from './components/SalesAnalysis';
import Cashbox from './components/Cashbox';
import CloseCashboxModal from './components/CloseCashboxModal';
import ReceiptModal from './components/ReceiptModal';
import Recharges from './components/Recharges';
import WeeklyDeposits from './components/WeeklyDeposits';
import { initialData } from './components/initialData';


import { 
  Module, Client, Product, Category, RateType, BusinessInfo, Apartado,
  CashFlowTransaction, PaymentMethod, SaleRecord, CreditCard, DebitCard,
  ModuleStatus, ModuleType, Service, TieredServicePricing, View, Theme,
  ElectronicRecharge
} from './types';

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Reset time to start of day
    const day = d.getDay(); // Sunday = 0, ..., Saturday = 6
    const diff = (day + 1) % 7; 
    d.setDate(d.getDate() - diff);
    return d;
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};


const sanitizeData = (key: string, data: any, fallback: any) => {
    if (data === null || typeof data === 'undefined') {
        return fallback;
    }

    if (Array.isArray(data)) {
        switch (key) {
            case 'modules':
                return data.map(item => ({
                    rateId: '',
                    ...item,
                    accountProducts: item.accountProducts || [],
                    type: item.type || ModuleType.PC,
                    status: item.status || ModuleStatus.Available,
                }));
            case 'rates':
                return data.map(item => ({
                    ...item,
                    tiers: item.tiers || [],
                }));
            case 'clients':
                return data.map(item => ({
                    ...item,
                    points: item.points || 0,
                    visitCount: item.visitCount || 0,
                    email: item.email || '',
                }));
            case 'products':
                return data.map(item => ({
                    ...item,
                    hasWarranty: item.hasWarranty || false,
                    managesInventory: item.managesInventory || false,
                    stock: item.stock || 0,
                    purchasePrice: item.purchasePrice || 0,
                    salePrice: item.salePrice || 0,
                }));
            case 'salesHistory':
            case 'fullSalesHistory': // Sanitize full history too
                return data.map(item => ({
                    ...item,
                    items: item.items || [],
                }));
            default:
                return data;
        }
    }
    
    if (typeof data === 'object' && !Array.isArray(data)) {
        if (key === 'businessInfo') {
            return {
                name: data.name || '',
                website: data.website || '',
                whatsapp: data.whatsapp || '',
                address: data.address || '',
                technicians: data.technicians || [],
            };
        }
        if (key === 'tieredPricing') {
            const sanitized = {
                fixedPrintServices: data.fixedPrintServices || [],
                procedures: data.procedures || [],
            };
            return sanitized;
        }
    }


    return data;
};


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ name: string; pin: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCashboxOpen, setIsCashboxOpen] = useState(false);
  
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [installPrompt, setInstallPrompt] = useState<any>(null);


  // App State
  const [modules, setModules] = useState<Module[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [tieredPricing, setTieredPricing] = useState<TieredServicePricing>({ fixedPrintServices: [], procedures: [] });
  const [categories, setCategories] = useState<Category[]>([]);
  const [rates, setRates] = useState<RateType[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({ name: '', website: '', whatsapp: '', address: '', technicians: [] });
  const [cashFlow, setCashFlow] = useState<CashFlowTransaction[]>([]);
  const [receiptData, setReceiptData] = useState<SaleRecord | null>(null);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [debitCards, setDebitCards] = useState<DebitCard[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [fullSalesHistory, setFullSalesHistory] = useState<SaleRecord[]>([]);
  const [apartados, setApartados] = useState<Apartado[]>([]);
  const [electronicRecharges, setElectronicRecharges] = useState<ElectronicRecharge[]>([]);
  
  const [isCloseCashboxModalOpen, setIsCloseCashboxModalOpen] = useState(false);
  const [closingBalance, setClosingBalance] = useState<number | null>(null);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [lastClosingBalance, setLastClosingBalance] = useState<number | null>(null);
  const [isIncomeVisible, setIsIncomeVisible] = useState(true);
  
  useEffect(() => {
    const handler = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  // Check for backup reminder on load
  useEffect(() => {
      const lastBackup = localStorage.getItem('lastBackupDate');
      if (!lastBackup) {
          setShowBackupReminder(true);
      } else {
          const lastBackupDate = new Date(lastBackup);
          const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastBackupDate.getTime() > fifteenDaysInMs) {
              setShowBackupReminder(true);
          }
      }
  }, []);


  const handleInstallClick = () => {
      if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
              if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
              } else {
                  console.log('User dismissed the install prompt');
              }
              setInstallPrompt(null);
          });
      }
  };
  
  const handleBackupComplete = useCallback(() => {
    const today = new Date().toISOString();
    localStorage.setItem('lastBackupDate', today);
    setShowBackupReminder(false);
    alert('Respaldo completado. ¡Gracias por mantener tus datos seguros!');
  }, []);

  const addTransaction = useCallback((transaction: CashFlowTransaction) => {
    setCashFlow(prevCashFlow => [...prevCashFlow, transaction]);
  }, []);

  // Auth & Setup Flow
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }

      const storedCashboxStatus = localStorage.getItem('cashboxOpen');
      const lastCashboxDate = localStorage.getItem('cashboxDate');
      const today = new Date().toLocaleDateString();

      if (storedCashboxStatus === 'true' && lastCashboxDate === today) {
        setIsLoggedIn(true);
        setIsCashboxOpen(true);
      } else if (storedCashboxStatus === 'true' && lastCashboxDate !== today) {
        setIsCashboxOpen(false);
        localStorage.setItem('cashboxOpen', 'false');
      }
      
      const storedLastBalance = localStorage.getItem('lastClosingBalance');
      if (storedLastBalance) {
          setLastClosingBalance(parseFloat(storedLastBalance));
      }

    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    }
  }, []);

  const handleSetupComplete = (name: string, pin: string) => {
    const newAdmin = { name, pin };
    setAdmin(newAdmin);
    localStorage.setItem('admin', JSON.stringify(newAdmin));
  };
  
  const handleLogin = () => setIsLoggedIn(true);

  const handleCashboxOpen = (openingAmount: number) => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('cashboxOpen', 'true');
    localStorage.setItem('cashboxDate', today);
    localStorage.removeItem('lastClosingBalance'); // Clear it once used/skipped
    setLastClosingBalance(null);

    const openingTransaction: CashFlowTransaction = {
        id: `cf-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'Apertura',
        description: 'Apertura de caja',
        client: null,
        paymentMethod: 'Manual',
        amount: openingAmount,
    };
    addTransaction(openingTransaction);
    setIsCashboxOpen(true);
  };

  const handleOpenCloseModal = () => {
    const today = new Date();
    const dailyTransactions = cashFlow.filter(t => isSameDay(new Date(t.date), today));
    
    const lastOpeningIndex = dailyTransactions.map(t => t.type).lastIndexOf('Apertura');
    const currentSessionTransactions = lastOpeningIndex !== -1 ? dailyTransactions.slice(lastOpeningIndex) : dailyTransactions;

    const income = currentSessionTransactions.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
    const outcome = currentSessionTransactions.filter(t => t.type === 'Salida').reduce((sum, t) => sum + t.amount, 0);
    const opening = currentSessionTransactions.find(t => t.type === 'Apertura')?.amount || 0;
    const finalBalance = opening + income - outcome;

    setClosingBalance(finalBalance);
    setIsCloseCashboxModalOpen(true);
  };

  const handleCloseCashbox = (countedBalance: number) => {
    if (closingBalance === null) {
        console.error("Attempted to close cashbox without a system balance calculated.");
        return;
    }
    const difference = countedBalance - closingBalance;

    const closingTransaction: CashFlowTransaction = {
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'Cierre',
      description: `Cierre de caja. Sistema: $${closingBalance.toFixed(2)}, Contado: $${countedBalance.toFixed(2)}, Diferencia: $${difference.toFixed(2)}`,
      client: null,
      paymentMethod: 'Manual',
      amount: closingBalance, // Log the system balance
    };
    
    addTransaction(closingTransaction);

    localStorage.setItem('cashboxOpen', 'false');
    localStorage.removeItem('cashboxDate');
    localStorage.setItem('lastClosingBalance', countedBalance.toString());
    setLastClosingBalance(countedBalance);
    
    setIsCashboxOpen(false);
    setIsLoggedIn(false);
    setIsCloseCashboxModalOpen(false);
    setClosingBalance(null);
  };


  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Data loading from localStorage
  useEffect(() => {
    const loadData = () => {
        const lastWeeklyReset = localStorage.getItem('lastWeeklyReset');
        const today = new Date();
        const startOfThisWeek = getStartOfWeek(today);

        let needsWeeklyReset = true;
        if (lastWeeklyReset) {
            const lastResetDate = new Date(lastWeeklyReset);
            if (startOfThisWeek.getTime() <= getStartOfWeek(lastResetDate).getTime()) {
                needsWeeklyReset = false;
            }
        }
        
        const isInitialized = localStorage.getItem('app_initialized_flag') === 'true';

        if (!isInitialized) {
            console.log("First time setup: loading initial data.");
            const initialStates = {
                modules: initialData.modules, clients: initialData.clients, products: initialData.products,
                categories: initialData.categories, rates: initialData.rates, businessInfo: initialData.businessInfo,
                creditCards: initialData.creditCards, debitCards: initialData.debitCards, apartados: initialData.apartados,
                salesHistory: [], fullSalesHistory: [], cashFlow: [], services: initialData.services, tieredPricing: initialData.tieredPricing,
                electronicRecharges: initialData.electronicRecharges,
            };

            Object.entries(initialStates).forEach(([key, data]) => {
                localStorage.setItem(key, JSON.stringify(data));
            });
            localStorage.setItem('app_initialized_flag', 'true');
            // Set state from initial data
            setModules(initialStates.modules); setClients(initialStates.clients); setProducts(initialStates.products);
            setCategories(initialStates.categories); setRates(initialStates.rates); setBusinessInfo(initialStates.businessInfo);
            setCreditCards(initialStates.creditCards); setDebitCards(initialStates.debitCards); setApartados(initialStates.apartados);
            setSalesHistory(initialStates.salesHistory); setFullSalesHistory(initialStates.fullSalesHistory); setCashFlow(initialStates.cashFlow);
            setServices(initialStates.services); setTieredPricing(initialStates.tieredPricing);
            setElectronicRecharges(initialStates.electronicRecharges);
        } else {
            console.log("Loading data from localStorage with sanitization.");
            const dataMapping: { key: string; setter: (data: any) => void; fallback: any; }[] = [
                { key: 'modules', setter: setModules, fallback: initialData.modules },
                { key: 'clients', setter: setClients, fallback: initialData.clients },
                { key: 'products', setter: setProducts, fallback: initialData.products },
                { key: 'categories', setter: setCategories, fallback: initialData.categories },
                { key: 'rates', setter: setRates, fallback: initialData.rates },
                { key: 'businessInfo', setter: setBusinessInfo, fallback: initialData.businessInfo },
                { key: 'creditCards', setter: setCreditCards, fallback: initialData.creditCards },
                { key: 'debitCards', setter: setDebitCards, fallback: initialData.debitCards },
                { key: 'salesHistory', setter: setSalesHistory, fallback: [] },
                { key: 'fullSalesHistory', setter: setFullSalesHistory, fallback: [] },
                { key: 'cashFlow', setter: setCashFlow, fallback: [] },
                { key: 'apartados', setter: setApartados, fallback: initialData.apartados },
                { key: 'services', setter: setServices, fallback: initialData.services },
                { key: 'tieredPricing', setter: setTieredPricing, fallback: initialData.tieredPricing },
                { key: 'electronicRecharges', setter: setElectronicRecharges, fallback: [] },
            ];
            
            dataMapping.forEach(({ key, setter, fallback }) => {
                let dataToSet = fallback;
                const storedValue = localStorage.getItem(key);
                if (storedValue) {
                    try {
                        const parsedData = JSON.parse(storedValue);
                        dataToSet = sanitizeData(key, parsedData, fallback);
                    } catch (e) {
                        console.error(`Failed to parse/sanitize localStorage key "${key}". Using fallback.`, e);
                    }
                }
                
                if (needsWeeklyReset && (key === 'salesHistory' || key === 'cashFlow' || key === 'electronicRecharges')) {
                    setter([]);
                    localStorage.setItem(key, '[]');
                    if(key === 'salesHistory') localStorage.setItem('lastWeeklyReset', today.toISOString());
                } else {
                    setter(dataToSet);
                }
            });
        }
        setIsLoading(false);
    };
    loadData();
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    if (isLoading) return;
    
    const dataMapping = {
      'modules': modules,
      'clients': clients,
      'products': products,
      'categories': categories,
      'rates': rates,
      'businessInfo': businessInfo,
      'cashFlow': cashFlow,
      'creditCards': creditCards,
      'debitCards': debitCards,
      'salesHistory': salesHistory,
      'fullSalesHistory': fullSalesHistory,
      'apartados': apartados,
      'services': services,
      'tieredPricing': tieredPricing,
      'electronicRecharges': electronicRecharges,
    };

    Object.entries(dataMapping).forEach(([key, data]) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Could not save key "${key}" to localStorage`, error);
        }
    });
  }, [
      isLoading, modules, clients, products, categories, rates, businessInfo, 
      cashFlow, creditCards, debitCards, salesHistory, fullSalesHistory, apartados, services, tieredPricing,
      electronicRecharges
  ]);

  const removeTransaction = useCallback((id: string) => {
    setCashFlow(prevCashFlow => prevCashFlow.filter(t => t.id !== id));
  }, []);

  const handleShowReceipt = useCallback((data: SaleRecord) => {
    setReceiptData(data);
  }, []);
  
  const handleCloseReceipt = () => setReceiptData(null);
  
  const handleSaveBusinessInfo = useCallback((info: BusinessInfo) => {
    setBusinessInfo(info);
  }, []);

  const handleAddSaleToHistory = useCallback((sale: SaleRecord) => {
    setSalesHistory(prev => [...prev, sale]);
    setFullSalesHistory(prev => [...prev, sale]);
  }, []);

  const handleSaveApartado = useCallback((apartado: Omit<Apartado, 'id'>) => {
    setApartados(prev => [...prev, {id: `ap-${Date.now()}`, ...apartado}]);
  }, []);

  const handleUpdateApartado = useCallback((updatedApartado: Apartado) => {
    setApartados(prev => prev.map(ap => ap.id === updatedApartado.id ? updatedApartado : ap));
  }, []);

  const handleDeleteApartado = useCallback((id: string) => {
      if (window.confirm("¿Estás seguro de que quieres eliminar este apartado?")) {
          setApartados(prev => prev.filter(ap => ap.id !== id));
      }
  }, []);


  const handleResetWeeklyReport = useCallback(() => {
    if (window.confirm("¿Estás seguro de que quieres reiniciar el reporte semanal? Se borrará el historial de ventas y el flujo de caja. Esta acción no se puede deshacer.")) {
        setSalesHistory([]);
        setCashFlow([]);
        setElectronicRecharges([]);
        localStorage.setItem('salesHistory', '[]');
        localStorage.setItem('cashFlow', '[]');
        localStorage.setItem('electronicRecharges', '[]');
        localStorage.setItem('lastWeeklyReset', new Date().toISOString());
        alert("El reporte semanal ha sido reiniciado.");
    }
  }, []);

  const handleRestoreAllData = useCallback((data: Record<string, any>) => {
    const dataMapping = [
        { key: 'modules', setter: setModules, default: initialData.modules },
        { key: 'clients', setter: setClients, default: initialData.clients },
        { key: 'products', setter: setProducts, default: initialData.products },
        { key: 'categories', setter: setCategories, default: initialData.categories },
        { key: 'rates', setter: setRates, default: initialData.rates },
        { key: 'businessInfo', setter: setBusinessInfo, default: initialData.businessInfo },
        { key: 'creditCards', setter: setCreditCards, default: initialData.creditCards },
        { key: 'debitCards', setter: setDebitCards, default: initialData.debitCards },
        { key: 'salesHistory', setter: setSalesHistory, default: [] },
        { key: 'fullSalesHistory', setter: setFullSalesHistory, default: [] },
        { key: 'cashFlow', setter: setCashFlow, default: [] },
        { key: 'apartados', setter: setApartados, default: initialData.apartados },
        { key: 'services', setter: setServices, default: initialData.services },
        { key: 'tieredPricing', setter: setTieredPricing, default: initialData.tieredPricing },
        { key: 'electronicRecharges', setter: setElectronicRecharges, default: [] },
    ];
    
    dataMapping.forEach(({ key, setter, default: fallback }) => {
        const restored = sanitizeData(key, data[key], fallback);
        setter(restored);
        localStorage.setItem(key, JSON.stringify(restored));
    });

    if (data.admin) {
        setAdmin(data.admin);
        localStorage.setItem('admin', JSON.stringify(data.admin));
    }

    alert("Datos restaurados con éxito. La aplicación se recargará.");
    setTimeout(() => window.location.reload(), 500);
  }, []);


  const renderApp = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">Cargando aplicación...</p>
        </div>
      );
    }
    if (!admin) {
      return <InitialSetup onSetupComplete={handleSetupComplete} />;
    }
    if (!isLoggedIn) {
      return <PinLogin admin={admin} onLogin={handleLogin} />;
    }
    if (!isCashboxOpen) {
      return <CashRegisterOpening onCashboxOpen={handleCashboxOpen} lastClosingBalance={lastClosingBalance} />;
    }
    
    const renderContent = () => {
      switch (activeView) {
        case 'dashboard':
          return <Dashboard modules={modules} setModules={setModules} clients={clients} setClients={setClients} rates={rates} addTransaction={addTransaction} onShowReceipt={handleShowReceipt} products={products} setProducts={setProducts} onAddSaleToHistory={handleAddSaleToHistory} salesHistory={salesHistory} cashFlow={cashFlow} showBackupReminder={showBackupReminder} setActiveView={setActiveView} isIncomeVisible={isIncomeVisible} setIsIncomeVisible={setIsIncomeVisible} />;
        case 'pos':
          return <PointOfSale products={products} setProducts={setProducts} services={services} tieredPricing={tieredPricing} clients={clients} setClients={setClients} onShowReceipt={handleShowReceipt} addTransaction={addTransaction} onAddSaleToHistory={handleAddSaleToHistory} fullSalesHistory={fullSalesHistory}/>;
        case 'recharges':
          return <Recharges recharges={electronicRecharges} setRecharges={setElectronicRecharges} addTransaction={addTransaction} />;
        case 'reports':
          return <Reports 
                    salesHistory={salesHistory} 
                    cashFlow={cashFlow} 
                    creditCards={creditCards} 
                    setCreditCards={setCreditCards} 
                    debitCards={debitCards} 
                    setDebitCards={setDebitCards} 
                    apartados={apartados} 
                    onSaveApartado={handleSaveApartado}
                    onUpdateApartado={handleUpdateApartado}
                    onDeleteApartado={handleDeleteApartado}
                    addTransaction={addTransaction}
                    electronicRecharges={electronicRecharges}
                 />;
        case 'weeklyDeposits':
            return <WeeklyDeposits 
                salesHistory={salesHistory}
                cashFlow={cashFlow}
                apartados={apartados}
                creditCards={creditCards}
                debitCards={debitCards}
                electronicRecharges={electronicRecharges}
            />;
        case 'salesAnalysis':
          return <SalesAnalysis salesHistory={fullSalesHistory} />;
        case 'cashbox':
          return <Cashbox cashFlow={cashFlow} removeTransaction={removeTransaction} onOpenCloseModal={handleOpenCloseModal} />;
        case 'clients':
          return <Clients clients={clients} setClients={setClients} />;
        case 'products':
          return <Products products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} />;
        case 'services':
          return <Services services={services} setServices={setServices} tieredPricing={tieredPricing} setTieredPricing={setTieredPricing} />;
        case 'settings':
          return <Settings 
                    rates={rates} 
                    setRates={setRates} 
                    businessInfo={businessInfo} 
                    onSaveBusinessInfo={handleSaveBusinessInfo} 
                    onResetWeeklyReport={handleResetWeeklyReport}
                    allData={{
                        admin, modules, clients, products, categories, rates, businessInfo,
                        cashFlow, creditCards, debitCards, salesHistory, fullSalesHistory, apartados, services, tieredPricing,
                        electronicRecharges,
                    }}
                    onRestoreAllData={handleRestoreAllData}
                    onBackupComplete={handleBackupComplete}
                 />;
        default:
          return <Dashboard modules={modules} setModules={setModules} clients={clients} setClients={setClients} rates={rates} addTransaction={addTransaction} onShowReceipt={handleShowReceipt} products={products} setProducts={setProducts} onAddSaleToHistory={handleAddSaleToHistory} salesHistory={salesHistory} cashFlow={cashFlow} showBackupReminder={showBackupReminder} setActiveView={setActiveView} isIncomeVisible={isIncomeVisible} setIsIncomeVisible={setIsIncomeVisible} />;
      }
    };

    return (
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            theme={theme} 
            setTheme={setTheme} 
            installPrompt={installPrompt}
            onInstallClick={handleInstallClick}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderContent()}
        </main>
        {receiptData && <ReceiptModal isOpen={!!receiptData} onClose={handleCloseReceipt} saleData={receiptData} businessInfo={businessInfo} />}
        {isCloseCashboxModalOpen && closingBalance !== null && (
            <CloseCashboxModal
                isOpen={isCloseCashboxModalOpen}
                onClose={() => {
                  setIsCloseCashboxModalOpen(false);
                  setClosingBalance(null);
                }}
                onConfirmClose={handleCloseCashbox}
                systemBalance={closingBalance}
            />
        )}
      </div>
    );
  };
  
  return renderApp();
};

export default App;
