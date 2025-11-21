import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Account } from '../models/types';

const TRANSACTIONS_KEY = '@transactions';
const ACCOUNTS_KEY = '@accounts';

export class StorageService {
    static async saveTransaction(transaction: Transaction): Promise<void> {
        try {
            const existing = await this.getTransactions();
            const updated = [transaction, ...existing];
            await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save transaction', e);
        }
    }

    static async getTransactions(): Promise<Transaction[]> {
        try {
            const json = await AsyncStorage.getItem(TRANSACTIONS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Failed to fetch transactions', e);
            return [];
        }
    }

    static async updateAccount(name: string, balance: number, currency: string): Promise<void> {
        try {
            const accounts = await this.getAccounts();
            const index = accounts.findIndex(a => a.name === name);

            const updatedAccount: Account = {
                id: index !== -1 ? accounts[index].id : Date.now().toString(),
                name,
                balance,
                currency,
                lastUpdated: Date.now(),
            };

            if (index !== -1) {
                accounts[index] = updatedAccount;
            } else {
                accounts.push(updatedAccount);
            }

            await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        } catch (e) {
            console.error('Failed to update account', e);
        }
    }

    static async getAccounts(): Promise<Account[]> {
        try {
            const json = await AsyncStorage.getItem(ACCOUNTS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Failed to fetch accounts', e);
            return [];
        }
    }

    static async clearTransactions(): Promise<void> {
        try {
            await AsyncStorage.removeItem(TRANSACTIONS_KEY);
            await AsyncStorage.removeItem(ACCOUNTS_KEY);
        } catch (e) {
            console.error('Failed to clear data', e);
        }
    }
}
