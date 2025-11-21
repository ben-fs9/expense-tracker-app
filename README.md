# Financial Expense Tracker App

A mobile financial expense-tracking application that automatically extracts and categorizes user expenses. Built with React Native (Expo) and TypeScript.

## Features
- **Automated Parsing**: Extracts transaction details from SMS messages (Regex-based).
- **Categorization**: Automatically categorizes expenses (e.g., Food, Transport) based on keywords.
- **Dashboard**: Monthly expense summary and recent transactions.
- **Manual Entry**: Add cash or offline transactions manually.
- **Local Storage**: Data is stored locally on the device for privacy.

## Getting Started

### Prerequisites
- Node.js installed.
- [Expo Go](https://expo.dev/client) app installed on your physical device (iOS/Android), or an Emulator/Simulator set up.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ben-fs9/expense-tracker-app.git
   cd expense-tracker-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

#### Run on Web
```bash
npm run web
```
This will open the app in your browser.

#### Run on iOS (Mac only)
```bash
npm run ios
```
*Requires Xcode and Simulator installed.*

#### Run on Android
```bash
npm run android
```
*Requires Android Studio and Emulator installed.*

#### Run on Physical Device
1. Start the development server:
   ```bash
   npx expo start
   ```
2. Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).

## Project Structure
- `src/services`: Core logic (Parser, Categorization, Storage).
- `src/screens`: UI Screens (Dashboard, Add Transaction, List).
- `src/models`: TypeScript interfaces.
- `src/navigation`: App navigation setup.

## Testing
Run the parser test script to verify regex logic:
```bash
npx tsx test_parser.ts
```
