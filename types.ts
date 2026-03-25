
export enum AppRole {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export interface UserAccount {
  id: string;
  phone: string;
  balance: number;
  xp: number;
  level: number;
  goalName: string;
  goalTarget: number;
  lastYield: number;
}

export interface MerchantAccount {
  id: string;
  name: string;
  cashCollected: number;
  piggyPayments: number;
  quotaUsed: number;
  quotaLimit: number;
  earnings: number;
  address?: string;
  lat?: number;
  lng?: number;
  type?: 'SUPERMARKET' | 'BAKERY' | 'TECH' | 'RESTAURANT';
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface Promotion {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  piggyPrice: number;
  otherPrice: number;
  totalValue: number;
  imageUrl: string;
  expiryDate: string;
  category: string;
}

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
  emoji: string;
}

export interface Transaction {
  id: string;
  type: 'SAVING' | 'PAYMENT' | 'YIELD';
  amount: number;
  description: string;
  timestamp: string;
  merchantName?: string;
  category?: string;
  location?: string;
  status?: 'COMPLETADA' | 'PENDIENTE' | 'RECHAZADA';
  paymentMethod?: string;
  savingsGenerated?: number;
  items?: TransactionItem[];
}
