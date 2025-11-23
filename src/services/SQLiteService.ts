import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Account, Budget, Category, TransactionType } from '../models/types';

const DB_NAME = 'expense_tracker.db';
const TRANSACTIONS_KEY = '@transactions';
const ACCOUNTS_KEY = '@accounts';
const BUDGETS_KEY = '@budgets';

const isWeb = Platform.OS === 'web';

export class SQLiteService {
    private static db: SQLite.SQLiteDatabase | null = null;

    static async init(): Promise<void> {
        if (isWeb) {
            // Web doesn't support SQLite, we'll use AsyncStorage
            return;
        }

        if (this.db) return;

        this.db = await SQLite.openDatabaseAsync(DB_NAME);
        await this.createTables();
    }

    private static async createTables(): Promise<void> {
        if (!this.db) return;

        // Transactions table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        date INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        merchant TEXT,
        sender TEXT,
        recipient TEXT,
        rawMessage TEXT NOT NULL,
        source TEXT NOT NULL,
        accountId TEXT,
        balanceSnapshot REAL,
        verified INTEGER DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_category ON transactions(category);
      CREATE INDEX IF NOT EXISTS idx_account ON transactions(accountId);
    `);

        // Accounts table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL NOT NULL,
        currency TEXT NOT NULL,
        lastUpdated INTEGER NOT NULL
      );
    `);

