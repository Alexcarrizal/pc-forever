import React, { useState } from 'react';
import { Client } from '../types';
import AddClientModal from './AddClientModal';
import { EditIcon, DeleteIcon } from './icons';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const Clients: React.FC<ClientsProps> = ({ clients, setClients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const handleAddClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  }

  const handleDeleteClient = (client: Client) => {
    if (client.id === 'c0') return; // Cannot delete "Cliente Mostrador"
    setDeletingClient(client);
  }

  const confirmDelete = () => {
    if (!deletingClient) return;
    setClients(prev => prev.filter(c => c.id !== deletingClient.id));
    setDeletingClient(null);
  }

  const handleSaveClient = (clientData: Omit<Client, 'id'>) => {
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
    } else {
      setClients(prev => [...prev, { id: `c-${Date.now()}-${Math.random()}`, ...clientData }]);
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Clientes</h1>
        <button
          onClick={handleAddClient}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          Agregar Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Teléfono</th>
                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Puntos</th>
                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{client.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{client.phone || 'N/A'}</td>
                  <td className={`p-4 font-bold ${client.points > 0 ? 'text-yellow-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {client.points}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-4 text-slate-400">
                      <button onClick={() => handleEditClient(client)} className="hover:text-blue-500 transition-colors">
                        <EditIcon className="w-5 h-5"/>
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client)} 
                        className={`transition-colors ${client.id === 'c0' ? 'cursor-not-allowed opacity-30' : 'hover:text-red-500'}`}
                        disabled={client.id === 'c0'}
                      >
                        <DeleteIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {(isModalOpen || editingClient) && (
        <AddClientModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
          existingClient={editingClient}
        />
      )}

      {deletingClient && (
        <ConfirmDeleteModal
            isOpen={true}
            onClose={() => setDeletingClient(null)}
            onConfirm={confirmDelete}
            itemName={deletingClient.name}
        />
      )}
    </div>
  );
};

export default Clients;
