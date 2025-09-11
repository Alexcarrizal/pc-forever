import React, { useState, useEffect } from 'react';
import { Module, ModuleStatus, ModuleType, RateType } from '../types';
import { XIcon, EditIcon, DeleteIcon, ComputerIcon, PlusIcon, CheckIcon } from './icons';

// A dedicated form for adding a new module, shown at the top.
const AddModuleForm: React.FC<{
    rates: RateType[];
    onSave: (data: { name: string; type: ModuleType; rateId: string }) => void;
    onCancel: () => void;
}> = ({ rates, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ModuleType>(ModuleType.PC);
    const [rateId, setRateId] = useState<string>(rates.length > 0 ? rates[0].id : '');

    const handleSaveClick = () => {
        if (!name || !rateId) {
            alert("Nombre y tarifa son obligatorios.");
            return;
        }
        onSave({ name, type, rateId });
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border-2 border-dashed border-blue-500 mb-6 transition-all duration-300 md:col-span-2">
            <h3 className="font-bold text-lg mb-4">Agregar Nuevo Módulo</h3>
            <div className="space-y-3">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del Módulo (ej. PC-07)" className="w-full p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                <select value={type} onChange={e => setType(e.target.value as ModuleType)} className="w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-600">
                    <option value={ModuleType.PC}>PC</option>
                    <option value={ModuleType.Console}>Consola</option>
                </select>
                <select value={rateId} onChange={e => setRateId(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-600">
                    <option value="" disabled>Seleccione tarifa</option>
                    {rates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <div className="flex gap-2 pt-2">
                    <button onClick={onCancel} className="w-full py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                    <button onClick={handleSaveClick} className="w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">Guardar Módulo</button>
                </div>
            </div>
        </div>
    );
};

interface ModulesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  rates: RateType[];
  initialEditingId?: string | null;
}

const ModulesConfigModal: React.FC<ModulesConfigModalProps> = ({ isOpen, onClose, modules, setModules, rates, initialEditingId }) => {
    const [localModules, setLocalModules] = useState<Module[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<{ name: string; type: ModuleType; rateId: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalModules(JSON.parse(JSON.stringify(modules)));
            if (initialEditingId) {
                const moduleToEdit = modules.find(m => m.id === initialEditingId);
                if (moduleToEdit) {
                    setEditingModuleId(initialEditingId);
                    setEditFormData({
                        name: moduleToEdit.name,
                        type: moduleToEdit.type,
                        rateId: moduleToEdit.rateId || (rates.length > 0 ? rates[0].id : ''),
                    });
                }
            } else {
                 setEditingModuleId(null);
                 setEditFormData(null);
                 setIsAdding(false);
            }
        }
    }, [isOpen, modules, initialEditingId, rates]);


    if (!isOpen) return null;

    const handleSaveAll = () => {
        setModules(localModules);
        onClose();
    };

    const handleAddModule = (data: { name: string; type: ModuleType; rateId: string }) => {
        const newModule: Module = {
            id: `mod-${Date.now()}`,
            name: data.name,
            type: data.type,
            status: ModuleStatus.Available,
            rateId: data.rateId,
            accountProducts: [],
        };
        setLocalModules(prev => [...prev, newModule]);
        setIsAdding(false);
    };

    const handleStartEdit = (module: Module) => {
        setIsAdding(false);
        setEditingModuleId(module.id);
        setEditFormData({
            name: module.name,
            type: module.type,
            rateId: module.rateId || (rates.length > 0 ? rates[0].id : ''),
        });
    };

    const handleCancelEdit = () => {
        setEditingModuleId(null);
        setEditFormData(null);
    };
    
    const handleUpdateModule = () => {
        if (!editFormData || !editingModuleId) return;
        setLocalModules(prev =>
            prev.map(m =>
                m.id === editingModuleId ? { ...m, ...editFormData } : m
            )
        );
        handleCancelEdit();
    };
    
    const handleDeleteModule = (moduleId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar este módulo? Esta acción no se puede deshacer.")) {
            setLocalModules(prev => prev.filter(m => m.id !== moduleId));
            if (editingModuleId === moduleId) {
                handleCancelEdit();
            }
        }
    };

    const ModuleItem: React.FC<{ module: Module }> = ({ module }) => {
        const isEditing = editingModuleId === module.id;

        if (isEditing && editFormData) {
            return (
                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg border-2 border-blue-500 transition-all duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600" />
                        <select value={editFormData.type} onChange={e => setEditFormData({...editFormData, type: e.target.value as ModuleType})} className="w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-600">
                           {Object.values(ModuleType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={editFormData.rateId} onChange={e => setEditFormData({...editFormData, rateId: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-600">
                            {rates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                         <button onClick={handleCancelEdit} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors"><XIcon className="w-5 h-5"/></button>
                         <button onClick={handleUpdateModule} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 font-semibold transition-colors"><CheckIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            );
        }

        return (
             <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors">
                 <div className="flex items-center gap-3">
                    <ComputerIcon className="w-6 h-6 text-slate-500" />
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{module.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{module.type} / {rates.find(r => r.id === module.rateId)?.name || 'Sin tarifa'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-slate-400">
                    <button onClick={() => handleStartEdit(module)} className="hover:text-blue-500 transition-colors"><EditIcon/></button>
                    <button onClick={() => handleDeleteModule(module.id)} className="hover:text-red-500 transition-colors"><DeleteIcon/></button>
                 </div>
             </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Gestión de Módulos</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {isAdding && (
                            <AddModuleForm rates={rates} onSave={handleAddModule} onCancel={() => setIsAdding(false)} />
                        )}

                        {localModules.map(module => <ModuleItem key={module.id} module={module} />)}
                        
                        {!isAdding && !editingModuleId && (
                             <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-blue-500 hover:text-blue-500 transition-all duration-300 min-h-[80px]"
                            >
                                <div className="text-center">
                                    <PlusIcon className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                    <span className="font-semibold text-sm text-slate-500 dark:text-slate-400">Agregar Módulo</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
                    <button onClick={handleSaveAll} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default ModulesConfigModal;