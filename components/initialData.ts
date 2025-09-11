




import { Module, ModuleStatus, ModuleType, Client, Product, Category, RateType, BusinessInfo, CreditCard, DebitCard, Apartado, Service, TieredServicePricing, ElectronicRecharge, ServiceOrder, ServiceOrderStatus, RepairCatalogItem, Technician } from '../types';

export const initialData = {
  modules: [
    { id: 'm1', name: 'PC-01', status: ModuleStatus.Available, type: ModuleType.PC, rateId: 'rate-pc', accountProducts: [] },
    { id: 'm2', name: 'PC-02', status: ModuleStatus.Occupied, type: ModuleType.PC, startTime: Date.now() - 3661000, rateId: 'rate-pc', accountProducts: [{ id: 'p1', name: 'Sabritas Original', price: 15, quantity: 1, purchasePrice: 8, isService: false }] },
    { id: 'm3', name: 'PC-03', status: ModuleStatus.Available, type: ModuleType.PC, rateId: 'rate-pc', accountProducts: [] },
    { id: 'm4', name: 'Consola-01', status: ModuleStatus.Available, type: ModuleType.Console, rateId: 'rate-console', accountProducts: [] },
  ] as Module[],
  clients: [
    { id: 'c0', name: 'Venta al Público', points: 0, visitCount: 0, email: '' },
    { id: 'c1', name: 'Juan Pérez', phone: '5511223344', points: 8, visitCount: 4, email: 'juan.perez@email.com' },
    { id: 'c2', name: 'Maria García', phone: '5588776655', points: 152, visitCount: 12, email: 'maria.g@email.com' },
  ] as Client[],
  products: [
    { id: 'p1', name: 'Sabritas Original', category: 'Botanas', distributor: 'Sabritas', barcode: '12345', hasWarranty: false, purchasePrice: 8, salePrice: 15, managesInventory: true, stock: 29 },
    { id: 'p2', name: 'Mouse Gamer RGB', category: 'Accesorios', distributor: 'Logitech', barcode: '67890', hasWarranty: true, warranty: '12 meses', purchasePrice: 250, salePrice: 450, managesInventory: true, stock: 8 },
    { id: 'p3', name: 'Coca Cola 600ml', category: 'Bebidas', distributor: 'Coca-Cola', barcode: '11223', hasWarranty: false, purchasePrice: 15, salePrice: 25, managesInventory: true, stock: 49 },
  ] as Product[],
  categories: [
    { id: 'cat1', name: 'Botanas' },
    { id: 'cat2', name: 'Accesorios' },
    { id: 'cat3', name: 'Bebidas' },
  ] as Category[],
  rates: [
    { id: 'rate-pc', name: 'PC / Internet', tiers: [
      { id: 't-pc-1', from: 1, to: 15, price: 5 },
      { id: 't-pc-2', from: 16, to: 30, price: 10 },
      { id: 't-pc-3', from: 31, to: 60, price: 15 },
    ]},
    { id: 'rate-console', name: 'Consola (1 Control)', tiers: [
      { id: 't-con-1', from: 1, to: 30, price: 20 },
      { id: 't-con-2', from: 31, to: 60, price: 35 },
    ]},
  ] as RateType[],
  businessInfo: {
    name: 'Pc Forever',
    website: 'www.pcforever.com.mx',
    whatsapp: '5620053397',
    address: 'Calle Falsa 123, Col. Centro',
    technicians: [
        { id: 'tech-1', name: 'Roberto Gómez' },
        { id: 'tech-2', name: 'Ana María Juárez' }
    ]
  } as BusinessInfo,
  creditCards: [
      { id: 'cc1', bank: 'BBVA', nickname: 'Crédito Principal', number: '1234', type: 'Visa', limit: 50000, balance: 15000, cutOffDay: 14, paymentDueDay: 4, isActive: true },
      { id: 'cc2', bank: 'Santander', nickname: 'Compras Online', number: '5678', type: 'Mastercard', limit: 30000, balance: 8500, cutOffDay: 19, paymentDueDay: 9, isActive: true },
  ] as CreditCard[],
  debitCards: [
      { id: 'dc1', bank: 'Banorte', nickname: 'Cuenta Principal', number: '9012', accountType: 'Corriente', balance: 12500, isActive: true },
      { id: 'dc2', bank: 'HSBC', nickname: 'Ahorros', number: '3456', accountType: 'Ahorros', balance: 45000, isActive: true },
  ] as DebitCard[],
  apartados: [] as Apartado[],
  services: [
    { id: 'serv1', name: 'Mantenimiento PC', pricingType: 'fixed', cost: 350 },
    { id: 'serv2', name: 'Formateo con respaldo', pricingType: 'fixed', cost: 400 },
    { id: 'serv3', name: 'Instalación de Software', pricingType: 'quote' },
  ] as Service[],
  tieredPricing: {
    fixedPrintServices: [
      { 
        id: 'fps-bw', 
        name: 'Impresiones B/N', 
        pricingType: 'volume',
        volumeTiers: [
          { minQuantity: 1, price: 2.00 },
          { minQuantity: 10, price: 1.00 }
        ]
      },
      { id: 'fps-color', name: 'Impresiones Color', pricingType: 'fixed', cost: 5.00 },
      { id: 'fps-copy', name: 'Copias B/N', pricingType: 'fixed', cost: 1.00 },
      { id: 'fps-scan', name: 'Escaneo de Documento', pricingType: 'fixed', cost: 5.00 },
      { id: 'fps-photo', name: 'Impresión Foto 4x6', pricingType: 'fixed', cost: 10.00 },
    ],
    procedures: [
        { id: 'proc-1', name: 'Consulta CURP', pricingType: 'fixed', cost: 15.00 },
        { id: 'proc-2', name: 'Consulta Acta de Nacimiento', pricingType: 'fixed', cost: 25.00 },
    ],
  } as TieredServicePricing,
  electronicRecharges: [] as ElectronicRecharge[],
  repairCatalog: [
    { id: 'REP-001', name: 'Formateo de Sistema Operativo', description: 'Instalación limpia de Windows/MacOS, incluye drivers.', price: 350 },
    { id: 'REP-002', name: 'Limpieza de Virus y Malware', description: 'Escaneo y eliminación de software malicioso.', price: 250 },
    { id: 'REP-003', name: 'Mantenimiento Preventivo (PC)', description: 'Limpieza física de componentes y cambio de pasta térmica.', price: 300 },
  ] as RepairCatalogItem[],
  serviceOrders: [
    {
      id: 'ORD-001',
      clientId: 'c2',
      equipmentType: 'Laptop',
      equipmentBrand: 'HP',
      equipmentModel: 'Pavilion 15',
      equipmentSerial: 'HP123456',
      entryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      reportedProblem: 'No enciende la pantalla, solo el teclado.',
      technicalDiagnosis: 'Fallo en el flex de video. Requiere reemplazo.',
      status: ServiceOrderStatus.EnReparacion,
      estimatedCost: 850,
      finalCost: 850,
      advancePayment: 200,
      observations: 'El cliente autorizó la reparación vía WhatsApp.',
      assignedTechnicianId: 'tech-1',
      history: [
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), change: 'Orden creada', user: 'Recepcionista' },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), change: 'Estado cambiado a Aprobado', user: 'Técnico' },
      ],
    },
    {
      id: 'ORD-002',
      clientId: 'c1',
      equipmentType: 'PC de Escritorio',
      equipmentBrand: 'Ensamblada',
      equipmentModel: 'N/A',
      equipmentSerial: 'N/A',
      entryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      reportedProblem: 'Muy lenta, se traba mucho al abrir programas.',
      technicalDiagnosis: 'Disco duro mecánico dañado. Se recomienda cambiar a SSD.',
      status: ServiceOrderStatus.Reparado,
      estimatedCost: 1200,
      finalCost: 1200,
      advancePayment: 0,
      observations: 'SSD de 480GB instalado.',
      assignedTechnicianId: 'tech-2',
      history: [{ date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), change: 'Orden creada', user: 'Recepcionista' }],
    }
  ] as ServiceOrder[],
};
