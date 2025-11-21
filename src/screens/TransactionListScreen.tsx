import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { StorageService } from '../services/StorageService';
import { Transaction } from '../models/types';
import { useIsFocused } from '@react-navigation/native';

export default function TransactionListScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadData();
        }
    }, [isFocused]);

    const loadData = async () => {
        const data = await StorageService.getTransactions();
        setTransactions(data);
    };

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={styles.item}>
            <View style={styles.leftCol}>
                <Text style={styles.merchant}>{item.merchant || item.recipient || 'Unknown'}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                <Text style={styles.category}>{item.category}</Text>
            </View>
            <View style={styles.rightCol}>
                <Text style={[styles.amount, item.type === 'DEBIT' ? styles.debit : styles.credit]}>
                    {item.type === 'DEBIT' ? '-' : '+'} {item.currency} {item.amount.toFixed(2)}
                </Text>
                <Text style={styles.source}>{item.source}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No transactions found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 16,
    },
    item: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftCol: {
        flex: 1,
    },
    rightCol: {
        alignItems: 'flex-end',
    },
    merchant: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    category: {
        fontSize: 12,
        color: '#6200ee',
        marginTop: 4,
        fontWeight: '500',
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
    source: {
        fontSize: 10,
        color: '#aaa',
        marginTop: 4,
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
    },
});
