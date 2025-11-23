import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SQLiteService } from '../services/SQLiteService';
import { DEFAULT_CATEGORIES } from '../services/CategorizationEngine';
import { Transaction } from '../models/types';

export default function AddTransactionScreen({ navigation }: any) {
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Other');
    const [transactionType, setTransactionType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            const transaction: Transaction = {
                id: `manual_${Date.now()}`,
                amount: parseFloat(amount),
                currency: 'GHS',
                date: Date.now(),
                type: transactionType,
                category: selectedCategory,
                merchant: merchant || 'Manual Entry',
                rawMessage: notes || `Manual ${transactionType}: ${amount}`,
                source: 'MANUAL',
                verified: true,
            };

            await SQLiteService.init();
            await SQLiteService.saveTransaction(transaction);

            // Reset form
            setAmount('');
            setMerchant('');
            setNotes('');
            setSelectedCategory('Other');

            // Navigate to Dashboard and show success
            navigation.navigate('Dashboard', { refresh: Date.now() });

            // Show success alert after a brief delay
            setTimeout(() => {
                Alert.alert('Success', 'Transaction added successfully!');
            }, 300);
        } catch (error) {
            console.error('Error saving transaction:', error);
            Alert.alert('Error', 'Failed to save transaction. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Add Transaction</Text>
            </View>

            {/* Transaction Type Toggle */}
            <View style={styles.typeToggle}>
                <TouchableOpacity
                    style={[styles.typeButton, transactionType === 'DEBIT' && styles.typeButtonActive]}
                    onPress={() => setTransactionType('DEBIT')}
                >
                    <Text style={[styles.typeButtonText, transactionType === 'DEBIT' && styles.typeButtonTextActive]}>
                        Expense
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, transactionType === 'CREDIT' && styles.typeButtonActive]}
                    onPress={() => setTransactionType('CREDIT')}
                >
                    <Text style={[styles.typeButtonText, transactionType === 'CREDIT' && styles.typeButtonTextActive]}>
                        Income
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountSection}>
                <Text style={styles.currency}>GHS</Text>
                <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#ccc"
                />
            </View>

            {/* Merchant Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Merchant / Description</Text>
                <TextInput
                    style={styles.input}
                    value={merchant}
                    onChangeText={setMerchant}
                    placeholder="e.g., KFC, Uber, etc."
                    placeholderTextColor="#999"
                />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                    {DEFAULT_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryCard,
                                selectedCategory === cat.name && styles.categoryCardSelected,
                                { borderColor: cat.color }
                            ]}
                            onPress={() => setSelectedCategory(cat.name)}
                        >
                            <Text style={styles.categoryIcon}>{cat.icon}</Text>
                            <Text style={[
                                styles.categoryName,
                                selectedCategory === cat.name && { color: cat.color }
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any additional details..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>💾 Save Transaction</Text>
            </TouchableOpacity>
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
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    typeToggle: {
        flexDirection: 'row',
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    typeButtonActive: {
        backgroundColor: '#6200ee',
    },
    typeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 16,
    },
    currency: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#6200ee',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 150,
        textAlign: 'center',
    },
    inputGroup: {
        margin: 16,
        marginTop: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    notesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        width: '30%',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    categoryCardSelected: {
        borderWidth: 3,
        backgroundColor: '#f8f8ff',
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#6200ee',
        margin: 16,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
