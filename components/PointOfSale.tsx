import React, { useState, useMemo } from 'react';
import { Product, CartItem, Client, SaleRecord, CashFlowTransaction, Service, TieredServicePricing, VolumeTier } from '../types';
import { ChevronDownIcon, DeleteIcon, XIcon, SearchIcon, PlusCircleIcon, StarIcon, GridIcon, ListBulletIcon } from './icons';
import ConfirmSaleModal from './ConfirmSaleModal';
import SellOnDemandServiceModal from './SellOnDemandServiceModal';
import AddClientModal from './AddClientModal';
import SellCustomItemModal from './SellCustomItemModal';

const VolumeServiceModal: React.FC<{
    service: Service;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
}> = ({ service, isOpen, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState('1');

    if (!isOpen) return null;

    const getPriceForQuantity = (qty: number): number => {
        if (!service.volumeTiers || service.volumeTiers.length === 0) return 0;
        const sortedTiers = [...service.volumeTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        for (const tier of sortedTiers) {
            if (qty >= tier.minQuantity) {
                return tier.price;
            }
        }
        // Fallback to the lowest price tier if quantity is less than any minQuantity (should be the one with minQuantity: 1)
        return sortedTiers[sortedTiers.length - 1]?.price || 0;
    };

    const numQuantity = parseInt(quantity) || 0;
    const pricePerUnit = getPriceForQuantity(numQuantity);
    const totalPrice = pricePerUnit * numQuantity;

    const handleAddToCart = () => {
        if (numQuantity > 0) {
            onAddToCart({
                id: service.id,
                name: service.name,
                price: pricePerUnit,
                quantity: numQuantity,
                purchasePrice: 0,
                isService: true,
            });
            onClose();
        } else {
            alert("Por favor, ingrese una cantidad válida.");
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
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Cantidad:</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" placeholder="1" className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md" />
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center">
                        <p className="text-sm">Precio por unidad (mayoreo aplicado): <span className="font-bold">${pricePerUnit.toFixed(2)}</span></p>
                        <p className="text-xl font-bold mt-1">Total: ${totalPrice.toFixed(2)}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button onClick={handleAddToCart} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    );
};

interface PointOfSaleProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  services: Service[];
  tieredPricing: TieredServicePricing;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  onShowReceipt: (data: SaleRecord) => void;
  addTransaction: (transaction: CashFlowTransaction) => void;
  onAddSaleToHistory: (sale: SaleRecord) => void;
  fullSalesHistory: SaleRecord[];
}

const PointOfSale: React.FC<PointOfSaleProps> = ({ products, setProducts, services, tieredPricing, clients, setClients, onShowReceipt, addTransaction, onAddSaleToHistory, fullSalesHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [modalState, setModalState] = useState<{ type: 'on-demand' | 'volume' | 'none', data?: any }>({ type: 'none' });
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  const categories = useMemo(() => {
    const uniqueCategories = ["Servicios", ...new Set(products.map(p => p.category))];
    uniqueCategories.sort((a, b) => a.localeCompare(b));
    return uniqueCategories;
  }, [products]);

  const allServicesForDisplay = useMemo(() => {
    const all = [
        ...(tieredPricing.fixedPrintServices || []),
        ...(tieredPricing.procedures || []),
        ...services,
    ].map(s => ({ ...s, category: 'Servicios' }));
    
    if (selectedCategory !== 'all' && selectedCategory !== 'Servicios') return [];

    return all.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [services, tieredPricing, searchTerm, selectedCategory]);
  
  const top10Products = useMemo(() => {
    const salesCountMap = new Map<string, number>();
    fullSalesHistory.forEach(sale => {
        sale.items.forEach(item => {
            if (!item.isService && !item.id.startsWith('time-') && !item.id.startsWith('custom-')) {
                salesCountMap.set(item.id, (salesCountMap.get(item.id) || 0) + item.quantity);
            }
        });
    });

    const soldProductIds = new Set(salesCountMap.keys());

    return [...products]
        .filter(p => soldProductIds.has(p.id))
        .sort((a, b) => {
            const countA = salesCountMap.get(a.id) || 0;
            const countB = salesCountMap.get(b.id) || 0;
            return countB - countA;
        })
        .slice(0, 10);
  }, [products, fullSalesHistory]);


  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Servicios') return [];

    const salesCountMap = new Map<string, number>();
    fullSalesHistory.forEach(sale => {
        sale.items.forEach(item => {
            if (!item.isService && !item.id.startsWith('time-') && !item.id.startsWith('custom-')) {
                salesCountMap.set(item.id, (salesCountMap.get(item.id) || 0) + item.quantity);
            }
        });
    });

    const sortedProducts = [...products].sort((a, b) => {
        const countA = salesCountMap.get(a.id) || 0;
        const countB = salesCountMap.get(b.id) || 0;
        return countB - countA;
    });
    
    return sortedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory, fullSalesHistory]);
  
  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id && i.price === item.price);

      if (existingItem) {
        return prevCart.map(i =>
          i.id === existingItem.id && i.price === existingItem.price ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prevCart, item];
      }
    });
  };

  const handleProductClick = (product: Product) => {
      addToCart({
          id: product.id,
          name: product.name,
          price: product.salePrice,
          quantity: 1,
          purchasePrice: product.purchasePrice,
          barcode: product.barcode,
          warranty: product.warranty,
          isService: false,
      });
  }

  const handleServiceClick = (service: Service) => {
    if (service.pricingType === 'fixed' && service.cost !== undefined) {
        addToCart({ id: service.id, name: service.name, price: service.cost, quantity: 1, purchasePrice: 0, isService: true });
    } else if (service.pricingType === 'quote') {
        setModalState({ type: 'on-demand', data: service });
    } else if (service.pricingType === 'volume') {
        setModalState({ type: 'volume', data: service });
    }
  };

  const updateQuantity = (productId: string, price: number, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId && item.price === price ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };
  
  const removeFromCart = (productId: string, price: number) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.price === price)));
  };
  
  const clearCart = () => setCart([]);
  
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);
  
  const handleSaleConfirmed = (paymentMethod: any, saleData: any) => {
    // Decrement stock for products in the cart
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        for (const cartItem of cart) {
            const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
            if (productIndex !== -1) {
                const product = newProducts[productIndex];
                if (!cartItem.isService && product.managesInventory) {
                    newProducts[productIndex] = {
                        ...product,
                        stock: (product.stock || 0) - cartItem.quantity,
                    };
                }
            }
        }
        return newProducts;
    });
      
    addTransaction({
      id: `cf-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'Ingreso',
      description: `Venta POS: ${cart.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      client: clients.find(c => c.id === saleData.clientId)?.name || 'Venta al Público',
      paymentMethod: paymentMethod,
      amount: saleData.netReceived
    });

    const saleRecord: SaleRecord = {
      folio: `F-${Date.now()}`,
      date: new Date().toISOString(),
      client: clients.find(c => c.id === saleData.clientId)?.name || 'Venta al Público',
      paymentMethod: paymentMethod,
      items: cart,
      subtotal: saleData.subtotal,
      commission: saleData.commission,
      total: saleData.total,
    };
    
    onShowReceipt(saleRecord);
    onAddSaleToHistory(saleRecord);
    
    clearCart();
    setIsSaleModalOpen(false);
  };

    const renderServicePrice = (service: Service) => {
        switch (service.pricingType) {
            case 'fixed':
                return `$${service.cost?.toFixed(2)}`;
            case 'volume':
                const minPrice = service.volumeTiers?.reduce((min, tier) => Math.min(min, tier.price), Infinity) || 0;
                return `Desde $${minPrice.toFixed(2)}`;
            case 'quote':
                return 'A cotizar';
            default:
                return '';
        }
    };

    const renderItem = (item: Product | Service) => {
        const isProduct = 'salePrice' in item;

        if (viewMode === 'grid') {
            return (
                <button 
                    key={item.id}
                    onClick={() => isProduct ? handleProductClick(item as Product) : handleServiceClick(item as Service)}
                    className={`relative p-4 rounded-lg text-left hover:scale-105 transition-transform duration-200 border ${isProduct && top10Products.some(p => p.id === item.id) ? 'bg-white dark:bg-slate-800 border-2 border-amber-400 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                    {isProduct && top10Products.some(p => p.id === item.id) && (
                         <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            <StarIcon className="w-3 h-3"/>
                            <span>TOP</span>
                        </div>
                    )}
                    <h3 className="font-bold text-slate-800 dark:text-white truncate text-lg mt-1">{item.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{isProduct ? (item as Product).category : 'Servicio'}</p>
                    <div className="flex justify-between items-end mt-2">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {isProduct ? `$${(item as Product).salePrice.toFixed(2)}` : renderServicePrice(item as Service)}
                        </p>
                        {isProduct && (
                            <p className="text-xs font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">{(item as Product).stock} disp.</p>
                        )}
                    </div>
                </button>
            );
        }

        // List View
        return (
            <button
                key={item.id}
                onClick={() => isProduct ? handleProductClick(item as Product) : handleServiceClick(item as Service)}
                className="w-full bg-white dark:bg-slate-800 p-3 rounded-lg text-left transition-colors duration-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-4"
            >
                <div className="flex-grow">
                    <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                    {isProduct ? (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {(item as Product).category} {(item as Product).distributor && `| ${(item as Product).distributor}`}
                            </p>
                            {((item as Product).barcode || (item as Product).warranty) && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
                                    {(item as Product).barcode && `Código: ${(item as Product).barcode}`}
                                    {(item as Product).barcode && (item as Product).warranty && ' | '}
                                    {(item as Product).warranty && `Garantía: ${(item as Product).warranty}`}
                                </p>
                            )}
                        </>
                    ) : (
                         <p className="text-sm text-slate-500 dark:text-slate-400">
                            Servicio de tipo: {(item as Service).pricingType === 'fixed' ? 'Precio Fijo' : (item as Service).pricingType === 'volume' ? 'Por Volumen' : 'A Cotizar'}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    {isProduct && (item as Product).managesInventory && (
                         <p className="text-sm font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full w-28 text-center">{(item as Product).stock} en stock</p>
                    )}
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 w-24 text-right">
                         {isProduct ? `$${(item as Product).salePrice.toFixed(2)}` : renderServicePrice(item as Service)}
                    </p>
                </div>
            </button>
        );
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left side: Product Selection */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Punto de Venta</h1>
        <div className="mb-4 flex gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow w-full p-4 pl-14 text-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-56 p-4 text-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          <button
              onClick={() => setIsCustomItemModalOpen(true)}
              className="p-4 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2 shrink-0"
              title="Vender producto no listado"
          >
              <PlusCircleIcon className="h-6 w-6" />
              <span className="hidden sm:inline font-semibold text-lg">Venta Manual</span>
          </button>
           <div className="flex items-center bg-slate-200 dark:bg-slate-900/50 p-1 rounded-lg">
                <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
                aria-label="Vista de cuadrícula"
                title="Vista de cuadrícula"
                >
                    <GridIcon className="w-5 h-5" />
                </button>
                <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
                aria-label="Vista de lista"
                title="Vista de lista"
                >
                    <ListBulletIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            {searchTerm === '' && selectedCategory === 'all' && top10Products.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🔥 Productos Más Vendidos</h2>
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                        {top10Products.map(product => renderItem(product))}
                    </div>
                </div>
            )}
             <div className="mt-4">
                {searchTerm === '' && selectedCategory === 'all' && top10Products.length > 0 && (
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Todos los Productos</h2>
                )}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                    {allServicesForDisplay.map(service => renderItem(service))}
                    {filteredProducts.map(product => renderItem(product))}
                </div>
             </div>
        </div>
      </div>

      {/* Right side: Cart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col h-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Carrito de Compras</h2>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">Total:</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsSaleModalOpen(true)}
              disabled={cart.length === 0}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Finalizar Venta
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Vaciar Carrito
            </button>
          </div>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center mt-8">El carrito está vacío.</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, index) => (
                <li key={`${item.id}-${item.price}-${index}`} className="flex items-center gap-4">
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, item.price, parseInt(e.target.value, 10))}
                    className="w-16 p-1 text-center bg-slate-100 dark:bg-slate-700 rounded-md"
                    min="1"
                  />
                  <p className="w-20 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id, item.price)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <DeleteIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {isSaleModalOpen && (
        <ConfirmSaleModal 
          isOpen={isSaleModalOpen}
          onClose={() => setIsSaleModalOpen(false)}
          totalAmount={cartTotal}
          clients={clients}
          onConfirm={handleSaleConfirmed}
          onAddNewClient={() => setIsAddClientModalOpen(true)}
        />
      )}
       
      {isAddClientModalOpen && (
        <AddClientModal
            isOpen={isAddClientModalOpen}
            onClose={() => setIsAddClientModalOpen(false)}
            onSave={(newClient) => {
                setClients(prev => [...prev, { ...newClient, id: `c-${Date.now()}-${Math.random()}`, points: 0 }]);
                setIsAddClientModalOpen(false);
            }}
            zIndex={60}
        />
      )}
      
      {modalState.type === 'on-demand' && (
          <SellOnDemandServiceModal
            isOpen={modalState.type === 'on-demand'}
            onClose={() => setModalState({ type: 'none' })}
            service={modalState.data}
            onAddToCart={addToCart}
          />
      )}

       {modalState.type === 'volume' && (
          <VolumeServiceModal
            isOpen={modalState.type === 'volume'}
            onClose={() => setModalState({ type: 'none' })}
            service={modalState.data}
            onAddToCart={addToCart}
          />
      )}

      {isCustomItemModalOpen && (
          <SellCustomItemModal
              isOpen={isCustomItemModalOpen}
              onClose={() => setIsCustomItemModalOpen(false)}
              onAddToCart={addToCart}
          />
      )}
    </div>
  );
};

export default PointOfSale;
