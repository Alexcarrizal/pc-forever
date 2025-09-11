import React, { useState, useMemo } from 'react';
import { ServiceOrder, Client, Technician, ServiceOrderStatus, RepairCatalogItem } from '../types';
import StatCard from './StatCard';
import ServiceOrderModal from './ServiceOrderModal';
import { PlusIcon, EyeIcon, SearchIcon, EditIcon } from './icons';

interface ServiceOrdersProps {
  serviceOrders: ServiceOrder[];
  setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  clients: Client[];
  technicians: Technician[];
  repairCatalog: RepairCatalogItem[];
}

const statusStyles: Record<ServiceOrderStatus, string> = {
    [ServiceOrderStatus.EnRevision]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [ServiceOrderStatus.Aprobado]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [ServiceOrderStatus.EnReparacion]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    [ServiceOrderStatus.Reparado]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [ServiceOrderStatus.NoReparado]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    [ServiceOrderStatus.Entregado]: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    [ServiceOrderStatus.Cancelado]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};


const ServiceOrders: React.FC<ServiceOrdersProps> = ({ serviceOrders, setServiceOrders, clients, technicians, repairCatalog }) => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | ServiceOrderStatus>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<ServiceOrder | null>(null);
    
    const stats = useMemo(() => {
        return {
            open: serviceOrders.filter(o => ![ServiceOrderStatus.Entregado, ServiceOrderStatus.Cancelado].includes(o.status)).length,
            repaired: serviceOrders.filter(o => o.status === ServiceOrderStatus.Reparado).length,
            delivered: serviceOrders.filter(o => o.status === ServiceOrderStatus.Entregado).length,
        }
    }, [serviceOrders]);

    const filteredOrders = useMemo(() => {
        let orders = [...serviceOrders].sort((a,b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        if (statusFilter === 'all') return orders;
        if (statusFilter === 'open') {
            return orders.filter(o => ![ServiceOrderStatus.Entregado, ServiceOrderStatus.Cancelado].includes(o.status));
        }
        return orders.filter(o => o.status === statusFilter);
    }, [serviceOrders, statusFilter]);

    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';

    const handleAddNewOrder = () => {
        const newIdNumber = (serviceOrders.length > 0) ? Math.max(...serviceOrders.map(o => parseInt(o.id.split('-')[1]))) + 1 : 1;
        const newOrder: ServiceOrder = {
            id: `ORD-${String(newIdNumber).padStart(3, '0')}`,
            clientId: clients.length > 0 ? clients[0].id : '',
            equipmentType: '',
            equipmentBrand: '',
            equipmentModel: '',
            equipmentSerial: '',
            entryDate: new Date().toISOString(),
            reportedProblem: '',
            technicalDiagnosis: '',
            status: ServiceOrderStatus.EnRevision,
            estimatedCost: 0,
            finalCost: 0,
            advancePayment: 0,
            observations: '',
            assignedTechnicianId: technicians.length > 0 ? technicians[0].id : '',
            history: [{ date: new Date().toISOString(), change: 'Orden creada', user: 'Recepcionista' }],
        };
        setCurrentOrder(newOrder);
        setIsModalOpen(true);
    };

    const handleEditOrder = (order: ServiceOrder) => {
        setCurrentOrder(order);
        setIsModalOpen(true);
    };
    
    const handleSaveOrder = (orderToSave: ServiceOrder) => {
        const exists = serviceOrders.some(o => o.id === orderToSave.id);
        if (exists) {
            setServiceOrders(prev => prev.map(o => o.id === orderToSave.id ? orderToSave : o));
        } else {
            setServiceOrders(prev => [...prev, orderToSave]);
        }
        setIsModalOpen(false);
        setCurrentOrder(null);
    };
    
    return (
        <div className="text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Órdenes de Servicio</h1>
                <button 
                  onClick={handleAddNewOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Nueva Orden
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Todas" value={serviceOrders.length} color="blue" isClickable onClick={() => setStatusFilter('all')} isActive={statusFilter === 'all'} />
                <StatCard title="Abiertas" value={stats.open} color="yellow" isClickable onClick={() => setStatusFilter('open')} isActive={statusFilter === 'open'} />
                <StatCard title="Reparadas" value={stats.repaired} color="blue" isClickable onClick={() => setStatusFilter(ServiceOrderStatus.Reparado)} isActive={statusFilter === ServiceOrderStatus.Reparado} />
                <StatCard title="Entregadas" value={stats.delivered} color="green" isClickable onClick={() => setStatusFilter(ServiceOrderStatus.Entregado)} isActive={statusFilter === ServiceOrderStatus.Entregado} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                {['ID', 'Cliente', 'Equipo', 'Ingreso', 'Estado', 'Costo Final', 'Acciones'].map(h =>
                                    <th key={h} className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                           {filteredOrders.map(order => (
                               <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                   <td className="p-4 font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">{order.id}</td>
                                   <td className="p-4 text-sm font-medium text-slate-800 dark:text-white">{getClientName(order.clientId)}</td>
                                   <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{order.equipmentBrand} {order.equipmentModel}</td>
                                   <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{new Date(order.entryDate).toLocaleDateString()}</td>
                                   <td className="p-4 text-sm">
                                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status]}`}>
                                           {order.status}
                                       </span>
                                   </td>
                                   <td className="p-4 text-sm font-semibold text-slate-800 dark:text-white">${order.finalCost.toFixed(2)}</td>
                                   <td className="p-4">
                                       <div className="flex items-center gap-4 text-slate-400">
                                            <button className="hover:text-blue-500 transition-colors" title="Ver Detalles">
                                                <EyeIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleEditOrder(order)} className="hover:text-yellow-500 transition-colors" title="Editar">
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            {isModalOpen && currentOrder && (
                <ServiceOrderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveOrder}
                    orderData={currentOrder}
                    clients={clients}
                    technicians={technicians}
                    repairCatalog={repairCatalog}
                />
            )}
        </div>
    );
};

export default ServiceOrders;