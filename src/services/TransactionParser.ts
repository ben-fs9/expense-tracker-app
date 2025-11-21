import { Transaction, TransactionType } from '../models/types';

interface ParsedData {
    amount: number | null;
    currency: string | null;
    date: number | null;
    type: TransactionType | null;
    merchant: string | null;
    sender: string | null;
    recipient: string | null;
    accountName: string | null;
    balance: number | null;
}

export class TransactionParser {
    private static patterns = [
        {
            name: 'Generic Debit with Balance',
            // Matches: "You have been debited with GHS 50.00 at KFC... Available Balance: GHS 1000.00"
            regex: /debited\s+with\s+([A-Z]{3})\s+(\d+\.?\d*)\s+at\s+(.+?)\s+on.*Available\s+Balance:\s+([A-Z]{3})\s+(\d+\.?\d*)/i,
            extract: (match: RegExpMatchArray): ParsedData => ({
                amount: parseFloat(match[2]),
                currency: match[1],
                date: null,
                type: 'DEBIT',
                merchant: match[3].trim(),
                sender: null,
                recipient: null,
                accountName: 'Main Account', // Default if not found, or infer from sender
                balance: parseFloat(match[5]),
            }),
        },
        {
            name: 'Mobile Money Payment',
            // Matches: "Payment made for GHS 200.00 to MTN... Current Balance: GHS 300.00"
            regex: /Payment\s+made\s+for\s+([A-Z]{3})\s+(\d+\.?\d*)\s+to\s+(.+?)\..*Balance:\s+([A-Z]{3})\s+(\d+\.?\d*)/i,
            extract: (match: RegExpMatchArray): ParsedData => ({
                amount: parseFloat(match[2]),
                currency: match[1],
                date: null,
                type: 'DEBIT',
                merchant: null,
                sender: null,
                recipient: match[3].trim(),
                accountName: 'Mobile Money',
                balance: parseFloat(match[5]),
            }),
        },
        {
            name: 'Bank Withdrawal',
            // Matches: "GHS 1000.00 withdrawn from Stanchart... Available Balance: GHS 20000.00"
            regex: /([A-Z]{3})\s+(\d+\.?\d*)\s+withdrawn\s+from\s+(.+?)\..*Balance:\s+([A-Z]{3})\s+(\d+\.?\d*)/i,
            extract: (match: RegExpMatchArray): ParsedData => ({
                amount: parseFloat(match[2]),
                currency: match[1],
                date: null,
                type: 'DEBIT',
                merchant: null,
                sender: null,
                recipient: null,
                accountName: match[3].trim(), // e.g., "Stanchart"
                balance: parseFloat(match[5]),
            }),
        },
        {
            name: 'Generic Credit',
            regex: /credited\s+with\s+([A-Z]{3})\s+(\d+\.?\d*)\s+from\s+(.+?)\./i,
            extract: (match: RegExpMatchArray): ParsedData => ({
                amount: parseFloat(match[2]),
                currency: match[1],
                date: null,
                type: 'CREDIT',
                merchant: null,
                sender: match[3].trim(),
                recipient: null,
                accountName: 'Main Account',
                balance: null,
            }),
        },
    ];

    static parse(message: string, timestamp: number): Partial<Transaction> & { accountName?: string, balance?: number } | null {
        for (const pattern of this.patterns) {
            const match = message.match(pattern.regex);
            if (match) {
                const data = pattern.extract(match);
                return {
                    amount: data.amount || 0,
                    currency: data.currency || 'GHS',
                    date: data.date || timestamp,
                    type: data.type || 'DEBIT',
                    merchant: data.merchant || undefined,
                    sender: data.sender || undefined,
                    recipient: data.recipient || undefined,
                    rawMessage: message,
                    source: 'SMS',
                    accountName: data.accountName || undefined,
                    balanceSnapshot: data.balance || undefined,
                };
            }
        }
        return null;
    }
}
