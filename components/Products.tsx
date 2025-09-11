import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import AddProductModal from './AddProductModal';
import StatCard from './StatCard';
import { EditIcon, DeleteIcon, ChevronDownIcon } from './icons';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

type StockFilter = 'all' | 'out-of-stock' | 'low-stock';

const Products: React.FC<ProductsProps> = ({ products, setProducts, categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const stats = useMemo(() => {
    return {
      total: products.length,
      withStock: products.filter(p => p.managesInventory && (p.stock || 0) > 0).length,
      withoutStock: products.filter(p => p.managesInventory && (p.stock || 0) === 0).length,
      lowStock: products.filter(p => p.managesInventory && (p.stock || 0) > 0 && (p.stock || 0) < 5).length,
      categories: new Set(products.map(p => p.category)).size,
    };
  }, [products]);

  const handleFilterClick = (filter: StockFilter) => {
    setStockFilter(prev => (prev === filter ? 'all' : filter));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'out-of-stock' && product.managesInventory && (product.stock || 0) === 0) ||
        (stockFilter === 'low-stock' && product.managesInventory && (product.stock || 0) > 0 && (product.stock || 0) < 5);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
      setDeletingProduct(product);
  }

  const confirmDelete = () => {
      if(!deletingProduct) return;
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      setDeletingProduct(null);
  }

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      setProducts(prev => [...prev, { id: `p-${Date.now()}-${Math.random()}`, ...productData }]);
    }
    // Add new category if it doesn't exist
    if (!categories.some(c => c.name === productData.category)) {
      setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name: productData.category }]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Productos</h1>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          Agregar Producto
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Productos" value={stats.total} color="blue" isClickable onClick={() => handleFilterClick('all')} isActive={stockFilter === 'all'} />
        <StatCard title="Con Inventario" value={stats.withStock} color="green"/>
        <StatCard title="Sin Inventario" value={stats.withoutStock} color="yellow" isClickable onClick={() => handleFilterClick('out-of-stock')} isActive={stockFilter === 'out-of-stock'} />
        <StatCard title="Stock Bajo" value={stats.lowStock} color="yellow" isClickable onClick={() => handleFilterClick('low-stock')} isActive={stockFilter === 'low-stock'} />
        <StatCard title="Categorías" value={stats.categories} color="blue"/>
      </div>
      
       <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, categoría, código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none w-48 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Producto', 'Categoría', 'Precios', 'Rentabilidad', 'Stock', 'Garantía', 'Acciones'].map(h =>
                  <th key={h} className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{product.name}</td>
                  <td className="p-4">
                    <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    <div>Venta: <span className="font-semibold text-slate-800 dark:text-white">${product.salePrice.toFixed(2)}</span></div>
                    <div>Costo: <span className="text-xs">${product.purchasePrice.toFixed(2)}</span></div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-bold text-green-500">+${(product.salePrice - product.purchasePrice).toFixed(2)}</div>
                    <div className="text-xs text-slate-500">{product.salePrice > 0 ? ((product.salePrice - product.purchasePrice) / product.salePrice * 100).toFixed(1) : 0}% margen</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{product.managesInventory ? `${product.stock} unidades` : 'N/A'}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{product.hasWarranty ? product.warranty : 'Sin garantía'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4 text-slate-400">
                       <button onClick={() => handleEditProduct(product)} className="hover:text-blue-500 transition-colors">
                        <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDeleteProduct(product)} className="hover:text-red-500 transition-colors">
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
      {(isModalOpen || editingProduct) && (
        <AddProductModal
          isOpen={isModalOpen || !!editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          existingProduct={editingProduct}
          categories={categories}
          products={products}
        />
      )}
      {deletingProduct && (
        <ConfirmDeleteModal
            isOpen={true}
            onClose={() => setDeletingProduct(null)}
            onConfirm={confirmDelete}
            itemName={deletingProduct.name}
        />
      )}
    </div>
  );
};

export default Products;