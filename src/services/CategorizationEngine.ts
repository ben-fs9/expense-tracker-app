import { Category, Transaction } from '../models/types';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Food & Groceries', keywords: ['burger', 'pizza', 'restaurant', 'mart', 'groceries', 'food'], color: '#FF5733', icon: 'fast-food' },
    { id: '2', name: 'Transport', keywords: ['uber', 'bolt', 'yango', 'fuel', 'shell', 'total', 'transport'], color: '#33FF57', icon: 'car' },
    { id: '3', name: 'Bills & Utilities', keywords: ['ecg', 'gwcl', 'dstv', 'gotv', 'internet', 'data', 'airtime'], color: '#3357FF', icon: 'flash' },
    { id: '4', name: 'Shopping', keywords: ['mall', 'shop', 'store', 'clothing', 'shoes'], color: '#F333FF', icon: 'cart' },
    { id: '5', name: 'Savings', keywords: ['save', 'deposit', 'investment'], color: '#33FFF5', icon: 'wallet' },
    { id: '6', name: 'Fees & Charges', keywords: ['charge', 'fee', 'tax', 'levy'], color: '#FF3333', icon: 'cash' },
    { id: '7', name: 'Others', keywords: [], color: '#888888', icon: 'help' },
];

export class CategorizationEngine {
    private categories: Category[];

    constructor(categories: Category[] = DEFAULT_CATEGORIES) {
        this.categories = categories;
    }

    categorize(transaction: Partial<Transaction>): string {
        const text = (
            (transaction.merchant || '') +
            ' ' +
            (transaction.rawMessage || '')
        ).toLowerCase();

        for (const category of this.categories) {
            for (const keyword of category.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    return category.name;
                }
            }
        }

        return 'Others';
    }

    addCategory(category: Category) {
        this.categories.push(category);
    }

    updateCategory(category: Category) {
        const index = this.categories.findIndex((c) => c.id === category.id);
        if (index !== -1) {
            this.categories[index] = category;
        }
    }
}
