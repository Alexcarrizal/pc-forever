export type View = 'dashboard' | 'pos' | 'reports' | 'salesAnalysis' | 'cashbox' | 'clients' | 'products' | 'services' | 'settings' | 'recharges' | 'weeklyDeposits';
export type Theme = 'light' | 'dark';

export enum ModuleStatus {
  Available = "DISPONIBLE",
  Occupied = "OCUPADO",
}

export enum ModuleType {
  PC = "PC",
  Console = "Consola",
}

export enum SessionType {
  Free = 'Tiempo Libre',
  Fixed = 'Tiempo Fijo',
  Redeem = 'Canjeo de Puntos',
}

export interface Module {
  id: string;
  name: string;
  status: ModuleStatus;
  type: ModuleType;
  startTime?: number;
  rateId?: string;
  accountProducts: CartItem[];
  finalCost?: number;
  sessionType?: SessionType;
  endTime?: number;
  clientId?: string;
  fixedTimeCost?: number;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  points: number;
  visitCount?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name:string;
  category: string;
  distributor: string;
  barcode: string;
  hasWarranty: boolean;
  warranty?: string;
  purchasePrice: number;
  salePrice: number;
  managesInventory: boolean;
  stock?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  purchasePrice: number;
  barcode?: string;
  warranty?: string;
  isService?: boolean;
}


export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Mercado Pago' | 'Transferencia';

export interface CashFlowTransaction {
  id: string;
  date: string;
  type: 'Ingreso' | 'Salida' | 'Apertura' | 'Cierre';
  description: string;
  client: string | null;
  paymentMethod: PaymentMethod | 'Manual';
  amount: number;
}

export interface RateTier {
  id: string;
  from: number; // minutes
  to: number; // minutes
  price: number;
}

export interface RateType {
  id: string;
  name: string;
  tiers: RateTier[];
}

export interface BusinessInfo {
  name: string;
  website: string;
  whatsapp: string;
  address?: string;
  technicians?: Technician[];
}

export interface SaleRecord {
  folio: string;
  date: string;
  client: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  commission?: number;
  total: number;
}

export interface CreditCard {
    id: string;
    bank: string;
    nickname?: string;
    number: string;
    type: 'Visa' | 'Mastercard' | 'Amex';
    limit: number;
    balance: number;
    cutOffDay: number; // Day of the month (1-31)
    paymentDueDay: number; // Day of the month (1-31)
    isActive: boolean;
}

export interface DebitCard {
    id: string;
    bank: string;
    nickname?: string;
    number: string;
    accountType: 'Ahorros' | 'Corriente' | 'Nómina';
    balance: number;
    isActive: boolean;
}

export interface Apartado {
    id: string;
    name: string;
    percentage: number;
    destinationType: 'cash' | 'debit' | 'credit';
    destinationId?: string;
}

export interface VolumeTier {
    minQuantity: number;
    price: number;
}

export interface Service {
  id: string;
  name: string;
  pricingType: 'fixed' | 'volume' | 'quote';
  cost?: number; // For 'fixed' type
  volumeTiers?: VolumeTier[]; // For 'volume' type
}


export interface TieredServicePricing {
  fixedPrintServices: Service[];
  procedures: Service[];
}

export interface ElectronicRecharge {
    id: string;
    date: string;
    company: string;
    amount: number;
}

export interface Technician {
    id: string;
    name: string;
}

// FIX: Added missing type definitions for Service Orders and related types.
export enum ServiceOrderStatus {
    EnRevision = "EN REVISIÓN",
    Aprobado = "APROBADO",
    EnReparacion = "EN REPARACIÓN",
    Reparado = "REPARADO",
    NoReparado = "NO REPARADO",
    Entregado = "ENTREGADO",
    Cancelado = "CANCELADO",
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  equipmentType: string;
  equipmentBrand: string;
  equipmentModel: string;
  equipmentSerial: string;
  equipmentPin?: string;
  entryDate: string;
  reportedProblem: string;
  technicalDiagnosis: string;
  status: ServiceOrderStatus;
  estimatedCost: number;
  finalCost: number;
  advancePayment: number;
  observations: string;
  assignedTechnicianId: string;
  history: { date: string; change: string; user: string }[];
}

export interface RepairCatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
}