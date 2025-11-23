export type TransactionType = 'DEBIT' | 'CREDIT';

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
  verified?: boolean; // For transaction verification
}

export interface PendingTransaction extends Transaction {
  verified: boolean;
  confidence: number; // 0-1 score for auto-categorization
  needsReview: boolean;
}

export interface Budget {
  id: string;
  monthlyLimit: number;
  currentSpending: number;
  alertThreshold: number; // percentage (e.g., 80)
  alertsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface AccountStats {
  accountId: string;
  totalDebits: number;
  totalCredits: number;
  balanceHistory: Array<{ date: number, balance: number }>;
}

export interface Account {
  id: string;
  name: string; // e.g., "MTN MobileMoney", "Stanchart"
  balance: number;
  currency: string;
  lastUpdated: number;
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