        // Budgets table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        monthlyLimit REAL NOT NULL,
        currentSpending REAL NOT NULL,
        alertThreshold REAL NOT NULL,
        alertsEnabled INTEGER NOT NULL,
        soundEnabled INTEGER NOT NULL,
        vibrationEnabled INTEGER NOT NULL
      );
    `);

        // Categories table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        keywords TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL
      );
    `);
    }

    // Transaction methods
    static async saveTransaction(transaction: Transaction): Promise<void> {
        if (isWeb) {
            // Web fallback: use AsyncStorage
            try {
                const existing = await this.getTransactions();
                const index = existing.findIndex(t => t.id === transaction.id);
                if (index !== -1) {
                    existing[index] = transaction;
                } else {
                    existing.unshift(transaction);
                }
                await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(existing));
            } catch (e) {
                console.error('Failed to save transaction on web', e);
            }
            return;
        }

        if (!this.db) await this.init();

        await this.db!.runAsync(
            `INSERT OR REPLACE INTO transactions 
       (id, amount, currency, date, type, category, merchant, sender, recipient, 
        rawMessage, source, accountId, balanceSnapshot, verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transaction.id,
                transaction.amount,
                transaction.currency,
                transaction.date,
                transaction.type,
                transaction.category,
                transaction.merchant || null,
                transaction.sender || null,
                transaction.recipient || null,
                transaction.rawMessage,
                transaction.source,
                transaction.accountId || null,
                transaction.balanceSnapshot || null,
                transaction.verified ? 1 : 0
            ]
        );
    }

    static async getTransactions(limit?: number): Promise<Transaction[]> {
        if (isWeb) {
            // Web fallback: use AsyncStorage
            try {
                const json = await AsyncStorage.getItem(TRANSACTIONS_KEY);
                const transactions: Transaction[] = json ? JSON.parse(json) : [];
                return limit ? transactions.slice(0, limit) : transactions;
            } catch (e) {
                console.error('Failed to get transactions on web', e);
                return [];
            }
        }

        if (!this.db) await this.init();

        const query = limit
            ? `SELECT * FROM transactions ORDER BY date DESC LIMIT ${limit}`
            : `SELECT * FROM transactions ORDER BY date DESC`;

        const result = await this.db!.getAllAsync<any>(query);

        return result.map(row => ({
            id: row.id,
            amount: row.amount,
            currency: row.currency,
            date: row.date,
            type: row.type as TransactionType,
            category: row.category,
            merchant: row.merchant,
            sender: row.sender,
            recipient: row.recipient,
            rawMessage: row.rawMessage,
            source: row.source as 'SMS' | 'NOTIFICATION' | 'MANUAL',
            accountId: row.accountId,
            balanceSnapshot: row.balanceSnapshot,
            verified: row.verified === 1
        }));
    }

    static async getPendingTransactions(): Promise<Transaction[]> {
        if (isWeb) {
            // Web fallback
            const all = await this.getTransactions();
            return all.filter(t => t.verified === false);
        }

        if (!this.db) await this.init();

        const result = await this.db!.getAllAsync<any>(
            `SELECT * FROM transactions WHERE verified = 0 ORDER BY date DESC`
        );

        return result.map(row => ({
            id: row.id,
            amount: row.amount,
            currency: row.currency,
            date: row.date,
            type: row.type as TransactionType,
            category: row.category,
            merchant: row.merchant,
            sender: row.sender,
            recipient: row.recipient,
            rawMessage: row.rawMessage,
            source: row.source as 'SMS' | 'NOTIFICATION' | 'MANUAL',
            accountId: row.accountId,
            balanceSnapshot: row.balanceSnapshot,
            verified: false
        }));
    }

    static async deleteTransaction(id: string): Promise<void> {
        if (isWeb) {
            const transactions = await this.getTransactions();
            const filtered = transactions.filter(t => t.id !== id);
            await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
            return;
        }

        if (!this.db) await this.init();
        await this.db!.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
    }

    // Account methods
    static async saveAccount(account: Account): Promise<void> {
        if (isWeb) {
            const accounts = await this.getAccounts();
            const index = accounts.findIndex(a => a.id === account.id);
            if (index !== -1) {
                accounts[index] = account;
            } else {
                accounts.push(account);
            }
            await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
            return;
        }

        if (!this.db) await this.init();

        await this.db!.runAsync(
            `INSERT OR REPLACE INTO accounts (id, name, balance, currency, lastUpdated) 
       VALUES (?, ?, ?, ?, ?)`,
            [account.id, account.name, account.balance, account.currency, account.lastUpdated]
        );
    }

    static async getAccounts(): Promise<Account[]> {
        if (isWeb) {
            try {
                const json = await AsyncStorage.getItem(ACCOUNTS_KEY);
                return json ? JSON.parse(json) : [];
            } catch (e) {
                console.error('Failed to get accounts on web', e);
                return [];
            }
        }

        if (!this.db) await this.init();

        const result = await this.db!.getAllAsync<Account>(
            `SELECT * FROM accounts ORDER BY name`
        );

        return result;
    }

    static async updateAccount(name: string, balance: number, currency: string): Promise<void> {
        if (isWeb) {
            const accounts = await this.getAccounts();
            const existing = accounts.find(a => a.name === name);

            if (existing) {
                existing.balance = balance;
                existing.lastUpdated = Date.now();
            } else {
                accounts.push({
                    id: Date.now().toString(),
                    name,
                    balance,
                    currency,
                    lastUpdated: Date.now()
                });
            }
            await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
            return;
        }

        if (!this.db) await this.init();

        const existing = await this.db!.getFirstAsync<Account>(
            `SELECT * FROM accounts WHERE name = ?`, [name]
        );

        if (existing) {
            await this.db!.runAsync(
                `UPDATE accounts SET balance = ?, lastUpdated = ? WHERE name = ?`,
                [balance, Date.now(), name]
            );
        } else {
            await this.saveAccount({
                id: Date.now().toString(),
                name,
                balance,
                currency,
                lastUpdated: Date.now()
            });
        }
    }

    // Budget methods
    static async saveBudget(budget: Budget): Promise<void> {
        if (!this.db) await this.init();

        await this.db!.runAsync(
            `INSERT OR REPLACE INTO budgets 
       (id, monthlyLimit, currentSpending, alertThreshold, alertsEnabled, soundEnabled, vibrationEnabled) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                budget.id,
                budget.monthlyLimit,
                budget.currentSpending,
                budget.alertThreshold,
                budget.alertsEnabled ? 1 : 0,
                budget.soundEnabled ? 1 : 0,
                budget.vibrationEnabled ? 1 : 0
            ]
        );
    }

    static async getBudget(): Promise<Budget | null> {
        if (!this.db) await this.init();

        const result = await this.db!.getFirstAsync<any>(
            `SELECT * FROM budgets LIMIT 1`
        );

        if (!result) return null;

        return {
            id: result.id,
            monthlyLimit: result.monthlyLimit,
            currentSpending: result.currentSpending,
            alertThreshold: result.alertThreshold,
            alertsEnabled: result.alertsEnabled === 1,
            soundEnabled: result.soundEnabled === 1,
            vibrationEnabled: result.vibrationEnabled === 1
        };
    }

    static async clearAllData(): Promise<void> {
        if (!this.db) await this.init();

        await this.db!.execAsync(`
      DELETE FROM transactions;
      DELETE FROM accounts;
      DELETE FROM budgets;
    `);
    }
}
