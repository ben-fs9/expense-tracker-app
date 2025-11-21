import { Platform, PermissionsAndroid } from 'react-native';
import { TransactionParser } from './TransactionParser';
import { StorageService } from './StorageService';
import { CategorizationEngine } from './CategorizationEngine';
import { Transaction } from '../models/types';

// Conditionally require the module to avoid crashes on Web/iOS
let SmsAndroid: any;

if (Platform.OS === 'android') {
    try {
        SmsAndroid = require('react-native-get-sms-android');
    } catch (e) {
        console.warn('SMS modules not found (dev client required)');
    }
}

export class SmsService {
    static async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') return false;

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            ]);

            return (
                granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    static async syncInbox(): Promise<number> {
        if (Platform.OS !== 'android' || !SmsAndroid) {
            console.log('SMS Sync skipped: Not Android or module missing');
            return 0;
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return 0;

        return new Promise((resolve, reject) => {
            const filter = {
                box: 'inbox',
                maxCount: 100, // Limit to last 100 for now
            };

            SmsAndroid.list(
                JSON.stringify(filter),
                (fail: string) => {
                    console.error('Failed to list SMS:', fail);
                    resolve(0);
                },
                async (count: number, smsList: string) => {
                    const messages = JSON.parse(smsList);
                    let newTransactions = 0;
                    const engine = new CategorizationEngine();

                    for (const msg of messages) {
                        const parsed = TransactionParser.parse(msg.body, msg.date);
                        if (parsed) {
                            const transaction: Transaction = {
                                id: `sms_${msg._id}`,
                                amount: parsed.amount || 0,
                                currency: parsed.currency || 'GHS',
                                date: parsed.date || Date.now(),
                                type: parsed.type || 'DEBIT',
                                merchant: parsed.merchant,
                                sender: parsed.sender,
                                recipient: parsed.recipient,
                                rawMessage: msg.body,
                                source: 'SMS',
                                category: engine.categorize(parsed),
                                balanceSnapshot: parsed.balanceSnapshot,
                            };

                            const existing = await StorageService.getTransactions();
                            if (!existing.find(t => t.id === transaction.id)) {
                                await StorageService.saveTransaction(transaction);
                                if (parsed.accountName && parsed.balanceSnapshot !== undefined) {
                                    await StorageService.updateAccount(parsed.accountName, parsed.balanceSnapshot, parsed.currency || 'GHS');
                                }
                                newTransactions++;
                            }
                        }
                    }
                    resolve(newTransactions);
                }
            );
        });
    }

    static async simulateSms(body: string) {
        const engine = new CategorizationEngine();
        const parsed = TransactionParser.parse(body, Date.now());
        if (parsed) {
            const transaction: Transaction = {
                id: `sim_${Date.now()}`,
                amount: parsed.amount || 0,
                currency: parsed.currency || 'GHS',
                date: parsed.date || Date.now(),
                type: parsed.type || 'DEBIT',
                merchant: parsed.merchant,
                sender: parsed.sender,
                recipient: parsed.recipient,
                rawMessage: body,
                source: 'SMS',
                category: engine.categorize(parsed),
                balanceSnapshot: parsed.balanceSnapshot,
            };
            await StorageService.saveTransaction(transaction);
            if (parsed.accountName && parsed.balanceSnapshot !== undefined) {
                await StorageService.updateAccount(parsed.accountName, parsed.balanceSnapshot, parsed.currency || 'GHS');
            }
            return true;
        }
        return false;
    }
}
