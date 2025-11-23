import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SQLiteService } from '../services/SQLiteService';
import { CategorizationEngine, DEFAULT_CATEGORIES } from '../services/CategorizationEngine';
import { Transaction } from '../models/types';

export default function ReviewTransactionScreen({ navigation }: any) {
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [editMode, setEditMode] = useState(false);

    // Edit form state
    const [editAmount, setEditAmount] = useState('');
    const [editMerchant, setEditMerchant] = useState('');
    const [editCategory, setEditCategory] = useState('');

    useEffect(() => {
        loadPendingTransactions();
    }, []);

    const loadPendingTransactions = async () => {
        const pending = await SQLiteService.getPendingTransactions();
        setPendingTransactions(pending);
        if (pending.length === 0) {
            navigation.goBack();
        }
    };

    const currentTransaction = pendingTransactions[currentIndex];

    const handleApprove = async () => {
        if (!currentTransaction) return;

        const approved: Transaction = {
            ...currentTransaction,
            verified: true
        };

        await SQLiteService.saveTransaction(approved);
        moveToNext();
    };

    const handleIncorrect = () => {
        if (!currentTransaction) return;

        setEditAmount(currentTransaction.amount.toString());
        setEditMerchant(currentTransaction.merchant || currentTransaction.recipient || '');
        setEditCategory(currentTransaction.category);
        setEditMode(true);
    };

    const handleSaveEdit = async () => {
        if (!currentTransaction) return;

        const edited: Transaction = {
            ...currentTransaction,
            amount: parseFloat(editAmount) || currentTransaction.amount,
            merchant: editMerchant || currentTransaction.merchant,
            category: editCategory || currentTransaction.category,
            verified: true
        };

        await SQLiteService.saveTransaction(edited);
        setEditMode(false);
        moveToNext();
    };

    const handleDelete = async () => {
        if (!currentTransaction) return;

        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await SQLiteService.deleteTransaction(currentTransaction.id);
                        moveToNext();
                    }
                }
            ]
        );
    };

    const moveToNext = () => {
        if (currentIndex < pendingTransactions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setEditMode(false);
        } else {
            navigation.goBack();
        }
    };

    if (!currentTransaction) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No pending transactions to review</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Review Transaction</Text>
                <Text style={styles.counterText}>
                    {currentIndex + 1} of {pendingTransactions.length}
                </Text>
            </View>

            {!editMode ? (
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Amount:</Text>
                        <Text style={[styles.value, styles.amount]}>
                            {currentTransaction.currency} {currentTransaction.amount.toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Type:</Text>
                        <Text style={[styles.value, currentTransaction.type === 'DEBIT' ? styles.debit : styles.credit]}>
                            {currentTransaction.type}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Merchant:</Text>
                        <Text style={styles.value}>
                            {currentTransaction.merchant || currentTransaction.recipient || 'Unknown'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Category:</Text>
                        <Text style={styles.value}>{currentTransaction.category}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>
                            {new Date(currentTransaction.date).toLocaleDateString()}
                        </Text>
                    </View>

                    {currentTransaction.balanceSnapshot !== undefined && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Balance After:</Text>
                            <Text style={styles.value}>
                                {currentTransaction.currency} {currentTransaction.balanceSnapshot.toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.messageBox}>
                        <Text style={styles.messageLabel}>Original Message:</Text>
                        <Text style={styles.messageText}>{currentTransaction.rawMessage}</Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                            <Text style={styles.approveButtonText}>✓ APPROVE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.incorrectButton} onPress={handleIncorrect}>
                            <Text style={styles.incorrectButtonText}>✎ INCORRECT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.editTitle}>Edit Transaction</Text>

                    <Text style={styles.inputLabel}>Amount</Text>
                    <TextInput
                        style={styles.input}
                        value={editAmount}
                        onChangeText={setEditAmount}
                        keyboardType="numeric"
                        placeholder="0.00"
                    />

                    <Text style={styles.inputLabel}>Merchant / Description</Text>
                    <TextInput
                        style={styles.input}
                        value={editMerchant}
                        onChangeText={setEditMerchant}
                        placeholder="Merchant name"
                    />

                    <Text style={styles.inputLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {DEFAULT_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    editCategory === cat.name && styles.categoryChipSelected
                                ]}
                                onPress={() => setEditCategory(cat.name)}
                            >
                                <Text style={styles.categoryChipText}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#6200ee',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    counterText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    amount: {
        fontSize: 18,
        color: '#6200ee',
    },
    debit: {
        color: '#e53935',
    },
    credit: {
        color: '#43a047',
    },
    messageBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 20,
    },
    messageLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 12,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    approveButton: {
        flex: 1,
        backgroundColor: '#43a047',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    approveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    incorrectButton: {
        flex: 1,
        backgroundColor: '#ff9800',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    incorrectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    editTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#fafafa',
    },
    categoryScroll: {
        marginBottom: 20,
    },
    categoryChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipSelected: {
        backgroundColor: '#6200ee',
    },
    categoryChipText: {
        fontSize: 14,
        color: '#333',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#6200ee',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#e53935',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#757575',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 100,
        fontSize: 16,
        color: '#666',
    },
});
