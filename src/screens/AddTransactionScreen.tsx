import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StorageService } from '../services/StorageService';
import { CategorizationEngine } from '../services/CategorizationEngine';
import { Transaction } from '../models/types';

export default function AddTransactionScreen({ navigation }: any) {
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        const engine = new CategorizationEngine();
        const transaction: Transaction = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            currency: 'GHS',
            date: Date.now(),
            type: 'DEBIT',
            merchant: merchant,
            rawMessage: description,
            source: 'MANUAL',
            category: engine.categorize({ merchant, rawMessage: description }),
        };

        await StorageService.saveTransaction(transaction);
        Alert.alert('Success', 'Transaction saved');
        setAmount('');
        setMerchant('');
        setDescription('');
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Amount (GHS)</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
            />

            <Text style={styles.label}>Merchant / Payee</Text>
            <TextInput
                style={styles.input}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="e.g. McDonald's"
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Lunch"
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Transaction</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
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
        marginBottom: 24,
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: '#6200ee',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
