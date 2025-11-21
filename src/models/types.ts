export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Account {
  id: string;
  name: string; // e.g., "MTN MobileMoney", "Stanchart"
  balance: number;
  currency: string;
  lastUpdated: number;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: number; // Timestamp
  type: TransactionType;
  category: string;
  merchant?: string;
  sender?: string;
  recipient?: string;
  rawMessage: string; // The original SMS/Notification body
  source: 'SMS' | 'NOTIFICATION' | 'MANUAL';
  accountId?: string; // Link to the account
  balanceSnapshot?: number; // Balance after this transaction
}

export interface Category {
  id: string;
  name: string;
  keywords: string[];
  color: string;
  icon: string;
}

export interface SmsMessage {
  id: string;
  body: string;
  sender: string;
  timestamp: number;
}
