export const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Food', keywords: ['restaurant', 'food', 'kfc', 'pizza', 'burger', 'cafe', 'lunch', 'dinner'], color: '#FF6B6B', icon: '🍔' },
    { id: '2', name: 'Transport', keywords: ['uber', 'bolt', 'taxi', 'fuel', 'petrol', 'transport', 'bus'], color: '#4ECDC4', icon: '🚗' },
    { id: '3', name: 'Bills', keywords: ['electricity', 'water', 'rent', 'bill', 'utility', 'ecg', 'gwcl'], color: '#95E1D3', icon: '📄' },
    { id: '4', name: 'Shopping', keywords: ['shop', 'store', 'mall', 'market', 'purchase'], color: '#F38181', icon: '🛍️' },
    { id: '5', name: 'Airtime/Data', keywords: ['airtime', 'data', 'bundle', 'mtn', 'vodafone', 'airteltigo'], color: '#AA96DA', icon: '📱' },
    { id: '6', name: 'Entertainment', keywords: ['movie', 'cinema', 'game', 'netflix', 'spotify', 'entertainment'], color: '#FCBAD3', icon: '🎬' },
    { id: '7', name: 'Health', keywords: ['hospital', 'pharmacy', 'doctor', 'medicine', 'clinic', 'health'], color: '#A8D8EA', icon: '🏥' },
    { id: '8', name: 'Education', keywords: ['school', 'fees', 'books', 'course', 'tuition', 'education'], color: '#FFD93D', icon: '📚' },
    { id: '9', name: 'Savings', keywords: ['savings', 'investment', 'deposit'], color: '#6BCB77', icon: '💰' },
    { id: '10', name: 'Other', keywords: [], color: '#95A5A6', icon: '📦' },
];

export class CategorizationEngine {
    private categories = DEFAULT_CATEGORIES;

    categorize(transaction: any): string {
        const text = (
            (transaction.merchant || '') +
            ' ' +
            (transaction.recipient || '') +
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

        return 'Other';
    }

    addCategory(name: string, keywords: string[], color: string, icon: string) {
        this.categories.push({
            id: Date.now().toString(),
            name,
            keywords,
            color,
            icon,
        });
    }

    updateCategory(id: string, keywords: string[]) {
        const category = this.categories.find((c) => c.id === id);
        if (category) {
            category.keywords = keywords;
        }
    }

    getCategories() {
        return this.categories;
    }
}
