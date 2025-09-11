import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../types';
import { XIcon } from './icons';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>) => void;
  existingProduct?: Product | null;
  categories: Category[];
  products: Product[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, existingProduct, categories, products }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [distributor, setDistributor] = useState('');
  const [barcode, setBarcode] = useState('');
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warranty, setWarranty] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [managesInventory, setManagesInventory] = useState(true);
  const [stock, setStock] = useState(0);

  const distributors = useMemo(() => {
    const allDistributors = products.map(p => p.distributor).filter(Boolean);
    return [...new Set(allDistributors)];
  }, [products]);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setCategory(existingProduct.category);
      setDistributor(existingProduct.distributor);
      setBarcode(existingProduct.barcode);
      setHasWarranty(existingProduct.hasWarranty);
      setWarranty(existingProduct.warranty || '');
      setPurchasePrice(existingProduct.purchasePrice);
      setSalePrice(existingProduct.salePrice);
      setManagesInventory(existingProduct.managesInventory);
      setStock(existingProduct.stock || 0);
    } else {
      // Reset form
      setName('');
      setCategory('');
      setDistributor('');
      setBarcode('');
      setHasWarranty(false);
      setWarranty('');
      setPurchasePrice(0);
      setSalePrice(0);
      setManagesInventory(true);
      setStock(0);
    }
  }, [existingProduct]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !category) {
      alert('Nombre y Categoría son obligatorios.');
      return;
    }
    onSave({
      name, category, distributor, barcode, hasWarranty, warranty,
      purchasePrice, salePrice, managesInventory, stock
    });
  };

  const profitability = salePrice - purchasePrice;
  const isProfitable = profitability > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-3xl text-slate-900 dark:text-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{existingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
          <button onClick={onClose}><XIcon className="h-6 w-6"/></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[70vh] overflow-y-auto">
          {/* Left Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Información Básica</h3>
            <div>
              <label className="text-sm font-medium">Nombre del Producto *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
            <div>
              <label className="text-sm font-medium">Categoría *</label>
              <input type="text" list="categories" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
              <datalist id="categories">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="text-sm font-medium">Distribuidor</label>
              <input type="text" list="distributors" value={distributor} onChange={e => setDistributor(e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
              <datalist id="distributors">
                {distributors.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label className="text-sm font-medium">Código de Barras</label>
              <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="has-warranty" checked={hasWarranty} onChange={e => setHasWarranty(e.target.checked)}/>
              <label htmlFor="has-warranty">Este producto tiene garantía</label>
            </div>
            {hasWarranty && (
               <div>
                <label className="text-sm font-medium">Garantía</label>
                <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="Ej. 12 meses" className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
                 <div className="mt-2 flex flex-wrap gap-2">
                    {['1 Mes', '3 Meses', '6 Meses', '12 Meses'].map(preset => (
                        <button 
                            key={preset}
                            type="button"
                            onClick={() => setWarranty(preset)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${warranty === preset ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Precios e Inventario</h3>
            <div>
              <label className="text-sm font-medium">Costo de Compra</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
            <div>
              <label className="text-sm font-medium">Precio de Venta *</label>
              <input type="number" value={salePrice} onChange={e => setSalePrice(parseFloat(e.target.value) || 0)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
            </div>
             <div className="flex items-center gap-2">
              <input type="checkbox" id="manages-inventory" checked={managesInventory} onChange={e => setManagesInventory(e.target.checked)}/>
              <label htmlFor="manages-inventory">Este producto maneja inventario</label>
            </div>
            {managesInventory && (
               <div>
                <label className="text-sm font-medium">Stock Inicial *</label>
                <input type="number" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600"/>
              </div>
            )}
            <div className={`p-3 rounded-lg text-center ${isProfitable ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
              <span className="text-sm font-medium">Rentabilidad: </span>
              <span className={`font-bold ${isProfitable ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>${profitability.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Guardar Producto</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;