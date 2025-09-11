import React, { useState } from 'react';
import { Service, CartItem } from '../types';
import { XIcon } from './icons';

interface SellOnDemandServiceModalProps {
    service: Service;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
}

const SellOnDemandServiceModal: React.FC<SellOnDemandServiceModalProps> = ({ service, isOpen, onClose, onAddToCart }) => {
    const [price, setPrice] = useState('');

    if (!isOpen) return null;

    const handleAddToCart = () => {
        const numPrice = parseFloat(price);
        if (!isNaN(numPrice) && numPrice > 0) {
            onAddToCart({
                id: service.id,
                name: service.name,
                price: numPrice,
                quantity: 1,
                purchasePrice: 0,
                isService: true,
            });
            onClose();
        } else {
            alert("Por favor, ingrese un precio válido.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    <button onClick={onClose}><XIcon /></button>
                </div>
                <div className="p-4 space-y-4">
                    <label>
                        Precio del Servicio:
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
                    </label>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button onClick={handleAddToCart} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    );
};

export default SellOnDemandServiceModal;
