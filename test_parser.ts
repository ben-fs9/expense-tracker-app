import { TransactionParser } from './src/services/TransactionParser.ts';

const sampleMessages = [
    {
        text: "You have been debited with GHS 50.00 at KFC Osu on 2025-11-21. Available Balance: GHS 1000.00",
        expected: { amount: 50.00, merchant: "KFC Osu", type: 'DEBIT' }
    },
    {
        text: "Payment made for GHS 200.50 to MTN MobileMoney.",
        expected: { amount: 200.50, recipient: "MTN MobileMoney", type: 'DEBIT' }
    },
    {
        text: "Your account has been credited with GHS 1500.00 from SALARY.",
        expected: { amount: 1500.00, sender: "SALARY", type: 'CREDIT' }
    }
];

console.log("Running TransactionParser Tests...\n");

sampleMessages.forEach((sample, index) => {
    const result = TransactionParser.parse(sample.text, Date.now());
    console.log(`Test Case ${index + 1}:`);
    console.log(`Input: "${sample.text}"`);

    if (result) {
        console.log("Parsed Result:", JSON.stringify(result, null, 2));

        // Basic assertions
        const amountMatch = result.amount === sample.expected.amount;
        const typeMatch = result.type === sample.expected.type;
        // const merchantMatch = sample.expected.merchant ? result.merchant === sample.expected.merchant : true;

        if (amountMatch && typeMatch) {
            console.log("✅ PASS");
        } else {
            console.log("❌ FAIL");
        }
    } else {
        console.log("❌ FAILED TO PARSE");
    }
    console.log("---------------------------------------------------");
});
