import React, { useState, useEffect, useMemo } from 'react';
import { ServiceOrder, Client, Technician, RepairCatalogItem, ServiceOrderStatus } from '../types';
import { XIcon, SearchIcon, PlusIcon } from './icons';

interface ServiceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: ServiceOrder) => void;
    orderData: ServiceOrder;
    clients: Client[];
    technicians: Technician[];
    repairCatalog: RepairCatalogItem[];
}

const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({ isOpen, onClose, onSave, orderData, clients, technicians, repairCatalog }) => {
    const [formData, setFormData] = useState<ServiceOrder>(orderData);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    useEffect(() => {
        setFormData(orderData);
        const client = clients.find(c => c.id === orderData.clientId);
        setClientSearch(client ? client.name : '');
    }, [orderData, clients]);

    const filteredClients = useMemo(() => {
        if (!clientSearch) return clients;
        return clients.filter(client =>
            client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            client.phone?.includes(clientSearch)
        );
    }, [clientSearch, clients]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };
    
    const handleClientSelect = (client: Client) => {
        setFormData(prev => ({ ...prev, clientId: client.id }));
        setClientSearch(client.name);
        setIsClientDropdownOpen(false);
    };

    const handleSave = () => {
        if (!formData.clientId) {
            alert('Por favor, seleccione un cliente.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold">{orderData.id ? `Editar Orden: ${orderData.id}` : 'Nueva Orden de Servicio'}</h2>
                        <p className="text-sm text-slate-500">Fecha de Ingreso: {new Date(formData.entryDate).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2 dark:border-slate-600">Información del Cliente y Equipo</h3>
                        
                        <div className="relative">
                            <label className="text-sm font-medium">Cliente *</label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={clientSearch}
                                    onChange={e => { setClientSearch(e.target.value); setIsClientDropdownOpen(true); }}
                                    onFocus={() => setIsClientDropdownOpen(true)}
                                    className="mt-1 w-full p-2 pl-10 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"
                                />
                            </div>
                            {isClientDropdownOpen && (
                                <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                    {filteredClients.map(client => (
                                        <li key={client.id} onClick={() => handleClientSelect(client)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                            {client.name} - {client.phone}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Tipo de Equipo</label>
                                <input type="text" name="equipmentType" value={formData.equipmentType} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Marca</label>
                                <input type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Modelo</label>
                                <input type="text" name="equipmentModel" value={formData.equipmentModel} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium">N° de Serie</label>
                                <input type="text" name="equipmentSerial" value={formData.equipmentSerial} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">PIN / Patrón de Desbloqueo</label>
                            <input type="text" name="equipmentPin" value={formData.equipmentPin || ''} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                        </div>
                    </div>

                     {/* Right Column */}
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2 dark:border-slate-600">Detalles del Servicio</h3>
                        <div>
                            <label className="text-sm font-medium">Problema Reportado por Cliente</label>
                            <textarea name="reportedProblem" value={formData.reportedProblem} onChange={handleChange} rows={3} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"></textarea>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Diagnóstico Técnico</label>
                            <textarea name="technicalDiagnosis" value={formData.technicalDiagnosis} onChange={handleChange} rows={3} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Estado</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600">
                                    {Object.values(ServiceOrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Técnico Asignado</label>
                                <select name="assignedTechnicianId" value={formData.assignedTechnicianId} onChange={handleChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600">
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Costo Estimado</label>
                                <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleCostChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Anticipo</label>
                                <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleCostChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Costo Final</label>
                                <input type="number" name="finalCost" value={formData.finalCost} onChange={handleCostChange} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-medium">Observaciones</label>
                            <textarea name="observations" value={formData.observations} onChange={handleChange} rows={2} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"></textarea>
                        </div>
                    </div>

                    {/* History Section (Spans both columns if needed) */}
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-lg border-b pb-2 dark:border-slate-600">Historial de la Orden</h3>
                        <ul className="text-sm text-slate-500 dark:text-slate-400 mt-2 space-y-1 max-h-24 overflow-y-auto">
                            {formData.history.map((item, index) => (
                                <li key={index}>
                                    <span className="font-semibold">{new Date(item.date).toLocaleString()}:</span> {item.change} (por {item.user})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Guardar Orden</button>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderModal;
