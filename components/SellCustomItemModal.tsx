import React, { useState } from 'react';
import { CartItem } from '../types';
import { XIcon } from './icons';

interface SellCustomItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
}

const SellCustomItemModal: React.FC<SellCustomItemModalProps> = ({ isOpen, onClose, onAddToCart }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [barcode, setBarcode] = useState('');
    const [warranty, setWarranty] = useState('');

    if (!isOpen) return null;

    const handleAddToCart = () => {
        const numPrice = parseFloat(price);
        const numQuantity = parseInt(quantity, 10);
        if (name && !isNaN(numPrice) && numPrice >= 0 && !isNaN(numQuantity) && numQuantity > 0) {
            onAddToCart({
                id: `custom-${Date.now()}`,
                name: name,
                price: numPrice,
                quantity: numQuantity,
                purchasePrice: numPrice, // To avoid affecting profit calculations.
                barcode: barcode,
                warranty: warranty,
                isService: true, // Treat as a service/custom item.
            });
            onClose();
        } else {
            alert("Por favor, ingrese un nombre, precio y cantidad válidos.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Vender Artículo Personalizado</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><XIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Nombre del Artículo/Servicio:</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Ej: Reparación de celular" 
                            className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Precio:</label>
                            <input 
                                type="number" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)} 
                                placeholder="0.00" 
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Cantidad:</label>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={e => setQuantity(e.target.value)} 
                                placeholder="1" 
                                min="1"
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Número de Serie (Opcional):</label>
                        <input 
                            type="text" 
                            value={barcode} 
                            onChange={e => setBarcode(e.target.value)} 
                            placeholder="Ej: SN12345678" 
                            className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Garantía (Opcional):</label>
                        <input 
                            type="text" 
                            value={warranty} 
                            onChange={e => setWarranty(e.target.value)} 
                            placeholder="Ej: 30 días, 1 año" 
                            className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
                    <button onClick={handleAddToCart} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    );
};

export default SellCustomItemModal;