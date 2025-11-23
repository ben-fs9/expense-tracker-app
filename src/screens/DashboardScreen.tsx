import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SQLiteService } from '../services/SQLiteService';
import { SmsService } from '../services/SmsService';
import { Transaction, Account } from '../models/types';
import { useIsFocused } from '@react-navigation/native';

export default function DashboardScreen({ navigation, route }: any) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [totalExpense, setTotalExpense] = useState(0);
    const isFocused = useIsFocused();

    const loadData = async () => {
        await SQLiteService.init();
        const data = await SQLiteService.getTransactions();
        const accs = await SQLiteService.getAccounts();
        const pending = await SQLiteService.getPendingTransactions();

        setTransactions(data.filter(t => t.verified !== false));
        setAccounts(accs);
        setPendingCount(pending.length);

        const total = data
            .filter((t) => t.type === 'DEBIT' && t.verified !== false)
            .reduce((sum, t) => sum + t.amount, 0);
        setTotalExpense(total);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Reload when screen comes into focus
    useEffect(() => {
        if (isFocused) {
            loadData();
        }
    }, [isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        await SmsService.syncInbox();
        await loadData();
        setRefreshing(false);
    };

    const handleSimulate = async () => {
        const sampleSMS = `Payment of GHS 50.00 to KFC Legon made. Current Balance: GHS 450.00. Available Balance: GHS 450.00. Reference: 123456789`;
        await SmsService.simulateSms(sampleSMS);
        await loadData(); // Reload data to show new transaction
        Alert.alert("Simulated SMS processed!");
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {pendingCount > 0 && (
                <TouchableOpacity
                    style={styles.pendingBanner}
                    onPress={() => navigation.navigate('Review')}
                >
                    <Text style={styles.pendingText}>
                        ⚠️ {pendingCount} transaction{pendingCount > 1 ? 's' : ''} need{pendingCount === 1 ? 's' : ''} review
                    </Text>
                    <Text style={styles.pendingAction}>Tap to review →</Text>
                </TouchableOpacity>
            )}

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Expenses (This Month)</Text>
                <Text style={styles.summaryAmount}>GHS {totalExpense.toFixed(2)}</Text>
                <TouchableOpacity onPress={handleSimulate} style={styles.simButton}>
                    <Text style={styles.simButtonText}>Simulate SMS (Dev)</Text>
                </TouchableOpacity>
            </View>

            {accounts.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Accounts</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {accounts.map((acc) => (
                            <View key={acc.id} style={styles.accountCard}>
                                <Text style={styles.accountName}>{acc.name}</Text>
                                <Text style={styles.accountBalance}>{acc.currency} {acc.balance.toFixed(2)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.slice(0, 5).map((t) => (
                    <View key={t.id} style={styles.transactionItem}>
                        <View>
                            <Text style={styles.merchant}>{t.merchant || t.recipient || 'Unknown'}</Text>
                            <Text style={styles.category}>{t.category}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.amount, t.type === 'DEBIT' ? styles.debit : styles.credit]}>
                                {t.type === 'DEBIT' ? '-' : '+'} GHS {t.amount.toFixed(2)}
                            </Text>
                            {t.balanceSnapshot !== undefined && (
                                <Text style={styles.balanceSnapshot}>Bal: {t.balanceSnapshot}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    summaryCard: {
        backgroundColor: '#6200ee',
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    summaryTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    summaryAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    accountCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginRight: 12,
        minWidth: 140,
    },
    accountName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    accountBalance: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    merchant: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    category: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    debit: {
        color: '#e53935',
    },
    credit: {
        color: '#43a047',
    },
    balanceSnapshot: {
        fontSize: 10,
        color: '#aaa',
    },
    pendingBanner: {
        backgroundColor: '#ff9800',
        padding: 16,
        margin: 16,
        marginBottom: 0,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pendingText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
    },
    pendingAction: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    simButton: {
        marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 8,
    },
    simButtonText: {
        color: '#fff',
        fontSize: 12,
    },
});
