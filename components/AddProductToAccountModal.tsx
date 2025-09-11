import React, { useState, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { XIcon } from './icons';

interface AddProductToAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onAddProduct: (product: CartItem, quantity: number) => void;
}

const AddProductToAccountModal: React.FC<AddProductToAccountModalProps> = ({ isOpen, onClose, products = [], onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  if (!isOpen) return null;

  const handleAdd = (product: Product) => {
    const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        purchasePrice: product.purchasePrice,
        barcode: product.barcode,
        warranty: product.warranty,
    };
    onAddProduct(cartItem, 1);
    onClose();
  };

  const handleAddCustom = () => {
    if (!customName || !customPrice) {
      alert("Debe ingresar nombre y precio para el producto personalizado.");
      return;
    }
    const customCartItem: CartItem = {
      id: `custom-${Date.now()}-${Math.random()}`,
      name: customName,
      price: parseFloat(customPrice),
      purchasePrice: parseFloat(customPrice), // Assuming purchase price is same as sale price for custom items
      quantity: 1,
      barcode: '',
      warranty: '',
    };
    onAddProduct(customCartItem, 1);
    setCustomName('');
    setCustomPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg text-slate-900 dark:text-slate-200 shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Agregar Producto a la Cuenta</h2>
          <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto space-y-4">
          <input 
            type="text"
            placeholder="Buscar producto del catálogo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
             <h3 className="font-semibold mb-3 text-slate-800 dark:text-white">... o agregar un producto personalizado</h3>
             <div className="flex flex-col sm:flex-row gap-3">
                <input 
                    type="text" 
                    placeholder="Nombre del producto" 
                    value={customName} 
                    onChange={e => setCustomName(e.target.value)} 
                    className="flex-grow p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
                <input 
                    type="number" 
                    placeholder="Precio" 
                    value={customPrice} 
                    onChange={e => setCustomPrice(e.target.value)} 
                    className="w-full sm:w-32 p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
             <button 
                onClick={handleAddCustom} 
                className="mt-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                disabled={!customName || !customPrice}
            >
                Agregar Personalizado
            </button>
          </div>
          
          <div className="space-y-2">
            {filteredProducts.map(p => (
              <button key={p.id} onClick={() => handleAdd(p)} className="w-full text-left flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-slate-500">${p.salePrice.toFixed(2)}</p>
                </div>
                <span className="text-sm font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">{p.stock} disp.</span>
              </button>
            ))}
            {searchTerm && filteredProducts.length === 0 && (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    <p>No se encontraron productos.</p>
                </div>
            )}
          </div>

        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductToAccountModal;
