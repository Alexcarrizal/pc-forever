import React, { useState, useMemo, useEffect } from 'react';
import { Service, TieredServicePricing, VolumeTier } from '../types';
import { DeleteIcon, EditIcon, XIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon, MinusCircleIcon } from './icons';

interface ServicesProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  tieredPricing: TieredServicePricing;
  setTieredPricing: React.Dispatch<React.SetStateAction<TieredServicePricing>>;
}

type SortKey = 'name' | 'cost';
type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

const Services: React.FC<ServicesProps> = ({ services, setServices, tieredPricing, setTieredPricing }) => {
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
    const [editingGeneralService, setEditingGeneralService] = useState<Service | null>(null);

    const [isFixedPrintModalOpen, setIsFixedPrintModalOpen] = useState(false);
    const [editingFixedPrintService, setEditingFixedPrintService] = useState<Service | null>(null);
    
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<Service | null>(null);

    const [fixedPrintSortConfig, setFixedPrintSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [procedureSortConfig, setProcedureSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [generalSortConfig, setGeneralSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

    const sortedFixedPrintServices = useMemo(() => {
        const sortableItems = [...(tieredPricing.fixedPrintServices || [])];
        sortableItems.sort((a, b) => {
            if (fixedPrintSortConfig.key === 'name') {
                return a.name.localeCompare(b.name) * (fixedPrintSortConfig.direction === 'asc' ? 1 : -1);
            } else { // cost
                const costA = a.cost ?? Infinity;
                const costB = b.cost ?? Infinity;
                if (costA === Infinity && costB === Infinity) return 0;
                return (costA - costB) * (fixedPrintSortConfig.direction === 'asc' ? 1 : -1);
            }
        });
        return sortableItems;
    }, [tieredPricing.fixedPrintServices, fixedPrintSortConfig]);
    
    const sortedProcedures = useMemo(() => {
        const sortableItems = [...(tieredPricing.procedures || [])];
        sortableItems.sort((a, b) => {
            if (procedureSortConfig.key === 'name') {
                return a.name.localeCompare(b.name) * (procedureSortConfig.direction === 'asc' ? 1 : -1);
            } else { // cost
                const costA = a.cost ?? Infinity;
                const costB = b.cost ?? Infinity;
                if (costA === Infinity && costB === Infinity) return 0;
                return (costA - costB) * (procedureSortConfig.direction === 'asc' ? 1 : -1);
            }
        });
        return sortableItems;
    }, [tieredPricing.procedures, procedureSortConfig]);

    const sortedGeneralServices = useMemo(() => {
        const sortableItems = [...services];
        sortableItems.sort((a, b) => {
            if (generalSortConfig.key === 'name') {
                return a.name.localeCompare(b.name) * (generalSortConfig.direction === 'asc' ? 1 : -1);
            } else { // cost
                const costA = a.cost ?? Infinity;
                const costB = b.cost ?? Infinity;
                if (costA === Infinity && costB === Infinity) return 0;
                return (costA - costB) * (generalSortConfig.direction === 'asc' ? 1 : -1);
            }
        });
        return sortableItems;
    }, [services, generalSortConfig]);

    const requestSort = (key: SortKey, type: 'fixedPrint' | 'general' | 'procedure') => {
        let config, setConfig;
        switch(type) {
            case 'fixedPrint':
                config = fixedPrintSortConfig;
                setConfig = setFixedPrintSortConfig;
                break;
            case 'procedure':
                config = procedureSortConfig;
                setConfig = setProcedureSortConfig;
                break;
            case 'general':
                config = generalSortConfig;
                setConfig = setGeneralSortConfig;
                break;
        }

        let direction: SortDirection = 'asc';
        if (config.key === key && config.direction === 'asc') {
            direction = 'desc';
        }
        setConfig({ key, direction });
    };

    const renderSortableHeader = (label: string, sortKey: SortKey, type: 'fixedPrint' | 'general' | 'procedure') => {
        let config;
        switch(type) {
            case 'fixedPrint': config = fixedPrintSortConfig; break;
            case 'procedure': config = procedureSortConfig; break;
            case 'general': config = generalSortConfig; break;
        }
        const isSorted = config.key === sortKey;
        const Icon = config.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
        return (
            <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <button onClick={() => requestSort(sortKey, type)} className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                    <span>{label}</span>
                    {isSorted && <Icon className="w-4 h-4" />}
                </button>
            </th>
        );
    };

    const handleSaveGeneralService = (serviceData: Omit<Service, 'id'>) => {
        if (editingGeneralService) {
            setServices(prev => prev.map(s => s.id === editingGeneralService.id ? { ...editingGeneralService, ...serviceData } : s));
        } else {
            setServices(prev => [...prev, { id: `serv-${Date.now()}`, ...serviceData }]);
        }
        setIsGeneralModalOpen(false);
        setEditingGeneralService(null);
    };

    const handleDeleteGeneralService = (serviceId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
            setServices(prev => prev.filter(s => s.id !== serviceId));
        }
    };

    const handleSaveFixedPrintService = (serviceData: Omit<Service, 'id'>) => {
        if (editingFixedPrintService) {
            setTieredPricing(prev => ({
                ...prev,
                fixedPrintServices: prev.fixedPrintServices.map(s => s.id === editingFixedPrintService.id ? { ...editingFixedPrintService, ...serviceData } : s)
            }));
        } else {
            setTieredPricing(prev => ({
                ...prev,
                fixedPrintServices: [...(prev.fixedPrintServices || []), { id: `fps-${Date.now()}`, ...serviceData }]
            }));
        }
        setIsFixedPrintModalOpen(false);
        setEditingFixedPrintService(null);
    };

    const handleDeleteFixedPrintService = (serviceId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este servicio de impresión?")) {
            setTieredPricing(prev => ({
                ...prev,
                fixedPrintServices: prev.fixedPrintServices.filter(s => s.id !== serviceId)
            }));
        }
    };
    
    const handleSaveProcedure = (serviceData: Omit<Service, 'id'>) => {
        if (editingProcedure) {
            setTieredPricing(prev => ({
                ...prev,
                procedures: (prev.procedures || []).map(s => s.id === editingProcedure.id ? { ...editingProcedure, ...serviceData } : s)
            }));
        } else {
            setTieredPricing(prev => ({
                ...prev,
                procedures: [...(prev.procedures || []), { id: `proc-${Date.now()}`, ...serviceData }]
            }));
        }
        setIsProcedureModalOpen(false);
        setEditingProcedure(null);
    };

    const handleDeleteProcedure = (serviceId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este trámite?")) {
            setTieredPricing(prev => ({
                ...prev,
                procedures: (prev.procedures || []).filter(s => s.id !== serviceId)
            }));
        }
    };

    const renderPrice = (service: Service) => {
        switch(service.pricingType) {
            case 'fixed':
                return `$${service.cost?.toFixed(2)}`;
            case 'volume':
                const minPrice = service.volumeTiers?.reduce((min, tier) => Math.min(min, tier.price), Infinity) || 0;
                return `Desde $${minPrice.toFixed(2)}`;
            case 'quote':
                return <span className="italic text-slate-400">A cotizar</span>;
            default:
                return 'N/A';
        }
    }


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Servicios</h1>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Servicios de Impresión/Copiado</h2>
                    <button onClick={() => { setEditingFixedPrintService(null); setIsFixedPrintModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">+ Agregar Servicio de Impresión</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                {renderSortableHeader('Nombre del Servicio', 'name', 'fixedPrint')}
                                {renderSortableHeader('Precio', 'cost', 'fixedPrint')}
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {sortedFixedPrintServices.map(service => (
                                <tr key={service.id}>
                                    <td className="p-3 font-medium text-slate-800 dark:text-white">{service.name}</td>
                                    <td className="p-3 text-slate-600 dark:text-slate-300">{renderPrice(service)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => { setEditingFixedPrintService(service); setIsFixedPrintModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><EditIcon /></button>
                                        <button onClick={() => handleDeleteFixedPrintService(service.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trámites</h2>
                    <button onClick={() => { setEditingProcedure(null); setIsProcedureModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">+ Agregar Trámite</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                {renderSortableHeader('Nombre del Trámite', 'name', 'procedure')}
                                {renderSortableHeader('Precio', 'cost', 'procedure')}
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {sortedProcedures.map(service => (
                                <tr key={service.id}>
                                    <td className="p-3 font-medium text-slate-800 dark:text-white">{service.name}</td>
                                    <td className="p-3 text-slate-600 dark:text-slate-300">{renderPrice(service)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => { setEditingProcedure(service); setIsProcedureModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><EditIcon /></button>
                                        <button onClick={() => handleDeleteProcedure(service.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Otros Servicios Generales</h2>
                    <button onClick={() => { setEditingGeneralService(null); setIsGeneralModalOpen(true); }} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg">+ Agregar Servicio General</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                {renderSortableHeader('Nombre del Servicio', 'name', 'general')}
                                {renderSortableHeader('Precio', 'cost', 'general')}
                                <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {sortedGeneralServices.map(service => (
                                <tr key={service.id}>
                                    <td className="p-3 font-medium text-slate-800 dark:text-white">{service.name}</td>
                                    <td className="p-3 text-slate-600 dark:text-slate-300">{renderPrice(service)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => { setEditingGeneralService(service); setIsGeneralModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><EditIcon /></button>
                                        <button onClick={() => handleDeleteGeneralService(service.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isGeneralModalOpen && (
                <ServiceModal
                    isOpen={isGeneralModalOpen}
                    onClose={() => setIsGeneralModalOpen(false)}
                    onSave={handleSaveGeneralService}
                    existingService={editingGeneralService}
                    title="Servicio General"
                />
            )}
            {isFixedPrintModalOpen && (
                <ServiceModal
                    isOpen={isFixedPrintModalOpen}
                    onClose={() => setIsFixedPrintModalOpen(false)}
                    onSave={handleSaveFixedPrintService}
                    existingService={editingFixedPrintService}
                    title="Servicio de Impresión"
                />
            )}
            {isProcedureModalOpen && (
                <ServiceModal
                    isOpen={isProcedureModalOpen}
                    onClose={() => setIsProcedureModalOpen(false)}
                    onSave={handleSaveProcedure}
                    existingService={editingProcedure}
                    title="Trámite"
                />
            )}
        </div>
    );
};

// Reusable Modal for adding/editing any type of fixed-price service
const ServiceModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: Omit<Service, 'id'>) => void,
    existingService: Service | null,
    title: string,
}> = ({ isOpen, onClose, onSave, existingService, title }) => {
    const [name, setName] = useState('');
    const [pricingType, setPricingType] = useState<'fixed' | 'volume' | 'quote'>('fixed');
    const [cost, setCost] = useState('');
    const [volumeTiers, setVolumeTiers] = useState<VolumeTier[]>([{ minQuantity: 1, price: 0 }]);
    const [exampleQty, setExampleQty] = useState('10');
    
    useEffect(() => {
        if(isOpen) {
            const type = existingService?.pricingType || 'fixed';
            setName(existingService?.name || '');
            setPricingType(type);
            setCost(type === 'fixed' && existingService?.cost !== undefined ? String(existingService.cost) : '');
            setVolumeTiers(type === 'volume' && existingService?.volumeTiers && existingService.volumeTiers.length > 0 ? existingService.volumeTiers : [{ minQuantity: 1, price: 0 }]);
        }
    }, [isOpen, existingService]);

    useEffect(() => {
        if (pricingType === 'volume') {
            const sortedTiers = [...volumeTiers].sort((a, b) => a.minQuantity - b.minQuantity);
            if (sortedTiers.length > 0 && sortedTiers[0].minQuantity !== 1) {
                sortedTiers[0].minQuantity = 1;
            }
            if (JSON.stringify(sortedTiers) !== JSON.stringify(volumeTiers)) {
                setVolumeTiers(sortedTiers);
            }
        }
    }, [volumeTiers, pricingType]);


    const handleSave = () => {
        if (!name) {
            alert('El nombre es obligatorio.');
            return;
        }
        
        let serviceData: Partial<Service> = { name, pricingType };
        if (pricingType === 'fixed') {
            serviceData.cost = parseFloat(cost) || 0;
        } else if (pricingType === 'volume') {
            serviceData.volumeTiers = volumeTiers;
        }

        onSave(serviceData as Omit<Service, 'id'>);
    };

    const handleTierChange = (index: number, field: keyof VolumeTier, value: string) => {
        const newTiers = [...volumeTiers];
        const numValue = field === 'minQuantity' ? parseInt(value) : parseFloat(value);
        newTiers[index] = { ...newTiers[index], [field]: isNaN(numValue) ? 0 : numValue };
        setVolumeTiers(newTiers);
    };

    const addTier = () => setVolumeTiers([...volumeTiers, { minQuantity: 0, price: 0 }]);
    const removeTier = (index: number) => setVolumeTiers(volumeTiers.filter((_, i) => i !== index));

    const getPriceForQuantity = (qty: number, tiers: VolumeTier[]): number => {
        if (!tiers || tiers.length === 0) return 0;
        const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
        for (const tier of sortedTiers) {
            if (qty >= tier.minQuantity) {
                return tier.price;
            }
        }
        return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity)[0]?.price || 0;
    };

    const numExampleQty = parseInt(exampleQty, 10) || 0;
    const examplePricePerUnit = getPriceForQuantity(numExampleQty, volumeTiers);
    const exampleTotal = examplePricePerUnit * numExampleQty;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg text-slate-900 dark:text-slate-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">{existingService ? 'Editar' : 'Agregar'} {title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Nombre del Servicio *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">Tipo de Precio</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['fixed', 'volume', 'quote'] as const).map(type => (
                                <button key={type} onClick={() => setPricingType(type)} className={`p-2 rounded-lg border-2 text-sm ${pricingType === type ? 'border-blue-500 bg-blue-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {type === 'fixed' ? 'Fijo' : type === 'volume' ? 'Por Volumen' : 'A cotizar'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {pricingType === 'fixed' && (
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Precio Fijo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$</span>
                                <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" className="w-full pl-7 pr-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
                            </div>
                        </div>
                    )}

                    {pricingType === 'volume' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block">Niveles de Precio por Volumen</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Define precios que disminuyen a medida que aumenta la cantidad.</p>
                            </div>
                            
                            <div className="space-y-3 pr-2 max-h-40 overflow-y-auto">
                                {volumeTiers.map((tier, index) => {
                                    const nextTierMin = volumeTiers[index + 1]?.minQuantity;
                                    const rangeEnd = nextTierMin ? nextTierMin - 1 : 'en adelante';
                                    const isFirstTier = index === 0;

                                    return (
                                        <div key={index} className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                {`Rango: ${tier.minQuantity} ${rangeEnd !== 'en adelante' && tier.minQuantity >= rangeEnd ? '' : `a ${rangeEnd}`} copias`}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs">A partir de (cant.)</label>
                                                    <input 
                                                        type="number" 
                                                        value={tier.minQuantity} 
                                                        readOnly={isFirstTier}
                                                        onChange={e => handleTierChange(index, 'minQuantity', e.target.value)} 
                                                        className={`w-full p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 ${isFirstTier ? 'opacity-70' : ''}`} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs">Precio por copia ($)</label>
                                                    <input 
                                                        type="number" 
                                                        value={tier.price} 
                                                        onChange={e => handleTierChange(index, 'price', e.target.value)} 
                                                        placeholder="Precio" 
                                                        className="w-full p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => removeTier(index)} 
                                                    disabled={isFirstTier}
                                                    className={`text-red-500 hover:text-red-700 mt-4 p-2 rounded-full ${isFirstTier ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-100 dark:hover:bg-red-900/50'}`}
                                                >
                                                    <MinusCircleIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={addTier} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <PlusIcon className="w-4 h-4" /> Agregar Rango de Precio
                            </button>

                            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h4 className="font-semibold text-sm mb-2">Calculadora de Ejemplo</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Si se piden</span>
                                    <input 
                                        type="number" 
                                        value={exampleQty}
                                        onChange={e => setExampleQty(e.target.value)}
                                        className="w-20 p-1.5 text-center bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"
                                    />
                                    <span className="text-sm">copias:</span>
                                </div>
                                <div className="mt-2 text-center bg-white dark:bg-slate-800 p-2 rounded-md">
                                    <p className="text-sm">Precio por copia: <span className="font-bold text-green-600 dark:text-green-400">${examplePricePerUnit.toFixed(2)}</span></p>
                                    <p className="font-bold">Total: <span className="font-bold text-blue-600 dark:text-blue-400">${exampleTotal.toFixed(2)}</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Guardar</button>
                </div>
            </div>
        </div>
    );
};

export default Services;